import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { apiRateLimiter } from "@/lib/rateLimit";

const bodySchema = z
  .object({
    name: z.string().min(1).max(80),
    email: z.string().email().max(120),
    budget: z.string().max(80).optional().or(z.literal("")),
    message: z.string().min(10).max(2000),
    companyWebsite: z.string().max(200).optional().or(z.literal("")), // honeypot
  })
  .strict();

// Fallback limiter when Upstash isn't configured (best-effort; resets on server restart).
const mem = new Map<string, { count: number; resetAt: number }>();
function memLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const cur = mem.get(key);
  if (!cur || cur.resetAt < now) {
    mem.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }
  if (cur.count >= max) return { success: false };
  cur.count += 1;
  return { success: true };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  // Rate limit first
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown");
  if (apiRateLimiter) {
    const rl = await apiRateLimiter.limit(`contact:${ip}`);
    if (!rl.success) return res.status(429).json({ ok: false, error: "rate_limited" });
  } else {
    const rl = memLimit(`contact:${ip}`, 8, 60_000); // 8/min
    if (!rl.success) return res.status(429).json({ ok: false, error: "rate_limited" });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: "invalid_body" });

  // Honeypot: if filled, act as success to not inform bots.
  if (parsed.data.companyWebsite && parsed.data.companyWebsite.trim().length > 0) {
    return res.status(200).json({ ok: true, delivered: false });
  }

  const to = env.CONTACT_TO_EMAIL ?? "wasimkonain@gmail.com";

  // If Resend isn't configured, we still respond OK so the UI works in local/dev.
  if (!env.RESEND_API_KEY) {
    return res.status(200).json({ ok: true, delivered: false });
  }

  const resend = new Resend(env.RESEND_API_KEY);

  try {
    const { name, email, message, budget } = parsed.data;

    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to,
      replyTo: email,
      subject: `New freelance inquiry — ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        budget ? `Budget: ${budget}` : undefined,
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return res.status(200).json({ ok: true, delivered: true });
  } catch {
    return res.status(500).json({ ok: false, error: "email_failed" });
  }
}
