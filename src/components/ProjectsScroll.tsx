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

type SlideDirection = "x" | "y";

type SlideMode = {
  axis: SlideDirection;
  // Left->Right when axis=x, Top->Bottom when axis=y
  forward: true;
};

function getSlideModeByIndex(index: number): SlideMode {
  // Alternate / mix patterns across cards.
  // You can tweak this to map specific projects if you want.
  const mode = index % 3;
  if (mode === 0) return { axis: "x", forward: true }; // left -> right
  if (mode === 1) return { axis: "y", forward: true }; // top -> bottom
  return { axis: "y", forward: true }; // bottom -> top is handled by reversed ordering below
}

function getLocalPreviewImages(repoOrTitle: string | null | undefined): string[] {
  if (!repoOrTitle) return [];
  const folder = repoOrTitle.trim();
  if (!folder) return [];

  // NOTE: Next.js can't list /public at runtime on the client.
  // So we keep a small manifest here that maps folder -> images.
  // Add new projects by dropping images into /public/<RepoName>/ and updating this map.
  const manifest: Record<string, string[]> = {
    AttendanceManager: ["attendance1.png", "attendance2.png", "attendance3.png"],
    "Bplustree-Database": ["bplus1.png", "bplus2.png", "bplus3.png", "bplus4.png"],
    CozyCornerCafe: ["coffee1.png", "coffee2.png", "coffee3.png"],
    "Masjide-Abubakr": ["masjid1.png", "masjid2.png", "masjid3.png"],
    Portfolio: ["portfolio1.png", "portfolio2.png", "portfolio3.png"],
    checkinout: ["checkinout1.png", "checkinout2.png", "checkinout3.png", "checkinout4.png"],
  };

  const files = manifest[folder];
  if (!files?.length) return [];
  return files.map((f) => `/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`);
}

function useCarouselIndex(
  length: number,
  enabled: boolean,
  intervalMs = 3000,
  startOffsetMs = 0,
) {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) return;
    if (length <= 1) return;

    // Make each card start at a different time so they don't all change together.
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setIdx((v) => (v + 1) % length);
      intervalId = window.setInterval(() => setIdx((v) => (v + 1) % length), intervalMs);
    }, Math.max(0, startOffsetMs));

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [enabled, length, intervalMs, startOffsetMs]);

  React.useEffect(() => {
    if (idx >= length) setIdx(0);
  }, [idx, length]);

  return idx;
}

function IconLink(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 13" />
      <path d="M14 11a5 5 0 0 1 0 7L12.5 19.5a5 5 0 0 1-7-7L7 11" />
    </svg>
  );
}

function IconGlobe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.8 3.2 4.2 6.2 4.2 9s-1.4 5.8-4.2 9c-2.8-3.2-4.2-6.2-4.2-9S9.2 6.2 12 3z" />
    </svg>
  );
}

function ProjectGridCard({
  p,
  index,
  mounted,
}: {
  p: PublicProject;
  index: number;
  mounted: boolean;
}) {
  const repoName = p.githubRepo ?? p.title;
  const subtitle = p.description || "No description yet. Add one in admin.";
  const accent = accents[index % accents.length];

  const githubHref =
    p.githubUrl && p.githubUrl.startsWith("http")
      ? p.githubUrl
      : p.githubOwner && p.githubRepo
        ? `https://github.com/${p.githubOwner}/${p.githubRepo}`
        : null;

  const localPreviews = getLocalPreviewImages(p.githubRepo ?? p.title);

  // Stagger each card so they don't all switch at the same time.
  // Using index keeps it stable across renders.
  const activeIdx = useCarouselIndex(localPreviews.length, mounted, 3000, (index % 10) * 250);

  // Mix slide directions across cards.
  const slideMode = getSlideModeByIndex(index);
  const order: "normal" | "reverse" = index % 3 === 2 ? "reverse" : "normal";
  const orderedPreviews = order === "reverse" ? [...localPreviews].reverse() : localPreviews;

  return (
    <motion.article
      initial={mounted ? { opacity: 0, y: 12 } : false}
      animate={mounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="group relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/4 backdrop-blur-xl shadow-[0_25px_120px_-70px_rgba(0,0,0,0.95)]"
    >
      {/* local preview carousel (direction varies per card; always loops in the same direction) */}
      {orderedPreviews.length ? (
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div
            className={
              slideMode.axis === "x"
                ? "h-full w-full flex transition-transform duration-700 ease-out"
                : "h-full w-full flex flex-col transition-transform duration-700 ease-out"
            }
            style={
              slideMode.axis === "x"
                ? { transform: `translateX(${activeIdx * 100}%)` }
                : { transform: `translateY(${activeIdx * 100}%)` }
            }
          >
            {orderedPreviews.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-full w-full shrink-0 object-cover opacity-[0.92]"
                loading="lazy"
              />
            ))}
          </div>

          {/* dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
          <div className="absolute inset-0 [background:radial-gradient(900px_circle_at_30%_10%,rgba(255,255,255,0.10),transparent_55%)]" />
        </div>
      ) : null}

      {/* colorful glow (sits above preview) */}
      <div aria-hidden className="absolute inset-0 opacity-[0.75] pointer-events-none">
        <div className={`absolute -left-24 -top-24 h-60 w-60 rounded-full blur-3xl ${accent.a}`} />
        <div className={`absolute -right-24 -bottom-24 h-60 w-60 rounded-full blur-3xl ${accent.b}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/6 via-transparent to-black/25" />
      </div>

      <div className="relative z-10 p-6 sm:p-7 flex flex-col h-full">
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {/* remove the small meta line (index + owner/repo) */}

            <h3
              className="mt-3 text-[28px] sm:text-[34px] leading-[1.05] font-semibold tracking-tight text-amber-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] break-words"
              style={{
                // "typewriter" feel (monospace) without adding extra font files
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                letterSpacing: "-0.01em",
              }}
            >
              {repoName}
            </h3>
          </div>

          {/* Remove top-right text link area (icons live in footer now) */}
          <div className="shrink-0" />
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
        <div className="mt-auto pt-6 flex items-end justify-between gap-3">
          <div className="text-[11px] text-white/55">Deployed preview</div>

          <div className="flex items-center gap-2 relative z-20">
            {githubHref ? (
              <a
                href={githubHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Open source on GitHub"
                title="Source"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/14 bg-black/35 text-white/85 hover:text-white hover:bg-white/12 transition"
              >
                <IconLink className="h-5 w-5" />
              </a>
            ) : null}

            {p.exploreUrl ? (
              <a
                href={p.exploreUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open live demo"
                title="Explore"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/14 bg-white/10 text-white hover:bg-white/14 transition"
              >
                <IconGlobe className="h-5 w-5" />
              </a>
            ) : (
              <button
                type="button"
                aria-label="No live demo"
                title="No explore link"
                disabled
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/35 cursor-not-allowed"
              >
                <IconGlobe className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* subtle hover sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 [background:radial-gradient(700px_circle_at_var(--x,50%)_var(--y,20%),rgba(255,255,255,0.12),transparent_55%)]"
      />
    </motion.article>
  );
}

export default function ProjectsScroll() {
  const [items, setItems] = React.useState<PublicProject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

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
    if (!mounted) return;

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
  }, [mounted]);

  if (loading) return <div className="text-sm text-zinc-400">Loading projects…</div>;
  if (!items.length) return <div className="text-sm text-zinc-400">No projects yet.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((p, idx) => (
        <div key={p.id} className="aspect-square">
          <ProjectGridCard p={p} index={idx} mounted={mounted} />
        </div>
      ))}
    </div>
  );
}
