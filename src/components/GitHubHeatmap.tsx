"use client";

import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export default function GitHubHeatmap({ username }: { username: string }) {
  // Uses a public image embed (no token needed).
  const src = `https://ghchart.rshah.org/${encodeURIComponent(username)}`;

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const transform = useMotionTemplate`perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientX - rect.left) / rect.width;
    ry.set((px - 0.5) * 10);
    rx.set(-(((e.clientY - rect.top) / rect.height) - 0.5) * 8);
  }

  function onLeave() {
    ry.set(0);
    rx.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={{ transform }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative overflow-hidden rounded-[34px] border border-white/12 bg-white/3 backdrop-blur-2xl p-5 sm:p-6 md:p-8 shadow-[0_35px_120px_-60px_rgba(0,0,0,0.95)]"
    >
      {/* glass layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/7 via-transparent to-white/0" />
        <div className="absolute -left-44 -top-44 h-[420px] w-[420px] rounded-full bg-indigo-500/18 blur-3xl" />
        <div className="absolute -right-44 -bottom-44 h-[420px] w-[420px] rounded-full bg-fuchsia-500/16 blur-3xl" />
        <div className="absolute inset-0 [mask-image:radial-gradient(60%_70%_at_50%_30%,black,transparent)] opacity-[0.35] bg-[linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:26px_26px]" />
        <div className="absolute inset-0 rounded-[34px] ring-1 ring-white/10" />
      </div>

      <div className="relative flex items-end justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.28em] uppercase text-zinc-400">GitHub</div>
          <h3 className="mt-3 text-xl md:text-2xl font-semibold tracking-tight text-white">
            Contribution heatmap
          </h3>
          <p className="mt-2 text-sm text-zinc-300/80">
            A 1-year snapshot of consistency and shipped work.
          </p>
        </div>
        <a
          className="text-xs text-zinc-300 hover:text-white transition font-mono"
          href={`https://github.com/${encodeURIComponent(username)}`}
          target="_blank"
          rel="noreferrer"
        >
          @{username} ↗
        </a>
      </div>

      <div className="relative mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-3">
        <img
          src={src}
          alt={`GitHub contribution chart for ${username}`}
          className="min-w-[560px] sm:min-w-[720px] w-full opacity-95"
        />
      </div>

      <div className="relative mt-4 flex items-center justify-between text-[11px] text-zinc-500">
        <span className="font-mono">ghchart.rshah.org</span>
        <span className="hidden sm:inline">Hover to tilt</span>
      </div>
    </motion.div>
  );
}
