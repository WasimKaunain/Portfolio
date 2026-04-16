import type { NextApiRequest, NextApiResponse } from "next";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { clearVaultRevealCookie } from "@/lib/admin/vaultRevealAuth";
import { writeApiLog } from "@/lib/admin/auditLog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireOwnerApi(req, res);
  if (!session) return;

  try {
    if (req.method !== "POST") {
      await writeApiLog(req, res, 405);
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    clearVaultRevealCookie(res);
    await writeApiLog(req, res, 200);
    return res.status(200).json({ ok: true });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
