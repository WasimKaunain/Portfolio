import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function requireOwnerApi(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ ok: false, error: "unauthenticated" });
    return null;
  }
  if (!session.isOwner) {
    res.status(403).json({ ok: false, error: "forbidden" });
    return null;
  }
  return session;
}
