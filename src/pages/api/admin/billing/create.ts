import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { writeApiLog } from "@/lib/admin/auditLog";

const bodySchema = z.object({
  userId: z.string().min(1).default("owner"),
  usage: z.number().int().min(0),
  costCents: z.number().int().min(0),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireOwnerApi(req, res);
  if (!session) return;

  if (req.method !== "POST") {
    await writeApiLog(req, res, 405);
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    await writeApiLog(req, res, 400);
    return res.status(400).json({ ok: false, error: "invalid_body", issues: parsed.error.issues });
  }

  try {
    const record = await prisma.billingRecord.create({
      data: parsed.data,
    });
    await writeApiLog(req, res, 201);
    return res.status(201).json({ ok: true, record });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
