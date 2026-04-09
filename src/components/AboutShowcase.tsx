"use client";

import React from "react";
import { motion } from "framer-motion";

const defaultRoles = [
  "Software Engineer",
  "Product Designer",
  "System Engineer",
];

// Replace per-side loops with a single synced controller.
function useSyncedSplitTypewriter(
  roles: string[],
  opts?: { speedMs?: number; pauseMs?: number; enabled?: boolean }
) {
  const speedMs = opts?.speedMs ?? 65;
  const pauseMs = opts?.pauseMs ?? 900;
  const enabled = opts?.enabled ?? true;

  const [roleIndex, setRoleIndex] = React.useState(0);
  const [subIndex, setSubIndex] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;
    if (!roles.length) return;

    const full = roles[roleIndex % roles.length] ?? "";
    const atEnd = subIndex === full.length;
    const atStart = subIndex === 0;

    const delay = deleting ? Math.max(20, speedMs * 0.55) : speedMs;

    const t = window.setTimeout(() => {
      if (!deleting) {
        if (atEnd) {
          window.setTimeout(() => setDeleting(true), pauseMs);
          return;
        }
        setSubIndex((v) => v + 1);
      } else {
        if (atStart) {
          setDeleting(false);
          setRoleIndex((v) => (v + 1) % roles.length);
          return;
        }
        setSubIndex((v) => v - 1);
      }
    }, delay);

    return () => window.clearTimeout(t);
  }, [enabled, roles, roleIndex, subIndex, deleting, speedMs, pauseMs]);

  const text = enabled ? (roles[roleIndex % roles.length] ?? "").slice(0, subIndex) : "";

  // Always return both parts computed from the SAME text slice => perfectly synced.
  const parts = splitRole(text);
  return { leftText: parts.left, rightText: parts.right };
}

function splitRole(role: string) {
  const trimmed = role.trim().replace(/\s+/g, " ");
  const parts = trimmed.split(" ");
  if (parts.length <= 1) return { left: trimmed, right: "" };

  const mid = Math.ceil(parts.length / 2);
  return {
    left: parts.slice(0, mid).join(" "),
    right: parts.slice(mid).join(" "),
  };
}

type Props = {
  bgSrc?: string;
};

export default function AboutShowcase({ bgSrc = "/hero_pic.jpg" }: Props) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const { leftText, rightText } = useSyncedSplitTypewriter(defaultRoles, { enabled: mounted });

  return (
    <section id="about" className="relative min-h-[100svh] overflow-hidden">
      {/* single full-bleed image */}
      <div aria-hidden className="absolute inset-0">
        <img
          src={bgSrc}
          alt=""
          className="h-full w-full object-cover object-[47%_center] lg:object-center"
        />
        {/* keep image visible but add readability */}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/55" />
      </div>

      <div className="relative h-[100svh] px-6 sm:px-10">
        <div className="mx-auto max-w-6xl h-full">
          {/*
            Mobile: roles sit BELOW the image (under the chin)
            Desktop (lg+): roles sit on left/right of the image
          */}
          <div className="grid grid-rows-[1fr_auto] lg:grid-rows-1 lg:grid-cols-[1fr_auto_1fr] items-end lg:items-center gap-6 lg:gap-10 h-full">
            {/* DESKTOP LEFT role */}
            <div className="hidden lg:block text-right">
              <div className="font-mono text-2xl sm:text-3xl text-white/95">
                {leftText || "\u00A0"}
                {mounted ? (
                  <motion.span
                    aria-hidden
                    className="inline-block ml-1 text-white/70"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                  >
                    |
                  </motion.span>
                ) : null}
              </div>
            </div>

            {/* CENTER spacer (image stays centered in both layouts) */}
            <div className="w-full lg:w-[440px]" />

            {/* DESKTOP RIGHT role */}
            <div className="hidden lg:block text-left">
              <div className="font-mono text-2xl sm:text-3xl text-white/95">
                {rightText || "\u00A0"}
                {mounted ? (
                  <motion.span
                    aria-hidden
                    className="inline-block ml-1 text-white/70"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                  >
                    |
                  </motion.span>
                ) : null}
              </div>
            </div>

            {/* MOBILE Hero Name Overlay */}
            <div className="lg:hidden absolute top-0 left-0 w-full z-20 px-6 pt-24 pointer-events-none">
              <h1 className="w-full text-center font-bold tracking-tight leading-[1.05] text-[clamp(36px,11vw,72px)]">

                <span className="text-gray-400 drop-shadow-[0_6px_20px_rgba(0,0,0,0.7)]">
                  WASIM
                </span>{" "}

                <span className="text-gray-400 drop-shadow-[0_6px_20px_rgba(0,0,0,0.7)]">
                  KONAIN
                </span>

              </h1>
            </div>

            {/* MOBILE roles (below image) */}
            <div className="lg:hidden row-start-2">
              <div className="flex items-center justify-center gap-2 font-mono text-xl sm:text-2xl text-white/95">
                <span>{leftText || "\u00A0"}</span>
                <span className="text-white/60">{rightText ? " " : ""}</span>
                <span>{rightText || "\u00A0"}</span>
                {mounted ? (
                  <motion.span
                    aria-hidden
                    className="inline-block ml-1 text-white/70"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                  >
                    |
                  </motion.span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
