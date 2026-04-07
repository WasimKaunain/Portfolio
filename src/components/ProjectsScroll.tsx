"use client";

import React from "react";
import { motion } from "framer-motion";

type PublicProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tech: string[];
  githubUrl: string | null;
  githubOwner: string | null;
  githubRepo: string | null;
  exploreUrl?: string | null;
};

const accents = [
  { a: "bg-orange-500/20", b: "bg-yellow-400/14" },
  { a: "bg-emerald-400/18", b: "bg-lime-400/12" },
  { a: "bg-amber-400/18", b: "bg-orange-500/12" },
  { a: "bg-lime-400/16", b: "bg-emerald-400/12" },
  { a: "bg-yellow-300/18", b: "bg-amber-500/12" },
  { a: "bg-green-400/16", b: "bg-yellow-300/12" },
];

function getPreviewImageSrc(exploreUrl?: string | null) {
  if (!exploreUrl) return null;
  try {
    const u = new URL(exploreUrl);
    // WordPress mShots: simple, no key. Works for most public URLs.
    return `https://s0.wp.com/mshots/v1/${encodeURIComponent(u.href)}?w=1200`;
  } catch {
    return null;
  }
}

const titleStyles = [
  "text-yellow-300",
  "text-orange-300",
  "text-emerald-300",
  "text-red-300",
  "text-lime-300",
  "text-amber-300",
];

function ProjectGridCard({ p, index }: { p: PublicProject; index: number }) {
  const repoName = p.githubRepo ?? p.title;
  const subtitle = p.description || "No description yet. Add one in admin.";
  const accent = accents[index % accents.length];
  const titleColor = titleStyles[index % titleStyles.length];

  const githubHref =
    p.githubUrl && p.githubUrl.startsWith("http")
      ? p.githubUrl
      : p.githubOwner && p.githubRepo
        ? `https://github.com/${p.githubOwner}/${p.githubRepo}`
        : null;

  const previewSrc = getPreviewImageSrc(p.exploreUrl);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="group relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/4 backdrop-blur-xl shadow-[0_25px_120px_-70px_rgba(0,0,0,0.95)]"
    >
      {/* deployed preview image layer */}
      {previewSrc ? (
        <div aria-hidden className="absolute inset-0">
          <img
            src={previewSrc}
            alt=""
            className="h-full w-full object-cover opacity-[0.9] scale-[1.02] group-hover:scale-[1.06] transition-transform duration-700"
            loading="lazy"
          />
          {/* dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
          <div className="absolute inset-0 [background:radial-gradient(900px_circle_at_30%_10%,rgba(255,255,255,0.10),transparent_55%)]" />
        </div>
      ) : null}

      {/* colorful glow (sits above preview) */}
      <div aria-hidden className="absolute inset-0 opacity-[0.75]">
        <div className={`absolute -left-24 -top-24 h-60 w-60 rounded-full blur-3xl ${accent.a}`} />
        <div className={`absolute -right-24 -bottom-24 h-60 w-60 rounded-full blur-3xl ${accent.b}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/6 via-transparent to-black/25" />
      </div>

      <div className="relative p-6 sm:p-7 flex flex-col h-full">
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] text-zinc-200/70 font-mono">
              {String(index + 1).padStart(2, "0")} ·{" "}
              {p.githubOwner && p.githubRepo ? `${p.githubOwner}/${p.githubRepo}` : p.slug}
            </div>
            <h3
              className={`mt-3 text-[28px] sm:text-[34px] leading-[1.05] font-semibold tracking-tight ${titleColor} drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] break-words`}
              style={{
                fontFamily:
                  "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
                letterSpacing: "-0.02em",
              }}
            >
              {repoName}
            </h3>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {githubHref ? (
              <a
                href={githubHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-[11px] font-mono text-white/85 hover:text-white hover:bg-white/10 transition"
              >
                Source ↗
              </a>
            ) : null}
          </div>
        </div>

        {/* body */}
        <p className="mt-4 text-sm sm:text-[15px] text-white/85 leading-relaxed line-clamp-4 drop-shadow-[0_1px_0_rgba(0,0,0,0.65)]">
          {subtitle}
        </p>

        {(p.tech ?? []).length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {p.tech.slice(0, 6).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-white/12 bg-black/25 px-3 py-1 text-[11px] text-white/85"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}

        {/* footer */}
        <div className="mt-auto pt-6 flex items-center justify-between gap-3">
          <div className="text-[11px] text-white/55">Deployed preview</div>

          {p.exploreUrl ? (
            <a
              href={p.exploreUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/14 bg-white/10 px-4 py-2 text-xs text-white hover:bg-white/14 transition"
            >
              Explore <span className="text-white/80">↗</span>
            </a>
          ) : (
            <div className="text-[11px] text-white/55">No explore link</div>
          )}
        </div>
      </div>

      {/* subtle hover sheen */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 [background:radial-gradient(700px_circle_at_var(--x,50%)_var(--y,20%),rgba(255,255,255,0.12),transparent_55%)]"
      />
    </motion.article>
  );
}

export default function ProjectsScroll() {
  const [items, setItems] = React.useState<PublicProject[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { projects: PublicProject[] };
        if (!cancelled) setItems(data.projects ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    // Track mouse for hover sheen.
    function onMove(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const card = target?.closest?.("article") as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty("--x", `${x}%`);
      card.style.setProperty("--y", `${y}%`);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (loading) return <div className="text-sm text-zinc-400">Loading projects…</div>;
  if (!items.length) return <div className="text-sm text-zinc-400">No projects yet.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((p, idx) => (
        <div key={p.id} className="aspect-square">
          <ProjectGridCard p={p} index={idx} />
        </div>
      ))}
    </div>
  );
}
