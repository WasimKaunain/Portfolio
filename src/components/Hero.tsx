"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl p-10 bg-gradient-to-br from-[#081029] to-[#0f1b2d] border border-white/6 shadow-2xl"
    >
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-500 shadow-inner flex items-center justify-center">
          <span className="font-mono text-lg text-white">GK</span>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Wasim Konain</h1>
          <p className="mt-1 text-zinc-300">Senior Full-Stack Engineer · UI/UX · System Architect</p>

          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/4 text-sm text-zinc-200">Next.js</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/4 text-sm text-zinc-200">TypeScript</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/4 text-sm text-zinc-200">Tailwind</span>
          </div>

          <p className="mt-6 text-zinc-300 max-w-xl leading-relaxed">
            I design and build production-grade web applications, developer tools, and delightful UX — presented here as a developer control center.
          </p>
        </div>
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 w-72 h-72 rounded-full bg-gradient-to-tr from-violet-600/30 to-indigo-400/20 blur-3xl"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
    </motion.header>
  );
}
