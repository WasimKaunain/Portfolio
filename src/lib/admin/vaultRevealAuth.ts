import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

const COOKIE_NAME = "vault_reveal";

function b64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function b64urlToBuf(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

function sign(data: string, secret: string) {
  return b64url(crypto.createHmac("sha256", secret).update(data).digest());
}

export function setVaultRevealCookie(res: NextApiResponse, opts: { ttlMinutes: number; signatureSecret: string }) {
  const now = Date.now();
  const exp = now + opts.ttlMinutes * 60_000;
  const payload = `${exp}`;
  const sig = sign(payload, opts.signatureSecret);
  const value = `${payload}.${sig}`;

  const maxAge = Math.floor((exp - now) / 1000);
  res.setHeader("Set-Cookie", [
    `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`,
  ]);
}

export function clearVaultRevealCookie(res: NextApiResponse) {
  res.setHeader("Set-Cookie", [`${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`]);
}

export function hasVaultReveal(req: NextApiRequest, signatureSecret: string): boolean {
  const cookie = req.headers.cookie ?? "";
  const m = cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  if (!m) return false;
  const value = decodeURIComponent(m[1]);
  const [expStr, sig] = value.split(".");
  if (!expStr || !sig) return false;

  const expected = sign(expStr, signatureSecret);
  // timing-safe compare
  const a = b64urlToBuf(sig);
  const b = b64urlToBuf(expected);
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return false;
  if (Date.now() > exp) return false;
  return true;
}
