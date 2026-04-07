import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { writeApiLog } from "@/lib/admin/auditLog";

const idSchema = z.object({
  id: z.string().min(1),
});

const patchSchema = z
  .object({
    // relaxed for PATCH: allow almost any non-empty string; normalize whitespace.
    slug: z
      .preprocess(
        (val) => {
          if (typeof val !== "string") return val;
          return val.trim().replace(/\s+/g, "-");
        },
        z.string().min(1).max(64)
      )
      .optional(),
    title: z.string().min(1).max(120).optional(),

    // allow clearing description from the UI ("" -> null)
    description: z
      .preprocess(
        (val) => {
          if (val === "") return null;
          return val;
        },
        z.string().min(1).max(500).nullable().optional()
      ),

    tech: z.array(z.string().min(1).max(40)).max(50).optional(),
    hidden: z.boolean().optional(),

    // allow clearing explore URL from the UI ("" -> null)
    exploreUrl: z.preprocess(
      (val) => {
        if (val === "") return null;
        return val;
      },
      z.string().url().nullable().optional()
    ),
  })
  .strict();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireOwnerApi(req, res);
  if (!session) return;

  const parsedId = idSchema.safeParse(req.query);
  if (!parsedId.success) {
    await writeApiLog(req, res, 400);
    return res.status(400).json({ ok: false, error: "invalid_id" });
  }

  const { id } = parsedId.data;

  try {
    if (req.method === "GET") {
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        await writeApiLog(req, res, 404);
        return res.status(404).json({ ok: false, error: "not_found" });
      }
      await writeApiLog(req, res, 200);
      return res.status(200).json({ ok: true, project });
    }

    if (req.method === "PATCH") {
      const parsed = patchSchema.safeParse(req.body);
      if (!parsed.success) {
        await writeApiLog(req, res, 400);
        return res.status(400).json({ ok: false, error: "invalid_body", issues: parsed.error.issues });
      }

      const updated = await prisma.project.update({
        where: { id },
        data: parsed.data,
      });

      await writeApiLog(req, res, 200);
      return res.status(200).json({ ok: true, project: updated });
    }

    if (req.method === "DELETE") {
      await prisma.project.delete({ where: { id } });
      await writeApiLog(req, res, 204);
      return res.status(204).end();
    }

    await writeApiLog(req, res, 405);
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
