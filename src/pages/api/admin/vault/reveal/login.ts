import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { env } from "@/lib/env";
import crypto from "crypto";
import { setVaultRevealCookie } from "@/lib/admin/vaultRevealAuth";
import { writeApiLog } from "@/lib/admin/auditLog";

const bodySchema = z
  .object({
    password: z.string().min(1).max(200),
  })
  .strict();

function sha256Hex(v: string) {
  return crypto.createHash("sha256").update(v).digest("hex");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireOwnerApi(req, res);
  if (!session) return;

  try {
    if (req.method !== "POST") {
      await writeApiLog(req, res, 405);
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      await writeApiLog(req, res, 400);
      return res.status(400).json({ ok: false, error: "invalid_body" });
    }

    const attempted = sha256Hex(parsed.data.password);
    if (attempted !== env.VAULT_REVEAL_PASSWORD_HASH) {
      await writeApiLog(req, res, 403);
      return res.status(403).json({ ok: false, error: "invalid_password" });
    }

    setVaultRevealCookie(res, {
      ttlMinutes: 10,
      signatureSecret: env.VAULT_REVEAL_SIGNING_SECRET,
    });

    await writeApiLog(req, res, 200);
    return res.status(200).json({ ok: true, ttlMinutes: 10 });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
