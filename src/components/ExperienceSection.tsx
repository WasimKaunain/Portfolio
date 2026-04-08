"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ExperienceSection() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <section id="experience" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs tracking-[0.28em] uppercase text-zinc-400">Experience</div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Work history
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Focused on shipping reliable systems and high-polish UI.
            </p>
          </div>
        </div>

        {/* IITGN TA (2024–2026) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mt-8 rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl p-7 md:p-10 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="text-sm font-semibold text-white">IIT Gandhinagar</div>
              <div className="mt-1 text-sm text-zinc-300">Teaching Assistant</div>
              <div className="mt-2 text-xs text-zinc-500 font-mono">2024 – 2026</div>
            </div>
            <div className="max-w-2xl">
              <p className="text-sm text-zinc-300 leading-relaxed">
                Supported course delivery through mentoring, doubt-solving sessions, and grading; helped
                students build strong fundamentals through hands-on assignments.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Mentoring", "Teaching", "Grading", "Problem Solving"].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-zinc-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Qualcomm */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.06 }}
          className="mt-8 rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl p-7 md:p-10 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="text-sm font-semibold text-white">Qualcomm</div>
              <div className="mt-1 text-sm text-zinc-300">SDE-1</div>
              <div className="mt-2 text-xs text-zinc-500 font-mono">Current role · First job</div>
            </div>
            <div className="max-w-2xl">
              <p className="text-sm text-zinc-300 leading-relaxed">
                Working on production systems and engineering workflows, with an emphasis on performance,
                robustness, and developer experience.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Systems", "Performance", "Frontend", "Tooling"].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-zinc-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
