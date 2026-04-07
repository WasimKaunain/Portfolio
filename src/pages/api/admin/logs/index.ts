import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { writeApiLog } from "@/lib/admin/auditLog";

const querySchema = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
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

  const { cursor, take } = parsed.data;

  try {
    const logs = await prisma.apiLog.findMany({
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = logs.length > take;
    const items = hasMore ? logs.slice(0, take) : logs;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    await writeApiLog(req, res, 200);
    return res.status(200).json({ ok: true, logs: items, nextCursor });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
