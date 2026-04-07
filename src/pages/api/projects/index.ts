import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRateLimiter } from '../../../lib/rateLimit';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (apiRateLimiter) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const rl = await apiRateLimiter.limit(String(ip));
    if (!rl.success) return res.status(429).json({ error: 'rate_limited' });
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  const projects = await prisma.project.findMany({
    where: { hidden: false },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      tech: true,
      githubUrl: true,
      githubOwner: true,
      githubRepo: true,
      exploreUrl: true,
      createdAt: true,
    },
  });

  return res.status(200).json({ projects });
}
