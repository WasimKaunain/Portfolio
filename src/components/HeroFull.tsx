"use client";

import React from "react";
import { motion } from "framer-motion";
import { buildTypewriterFrames } from "@/lib/typewriter";

const roles = [
  "Software Engineer",
  "SDE-1 @ Qualcomm",
  "Full‑Stack Developer",
  "UI Engineer",
  "Systems Thinker",
];

const frames = buildTypewriterFrames(roles);

function RoleLooper() {
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % frames.length), 55);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 text-lg sm:text-xl">
      <span className="text-zinc-300">I build as a</span>
      <span className="relative font-mono text-white">
        {frames[i] || ""}
        <motion.span
          aria-hidden
          className="inline-block w-[10px] ml-1 align-[-2px]"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
        >
          |
        </motion.span>
      </span>
    </div>
  );
}

export default function HeroFull() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center" id="home">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_20%,rgba(99,102,241,0.22),transparent_60%),radial-gradient(900px_circle_at_20%_80%,rgba(217,70,239,0.16),transparent_55%),radial-gradient(900px_circle_at_80%_70%,rgba(56,189,248,0.11),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.p
          data-gravity-item="1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.32em] uppercase text-zinc-400"
        >
          About me
        </motion.p>

        <motion.h1
          data-gravity-item="1"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-4 text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tight text-white"
        >
          Wasim Konain
        </motion.h1>

        <motion.div
          data-gravity-item="1"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mt-5"
        >
          <RoleLooper />
        </motion.div>

        <motion.p
          data-gravity-item="1"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="mt-8 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl mx-auto"
        >
          I’m currently working as an{" "}
          <span className="text-white">SDE‑1 at Qualcomm</span>. I build
          production-grade web systems, tooling, and crisp dark-themed interfaces — with a focus on
          performance, reliability, and motion design.
        </motion.p>

        <motion.div
          data-gravity-item="1"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <a
            href="#projects"
            className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 text-sm text-white hover:bg-white/12 transition"
          >
            Explore projects
          </a>
          <a
            href="#contact"
            className="rounded-2xl border border-white/12 bg-black/30 px-5 py-3 text-sm text-zinc-200 hover:bg-white/6 transition"
          >
            Contact me
          </a>
        </motion.div>

        {/* scroll indicator should not be a gravity item */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mt-16 flex justify-center"
        >
          <div className="h-12 w-7 rounded-full border border-white/12 bg-white/5 flex items-start justify-center p-2">
            <motion.div
              className="h-2 w-2 rounded-full bg-white/60"
              animate={{ y: [0, 18, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
