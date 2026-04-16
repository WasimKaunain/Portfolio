import type { NextApiRequest, NextApiResponse } from "next";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { env } from "@/lib/env";
import { hasVaultReveal } from "@/lib/admin/vaultRevealAuth";
import { writeApiLog } from "@/lib/admin/auditLog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireOwnerApi(req, res);
  if (!session) return;

  try {
    if (req.method !== "GET") {
      await writeApiLog(req, res, 405);
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    // If signing secret isn't configured, treat as locked (and avoid passing undefined to hasVaultReveal)
    const ok = env.VAULT_REVEAL_SIGNING_SECRET
      ? hasVaultReveal(req, env.VAULT_REVEAL_SIGNING_SECRET)
      : false;

    await writeApiLog(req, res, 200);
    return res.status(200).json({ ok: true, unlocked: ok });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
