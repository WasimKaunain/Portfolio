import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export async function writeApiLog(
  req: NextApiRequest,
  res: NextApiResponse,
  status: number,
) {
  try {
    const route = (req.url ?? "").split("?")[0] || "unknown";
    const method = req.method ?? "UNKNOWN";

    await prisma.apiLog.create({
      data: {
        route,
        method,
        status,
      },
    });
  } catch {
    // Best-effort only: never crash API route due to logging failures.
  }
}
