import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { requireOwnerApi } from "@/lib/admin/apiAuth";
import { prisma } from "@/lib/prisma";
import { writeApiLog } from "@/lib/admin/auditLog";
import { env } from "@/lib/env";

const bodySchema = z.object({
  username: z.string().min(1),
});

type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  topics?: string[];
  homepage?: string | null;
  language?: string | null;
  default_branch?: string | null;
};

function decodeBase64Utf8(input: string) {
  // GitHub returns base64 with newlines.
  const cleaned = input.replace(/\n/g, "").trim();
  return Buffer.from(cleaned, "base64").toString("utf8");
}

function firstParagraphFromReadme(md: string) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");

  // Skip initial empty lines, headings, and badges. Grab the first real paragraph.
  const out: string[] = [];
  let started = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!started) {
      if (!line) continue;
      if (line.startsWith("#")) continue;
      if (/^\!\[.*\]\(.*\)$/.test(line)) continue;
      if (/^\[\!\[.*\]\(.*\)\]\(.*\)$/.test(line)) continue;
      if (line.startsWith("[!") || line.includes("shields.io")) continue;
      started = true;
    }

    if (started) {
      if (!line) break;
      out.push(line);
      if (out.join(" ").length > 420) break;
    }
  }

  return out.join(" ").trim();
}

async function fetchReadmeIntro(owner: string, repo: string, headers: Record<string, string>) {
  // REST: Get a repository README
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`;
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  const j = (await res.json()) as { content?: string };
  if (!j?.content) return null;
  const md = decodeBase64Utf8(j.content);
  const p = firstParagraphFromReadme(md);
  return p || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireOwnerApi(req, res);
  if (!session) return;

  try {
    if (req.method !== "POST") {
      await writeApiLog(req, res, 405);
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      await writeApiLog(req, res, 400);
      return res.status(400).json({ ok: false, error: "invalid_body", issues: parsed.error.issues });
    }

    const url = `https://api.github.com/users/${encodeURIComponent(parsed.data.username)}/repos?per_page=100&sort=updated`;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "portfolio-control-center",
    };

    // If provided, this avoids GitHub's unauthenticated rate limit (60/hr).
    if (env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
      headers["X-GitHub-Api-Version"] = "2022-11-28";
    }

    const ghRes = await fetch(url, { headers });

    if (!ghRes.ok) {
      const reset = ghRes.headers.get("x-ratelimit-reset");
      const remaining = ghRes.headers.get("x-ratelimit-remaining");
      let message: string | undefined;
      try {
        const j = (await ghRes.json()) as { message?: string };
        message = j?.message;
      } catch {
        // ignore
      }

      await writeApiLog(req, res, 502);
      return res.status(502).json({
        ok: false,
        error: "github_fetch_failed",
        status: ghRes.status,
        message,
        rateLimit: reset || remaining ? { remaining, reset } : undefined,
      });
    }

    const repos = (await ghRes.json()) as GithubRepo[];

    // Fetch README intros with a small concurrency limit.
    const concurrency = 6;
    const readmeIntro = new Map<string, string | null>();

    async function worker(chunk: GithubRepo[]) {
      for (const r of chunk) {
        const [owner, repo] = r.full_name.split("/");
        const key = `${owner}/${repo}`;
        const intro = await fetchReadmeIntro(owner, repo, headers);
        readmeIntro.set(key, intro);
      }
    }

    const buckets: GithubRepo[][] = Array.from({ length: concurrency }, () => []);
    repos.forEach((r, idx) => buckets[idx % concurrency].push(r));
    await Promise.all(buckets.map(worker));

    const repoByKey = new Map<string, GithubRepo>();
    for (const r of repos) {
      const [owner, repo] = r.full_name.split("/");
      repoByKey.set(`${owner}/${repo}`, r);
    }

    const upserts: Array<ReturnType<typeof prisma.project.upsert>> = repos.map((r) => {
      const [owner, repo] = r.full_name.split("/");
      const key = `${owner}/${repo}`;
      const intro = readmeIntro.get(key) ?? null;

      return prisma.project.upsert({
        where: {
          githubOwner_githubRepo: {
            githubOwner: owner,
            githubRepo: repo,
          },
        },
        create: {
          slug: r.name,
          title: r.name,
          description: intro ?? r.description ?? "",
          tech: [r.language].filter(Boolean) as string[],
          githubOwner: owner,
          githubRepo: repo,
          githubUrl: r.html_url,
          exploreUrl: r.html_url,
          hidden: false,
        },
        update: {
          title: r.name,
          tech: [r.language].filter(Boolean) as string[],
          githubUrl: r.html_url,
        },
      });
    });

    // Fill missing description/exploreUrl without overwriting admin edits.
    const results = await prisma.$transaction(
      upserts.map((q) =>
        q.then(async (p: Awaited<ReturnType<typeof prisma.project.upsert>>) => {
          const [owner, repo] = [p.githubOwner, p.githubRepo];
          if (!owner || !repo) return p;
          const key = `${owner}/${repo}`;

          const intro = readmeIntro.get(key) ?? null;
          const homepage = repoByKey.get(key)?.homepage ?? null;

          const updates: Array<Promise<unknown>> = [];

          if (intro) {
            updates.push(
              prisma.project.updateMany({
                where: { id: p.id, description: "" },
                data: { description: intro },
              })
            );
          }

          if (homepage) {
            updates.push(
              prisma.project.updateMany({
                where: { id: p.id, exploreUrl: null },
                data: { exploreUrl: homepage },
              })
            );
          }

          if (updates.length) await Promise.all(updates);
          return p;
        })
      )
    );

    await writeApiLog(req, res, 200);
    return res.status(200).json({ ok: true, count: results.length });
  } catch {
    await writeApiLog(req, res, 500);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
