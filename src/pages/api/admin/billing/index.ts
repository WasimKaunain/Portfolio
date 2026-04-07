import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { writeApiLog } from "@/lib/admin/auditLog";

const querySchema = z.object({
  userId: z.string().min(1).default("owner"),
  take: z.coerce.number().int().min(1).max(120).default(12),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireOwnerApi(req, res);
  if (!session) return;

  if (req.method !== "GET") {
    await writeApiLog(req, res, 405);
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    await writeApiLog(req, res, 400);
    return res.status(400).json({ ok: false, error: "invalid_query", issues: parsed.error.issues });
  }

  const { userId, take } = parsed.data;

  try {
    const records = await prisma.billingRecord.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take,
    });

    const totals = await prisma.billingRecord.aggregate({
      where: { userId },
      _sum: { usage: true, costCents: true },
      _count: true,
    });

    await writeApiLog(req, res, 200);
    return res.status(200).json({
      ok: true,
      userId,
      totals: {
        count: totals._count,
        usage: totals._sum.usage ?? 0,
        costCents: totals._sum.costCents ?? 0,
      },
      records,
    });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
