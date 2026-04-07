import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ ok: false, error: 'unauthenticated' });
  if (!session.isOwner) return res.status(403).json({ ok: false, error: 'forbidden' });

  return res.status(200).json({ ok: true, email: session.user?.email });
}
