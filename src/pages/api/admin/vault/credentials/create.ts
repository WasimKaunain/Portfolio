import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { writeApiLog } from "@/lib/admin/auditLog";
import { encryptSecret } from "@/lib/crypto/vaultCrypto";

const bodySchema = z
  .object({
    vaultProjectId: z.string().min(1),
    label: z.string().min(1).max(120),
    kind: z.string().min(1).max(40).default("api_key"),
    provider: z.string().max(60).optional().or(z.literal("")),
    identifier: z.string().max(120).optional().or(z.literal("")),
    metaJson: z.string().max(10000).optional().or(z.literal("")),
    secret: z.string().max(10000).optional().or(z.literal("")),
  })
  .strict();

// NOTE: Some editors can temporarily show an outdated PrismaClient type after schema changes.
const prismaAny = prisma as unknown as {
  vaultCredential: {
    create: (args: any) => Promise<any>;
  };
  deploymentVaultProject: {
    findUnique: (args: any) => Promise<any | null>;
  };
};

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

    const vp = await prismaAny.deploymentVaultProject.findUnique({
      where: { id: parsed.data.vaultProjectId },
      select: { id: true },
    });
    if (!vp) {
      await writeApiLog(req, res, 404);
      return res.status(404).json({ ok: false, error: "vault_project_not_found" });
    }

    const provider = (parsed.data.provider ?? "").trim() || null;
    const identifier = (parsed.data.identifier ?? "").trim() || null;
    const metaJson = (parsed.data.metaJson ?? "").trim() || null;
    const secret = (parsed.data.secret ?? "").trim();

    const enc = secret ? encryptSecret(secret) : null;

    const created = await prismaAny.vaultCredential.create({
      data: {
        vaultProjectId: parsed.data.vaultProjectId,
        label: parsed.data.label,
        kind: parsed.data.kind,
        provider,
        identifier,
        metaJson,
        ...(enc
          ? {
              secretEnc: enc.secretEnc,
              secretIv: enc.secretIv,
              secretTag: enc.secretTag,
            }
          : {}),
      },
      select: {
        id: true,
        label: true,
        kind: true,
        provider: true,
        identifier: true,
        metaJson: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await writeApiLog(req, res, 201);
    return res.status(201).json({ ok: true, credential: created });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
