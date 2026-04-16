import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { env } from "@/lib/env";
import { hasVaultReveal } from "@/lib/admin/vaultRevealAuth";
import { decryptSecret } from "@/lib/crypto/vaultCrypto";
import { writeApiLog } from "@/lib/admin/auditLog";

// NOTE: Some editors can temporarily show an outdated PrismaClient type after schema changes.
// This cast is safe because `prisma.vaultCredential` is generated (see node_modules/.prisma/client/index.d.ts).
type VaultCredentialRow = {
  id: string;
  secretEnc: string | null;
  secretIv: string | null;
  secretTag: string | null;
};
const prismaAny = prisma as unknown as {
  vaultCredential: {
    findUnique: (args: { where: { id: string } }) => Promise<VaultCredentialRow | null>;
  };
};

const querySchema = z.object({ id: z.string().min(1) });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireOwnerApi(req, res);
  if (!session) return;

  try {
    if (req.method !== "GET") {
      await writeApiLog(req, res, 405);
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      await writeApiLog(req, res, 400);
      return res.status(400).json({ ok: false, error: "invalid_id" });
    }

    // If signing secret isn't configured, treat as locked.
    if (!env.VAULT_REVEAL_SIGNING_SECRET || !hasVaultReveal(req, env.VAULT_REVEAL_SIGNING_SECRET)) {
      await writeApiLog(req, res, 403);
      return res.status(403).json({ ok: false, error: "vault_locked" });
    }

    const cred = await prismaAny.vaultCredential.findUnique({ where: { id: parsed.data.id } });
    if (!cred) {
      await writeApiLog(req, res, 404);
      return res.status(404).json({ ok: false, error: "not_found" });
    }

    if (!cred.secretEnc || !cred.secretIv || !cred.secretTag) {
      await writeApiLog(req, res, 200);
      return res.status(200).json({ ok: true, secret: null });
    }

    const secret = decryptSecret({
      secretEnc: cred.secretEnc,
      secretIv: cred.secretIv,
      secretTag: cred.secretTag,
    });

    await writeApiLog(req, res, 200);
    return res.status(200).json({ ok: true, secret });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
