import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { writeApiLog } from "@/lib/admin/auditLog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireOwnerApi(req, res);
  if (!session) return;

  try {
    if (req.method !== "GET") {
      await writeApiLog(req, res, 405);
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        githubOwner: true,
        githubRepo: true,
      },
    });

    await writeApiLog(req, res, 200);
    return res.status(200).json({ ok: true, projects });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
