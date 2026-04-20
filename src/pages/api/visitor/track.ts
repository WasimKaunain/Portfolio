import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z
  .object({
    path: z.string().min(1).max(300),
    referrer: z.string().max(500).optional().or(z.literal("")),
    tz: z.string().max(80).optional().or(z.literal("")),
    lang: z.string().max(40).optional().or(z.literal("")),
  })
  .strict();

function getIp(req: NextApiRequest) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length > 0) return xf.split(",")[0]!.trim();
  if (Array.isArray(xf) && xf[0]) return xf[0];
  return req.socket.remoteAddress ?? null;
}

// Minimal server-side "geolocation": based on the edge/cdn-added headers if present.
function getGeo(req: NextApiRequest) {
  const country = (req.headers["x-vercel-ip-country"] as string | undefined) ?? null;
  const region = (req.headers["x-vercel-ip-country-region"] as string | undefined) ?? null;
  const city = (req.headers["x-vercel-ip-city"] as string | undefined) ?? null;
  return { country, region, city };
}

// NOTE: This endpoint is public and intentionally best-effort.
// We only store anonymized-ish data (IP + coarse geo from CDN headers).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: "invalid_body" });

  try {
    const ip = getIp(req);
    const ua = (req.headers["user-agent"] as string | undefined) ?? null;
    const { country, region, city } = getGeo(req);

    // Prisma client may not yet include this model in editor typings depending on schema cache.
    const prismaAny = prisma as unknown as {
      visitorEvent: {
        create: (args: any) => Promise<any>;
      };
    };

    await prismaAny.visitorEvent.create({
      data: {
        path: parsed.data.path,
        referrer: parsed.data.referrer || null,
        tz: parsed.data.tz || null,
        lang: parsed.data.lang || null,
        ip,
        userAgent: ua,
        country,
        region,
        city,
      },
    });

    return res.status(200).json({ ok: true });
  } catch {
    // Never break the public page if logging fails.
    return res.status(200).json({ ok: true });
  }
}
