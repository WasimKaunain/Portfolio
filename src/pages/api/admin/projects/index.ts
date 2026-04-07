import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { writeApiLog } from "@/lib/admin/auditLog";

const createSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(64)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(500),
    tech: z.array(z.string().min(1).max(40)).max(50).optional(),
    // Back-compat: some clients used `tags`
    tags: z.array(z.string().min(1).max(40)).max(50).optional(),
    hidden: z.boolean().optional(),
  })
  .strict();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireOwnerApi(req, res);
  if (!session) return;

  try {
    if (req.method === "GET") {
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
      });
      await writeApiLog(req, res, 200);
      return res.status(200).json({ ok: true, projects });
    }

    if (req.method === "POST") {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        await writeApiLog(req, res, 400);
        return res.status(400).json({ ok: false, error: "invalid_body", issues: parsed.error.issues });
      }

      const created = await prisma.project.create({
        data: {
          slug: parsed.data.slug,
          title: parsed.data.title,
          description: parsed.data.description,
          tech: parsed.data.tech ?? parsed.data.tags ?? [],
          hidden: parsed.data.hidden ?? false,
        },
      });

      await writeApiLog(req, res, 201);
      return res.status(201).json({ ok: true, project: created });
    }

    await writeApiLog(req, res, 405);
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
