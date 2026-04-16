import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { writeApiLog } from "@/lib/admin/auditLog";

const querySchema = z.object({ id: z.string().min(1) });

const patchSchema = z
  .object({
    status: z.string().min(1).max(40).optional(),
    productionUrl: z
      .preprocess((v) => {
        if (v === "") return null;
        return v;
      }, z.string().url().nullable().optional()),
    notes: z
      .preprocess((v) => {
        if (v === "") return null;
        return v;
      }, z.string().max(5000).nullable().optional()),
  })
  .strict();

// NOTE: Some editors can temporarily show an outdated PrismaClient type after schema changes.
const prismaAny = prisma as unknown as {
  deploymentVaultProject: {
    findUnique: (args: any) => Promise<any | null>;
    update: (args: any) => Promise<any>;
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireOwnerApi(req, res);
  if (!session) return;

  const parsedQ = querySchema.safeParse(req.query);
  if (!parsedQ.success) {
    await writeApiLog(req, res, 400);
    return res.status(400).json({ ok: false, error: "invalid_id" });
  }

  const id = parsedQ.data.id;

  try {
    if (req.method === "GET") {
      const item = await prismaAny.deploymentVaultProject.findUnique({
        where: { id },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              tech: true,
              githubOwner: true,
              githubRepo: true,
              exploreUrl: true,
            },
          },
          credentials: {
            orderBy: { updatedAt: "desc" },
            select: {
              id: true,
              label: true,
              kind: true,
              provider: true,
              identifier: true,
              metaJson: true,
              // show whether it has a secret without exposing it
              secretEnc: true,
              updatedAt: true,
              createdAt: true,
            },
          },
        },
      });

      if (!item) {
        await writeApiLog(req, res, 404);
        return res.status(404).json({ ok: false, error: "not_found" });
      }

      // mask secretEnc to boolean on the wire
      const safe = {
        ...item,
        credentials: (item.credentials ?? []).map((c: any) => ({
          ...c,
          hasSecret: Boolean(c.secretEnc),
          secretEnc: undefined,
        })),
      };

      await writeApiLog(req, res, 200);
      return res.status(200).json({ ok: true, item: safe });
    }

    if (req.method === "PATCH") {
      const parsed = patchSchema.safeParse(req.body);
      if (!parsed.success) {
        await writeApiLog(req, res, 400);
        return res.status(400).json({ ok: false, error: "invalid_body" });
      }

      const updated = await prismaAny.deploymentVaultProject.update({
        where: { id },
        data: parsed.data,
        select: { id: true, status: true, productionUrl: true, notes: true, updatedAt: true },
      });

      await writeApiLog(req, res, 200);
      return res.status(200).json({ ok: true, item: updated });
    }

    await writeApiLog(req, res, 405);
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
