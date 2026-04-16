import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { writeApiLog } from "@/lib/admin/auditLog";

const bodySchema = z
  .object({
    projectId: z.string().min(1),
  })
  .strict();

// NOTE: Some editors can temporarily show an outdated PrismaClient type after schema changes.
const prismaAny = prisma as unknown as {
  deploymentVaultProject: {
    findUnique: (args: any) => Promise<any | null>;
    create: (args: any) => Promise<any>;
  };
  project: {
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

    const project = await prismaAny.project.findUnique({
      where: { id: parsed.data.projectId },
      select: { id: true },
    });
    if (!project) {
      await writeApiLog(req, res, 404);
      return res.status(404).json({ ok: false, error: "project_not_found" });
    }

    const existing = await prismaAny.deploymentVaultProject.findUnique({
      where: { projectId: parsed.data.projectId },
      select: { id: true },
    });
    if (existing) {
      await writeApiLog(req, res, 200);
      return res.status(200).json({ ok: true, already: true, id: existing.id });
    }

    const created = await prismaAny.deploymentVaultProject.create({
      data: {
        projectId: parsed.data.projectId,
        status: "live",
      },
      select: { id: true },
    });

    await writeApiLog(req, res, 201);
    return res.status(201).json({ ok: true, already: false, id: created.id });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
