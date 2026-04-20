import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().min(1).max(50).default(10),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ ok: false, error: "invalid_query" });

  try {
    const prismaAny = prisma as unknown as {
      visitorEvent: {
        count: (args?: any) => Promise<number>;
        findMany: (args: any) => Promise<any[]>;
      };
    };

    const total = await prismaAny.visitorEvent.count();

    const rows = await prismaAny.visitorEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: parsed.data.take + 1,
      ...(parsed.data.cursor ? { cursor: { id: parsed.data.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        createdAt: true,
        path: true,
        country: true,
        region: true,
        city: true,
      },
    });

    const hasMore = rows.length > parsed.data.take;
    const items = hasMore ? rows.slice(0, parsed.data.take) : rows;
    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    return res.status(200).json({ ok: true, total, items, nextCursor });
  } catch {
    return res.status(200).json({ ok: true, total: 0, items: [], nextCursor: null });
  }
}
