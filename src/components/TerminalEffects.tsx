"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { rand } from "@/lib/gravityPile";

type EffectState = {
  gravity: boolean;
  matrix: boolean;
  scanlines: boolean;
  doom: boolean;
  glitchBurst: number;
  confettiBurst: number;
};

type PilePiece = {
  id: string;
  html: string;
  w: number;
  h: number;
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  vr: number;
  z: number;
};

export default function TerminalEffects() {
  const [s, setS] = React.useState<EffectState>({
    gravity: false,
    matrix: false,
    scanlines: false,
    doom: false,
    glitchBurst: 0,
    confettiBurst: 0,
  });

  const [lastEffect, setLastEffect] = React.useState<string>("");
  const [pile, setPile] = React.useState<PilePiece[]>([]);
  const pileRef = React.useRef<HTMLDivElement | null>(null);

  // --- physics state (mutable, not in React state) ---
  const physRef = React.useRef<{ map: Map<string, PilePiece>; running: boolean; raf: number; lastT: number }>(
    { map: new Map(), running: false, raf: 0, lastT: 0 }
  );

  // keep physics map in sync with React pile state
  React.useEffect(() => {
    const m = physRef.current.map;
    const ids = new Set(pile.map((p) => p.id));
    // remove missing
    for (const id of Array.from(m.keys())) if (!ids.has(id)) m.delete(id);
    // add/update
    for (const it of pile) m.set(it.id, it);
  }, [pile]);

  function getBounds() {
    const host = pileRef.current;
    const w = host?.getBoundingClientRect().width ?? window.innerWidth;
    const h = host?.getBoundingClientRect().height ?? window.innerHeight * 0.7;
    return { w, h };
  }

  function startPhysics() {
    const st = physRef.current;
    if (st.running) return;
    st.running = true;
    st.lastT = performance.now();

    const step = (t: number) => {
      const now = t;
      let dt = (now - st.lastT) / 1000;
      st.lastT = now;
      // clamp dt for stability
      dt = Math.max(0.001, Math.min(0.02, dt));

      const { w, h } = getBounds();
      const halfW = w / 2;

      const GRAV = 380; // much slower
      const bounce = 0.58;
      const air = 0.985; // more drag
      const groundFriction = 0.82;
      const rotFriction = 0.86;

      // Define a floor inside the pile container so items never go below it.
      // y=0 is at bottom anchor of items; keep bottoms at >= 0.
      const bottomLimit = 0;
      // ceiling: allow items to exist within the pile's visible area
      const topLimitGlobal = -(h - 8);

      let energy = 0;

      for (const it of st.map.values()) {
        // integrate velocity
        it.vy += GRAV * dt;
        it.vx *= air;
        it.vy *= air;
        it.vr *= air;

        it.x += it.vx * dt;
        it.y += it.vy * dt;
        it.r += it.vr * dt;

        const left = -halfW + it.w / 2;
        const right = halfW - it.w / 2;
        const topLimit = Math.max(topLimitGlobal, -(h - it.h));

        // walls
        if (it.x < left) {
          it.x = left;
          it.vx = -it.vx * bounce;
        }
        if (it.x > right) {
          it.x = right;
          it.vx = -it.vx * bounce;
        }

        // ceiling
        if (it.y < topLimit) {
          it.y = topLimit;
          it.vy = -it.vy * bounce;
        }

        // floor (land)
        if (it.y > bottomLimit) {
          it.y = bottomLimit;
          it.vy = -it.vy * bounce;
          it.vx *= groundFriction;
          it.vr *= rotFriction;
        }

        // small settle threshold
        if (Math.abs(it.vx) < 4) it.vx = 0;
        if (Math.abs(it.vy) < 6 && it.y === bottomLimit) it.vy = 0;
        if (Math.abs(it.vr) < 2) it.vr = 0;

        energy += Math.abs(it.vx) + Math.abs(it.vy) + Math.abs(it.vr);
      }

      // flush to react state at ~30fps
      setPile((prev) => prev.map((p) => st.map.get(p.id) ?? p));

      // --- Stronger stacking ---
      // Run multiple solver iterations per frame to reduce overlap.
      const items = Array.from(st.map.values());
      const ITER = 5;
      for (let iter = 0; iter < ITER; iter++) {
        for (let i = 0; i < items.length; i++) {
          for (let j = i + 1; j < items.length; j++) {
            const a = items[i];
            const b = items[j];

            const ax1 = a.x - a.w / 2;
            const ax2 = a.x + a.w / 2;
            const ay1 = a.y - a.h;
            const ay2 = a.y;

            const bx1 = b.x - b.w / 2;
            const bx2 = b.x + b.w / 2;
            const by1 = b.y - b.h;
            const by2 = b.y;

            const overlapX = Math.min(ax2, bx2) - Math.max(ax1, bx1);
            const overlapY = Math.min(ay2, by2) - Math.max(ay1, by1);

            if (overlapX > 0 && overlapY > 0) {
              // cap the maximum allowed overlap to ~20% of the smaller dimension
              const maxOX = 0.2 * Math.min(a.w, b.w);
              const maxOY = 0.2 * Math.min(a.h, b.h);

              // prefer vertical stacking resolution
              if (overlapY <= overlapX) {
                const push = Math.max(0, overlapY - maxOY);
                if (push > 0) {
                  // push the upper item up (smaller y)
                  const aAbove = a.y < b.y;
                  if (aAbove) {
                    a.y -= push;
                    a.vy = Math.min(a.vy, 0);
                  } else {
                    b.y -= push;
                    b.vy = Math.min(b.vy, 0);
                  }
                }
              } else {
                const push = Math.max(0, overlapX - maxOX);
                if (push > 0) {
                  const aRight = a.x > b.x;
                  if (aRight) {
                    a.x += push;
                    a.vx = Math.max(a.vx, 0);
                  } else {
                    b.x += push;
                    b.vx = Math.max(b.vx, 0);
                  }
                }
              }

              // re-enforce floor after resolution
              if (a.y > bottomLimit) a.y = bottomLimit;
              if (b.y > bottomLimit) b.y = bottomLimit;
            }
          }
        }
      }

      if (energy < 20) {
        st.running = false;
        cancelAnimationFrame(st.raf);
        return;
      }

      st.raf = requestAnimationFrame(step);
    };

    st.raf = requestAnimationFrame(step);
  }

  function kick(id: string) {
    const st = physRef.current;
    const it = st.map.get(id);
    if (!it) return;

    // kick impulse
    it.vx += rand(-520, 520);
    it.vy += rand(-420, -820); // upward impulse (negative y direction)?? our y is down-positive, so upward is negative.
    it.vr += rand(-220, 220);

    // bring to top
    const maxZ = Math.max(0, ...Array.from(st.map.values()).map((x) => x.z));
    it.z = maxZ + 1;

    // write-through
    st.map.set(id, it);
    setPile((p) => p.map((x) => (x.id === id ? { ...it } : x)));
    startPhysics();
  }

  // Track placeholders to preserve scroll height when elements are removed.
  const placeholdersRef = React.useRef<Map<HTMLElement, HTMLDivElement>>(new Map());

  function ensurePlaceholder(el: HTMLElement) {
    const map = placeholdersRef.current;
    if (map.has(el)) return;
    const r = el.getBoundingClientRect();
    const ph = document.createElement("div");
    ph.dataset.gravityPlaceholder = "1";
    ph.style.height = `${Math.max(1, Math.round(r.height))}px`;
    ph.style.width = "100%";
    ph.style.pointerEvents = "none";
    el.parentElement?.insertBefore(ph, el);
    map.set(el, ph);
  }

  function clearPlaceholders() {
    const map = placeholdersRef.current;
    for (const ph of map.values()) ph.remove();
    map.clear();
  }

  // Replace dumpToPile with a slow-fall version
  function dumpToPileSlow(el: HTMLElement, delayMs: number) {
    // preserve page height so scrolling still works
    ensurePlaceholder(el);

    const sizeTarget = (el.firstElementChild as HTMLElement | null) ?? el;
    const r = sizeTarget.getBoundingClientRect();
    const html = sizeTarget.outerHTML;

    // disable interaction but keep it in DOM until it "lands" (visual fall)
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";
    el.dataset.gravityHidden = "1";

    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    // create piece starting high (negative y) and falling down via physics
    window.setTimeout(() => {
      setPile((p) => [
        ...p,
        {
          id,
          html,
          w: Math.max(60, r.width),
          h: Math.max(40, r.height),
          x: rand(-420, 420),
          y: -420 - rand(0, 520),
          r: rand(-10, 10),
          vx: rand(-80, 80),
          vy: rand(0, 30),
          vr: rand(-40, 40),
          z: 20 + p.length,
        },
      ]);
      startPhysics();
    }, delayMs);
  }

  // Ensure physics stops + restores after reset/off
  React.useEffect(() => {
    if (!s.gravity) {
      const st = physRef.current;
      st.running = false;
      cancelAnimationFrame(st.raf);
      st.map.clear();
      clearPlaceholders();
    }
  }, [s.gravity]);

  // ESC to reset (works even if terminal has fallen)
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        window.dispatchEvent(new CustomEvent("terminal:effect", { detail: { effect: "reset" } }));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    function onEffect(evt: Event) {
      const e = evt as CustomEvent<{ effect?: string } & Record<string, unknown>>;
      const effect = String(e.detail?.effect ?? "");

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log("[TerminalEffects] effect:", effect, e.detail);
      }

      setLastEffect(effect);

      if (effect === "reset") {
        setPile([]);
        document.querySelectorAll<HTMLElement>("[data-gravity-item='1']").forEach((el) => {
          el.style.removeProperty("display");
          el.style.removeProperty("visibility");
          el.style.removeProperty("pointer-events");
        });

        setS({
          gravity: false,
          matrix: false,
          scanlines: false,
          doom: false,
          glitchBurst: 0,
          confettiBurst: 0,
        });
        clearPlaceholders();
        return;
      }

      if (effect === "gravity:drop") {
        setS((p) => ({ ...p, gravity: true }));
        return;
      }

      if (effect === "gravity:on") {
        setS((p) => ({ ...p, gravity: true }));
        return;
      }
      if (effect === "gravity:off") {
        setPile([]);
        document.querySelectorAll<HTMLElement>("[data-gravity-item='1']").forEach((el) => {
          el.style.removeProperty("display");
          el.style.removeProperty("visibility");
          el.style.removeProperty("pointer-events");
        });
        setS((p) => ({ ...p, gravity: false }));
        clearPlaceholders();
        return;
      }
      if (effect === "matrix:toggle") setS((p) => ({ ...p, matrix: !p.matrix }));
      if (effect === "scanlines:toggle") setS((p) => ({ ...p, scanlines: !p.scanlines }));
      if (effect === "doom") {
        setS((p) => ({ ...p, doom: true }));
        window.setTimeout(() => setS((p) => ({ ...p, doom: false })), 3500);
      }
      if (effect === "glitch") {
        setS((p) => ({ ...p, glitchBurst: p.glitchBurst + 1 }));
      }
      if (effect === "confetti") {
        setS((p) => ({ ...p, confettiBurst: p.confettiBurst + 1 }));
      }
    }

    window.addEventListener("terminal:effect", onEffect as EventListener);
    return () => window.removeEventListener("terminal:effect", onEffect as EventListener);
  }, []);

  // Dump helpers
  function dumpToPile(el: HTMLElement) {
    // Prefer sizing by inner container to avoid extra padding
    const sizeTarget = (el.firstElementChild as HTMLElement | null) ?? el;
    const r = sizeTarget.getBoundingClientRect();
    const html = sizeTarget.outerHTML;

    el.style.display = "none";
    el.style.pointerEvents = "none";
    el.dataset.gravityHidden = "1";

    const startX = rand(-160, 160);
    const startY = rand(-26, 26);
    const rot = rand(-14, 14);

    setPile((p) => [
      ...p,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        html,
        w: Math.max(60, r.width),
        h: Math.max(40, r.height),
        x: startX,
        y: startY,
        r: rot,
        vx: 0,
        vy: 0,
        vr: 0,
        z: 20 + p.length,
      },
    ]);
  }

  // Full DROP: when gravity is enabled, dump everything (staggered) and keep scroll normal.
  React.useEffect(() => {
    if (!s.gravity) return;

    const allItems = Array.from(document.querySelectorAll<HTMLElement>("[data-gravity-item='1']"));

    // stagger dumping so it looks like a cascade
    const timers: number[] = [];
    allItems.forEach((el, idx) => {
      const t = window.setTimeout(() => dumpToPileSlow(el, 0), idx * 180);
      timers.push(t);
    });

    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [s.gravity]);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <>
      {process.env.NODE_ENV !== "production" ? (
        <div className="pointer-events-none fixed bottom-2 left-2 z-[200] rounded-md border border-white/10 bg-black/60 px-2 py-1 text-[10px] font-mono text-zinc-200">
          effects: gravity={String(s.gravity)} matrix={String(s.matrix)} scanlines={String(s.scanlines)} last={lastEffect || "-"}
        </div>
      ) : null}

      {/* Client-only style to avoid hydration text mismatch */}
      {mounted ? (
        <style>{`
          body[data-gravity='on'] main { transform: translateZ(0) rotate(0.001deg); }
          body[data-gravity='on'] { background: #f3f4f6 !important; }
        `}</style>
      ) : null}

      {/* Blinking warning */}
      <AnimatePresence>
        {s.gravity ? (
          <motion.div
            key="gravity-warn"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="pointer-events-none fixed top-2 left-1/2 -translate-x-1/2 z-[220]"
          >
            <div className="rounded-full border border-red-500/30 bg-black/70 px-4 py-2 text-xs font-mono text-red-200 shadow-lg">
              <span className="inline-block animate-pulse">GRAVITY ACTIVE</span>
              <span className="text-red-300/80"> — press </span>
              <span className="text-white">ESC</span>
              <span className="text-red-300/80"> to reset</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Pile floor (client-only) */}
      {mounted ? (
        <div
          ref={pileRef}
          data-gravity-pile="1"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] h-[70vh] overflow-hidden"
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(900px_circle_at_50%_110%,rgba(99,102,241,0.14),transparent_65%)]" />

          <div className="absolute inset-x-0 bottom-0 flex justify-center">
            <div className="relative w-[min(1100px,94vw)] h-[70vh]">
              {pile.map((it) => (
                <motion.div
                  key={it.id}
                  className="pointer-events-auto absolute left-1/2 bottom-4 select-none"
                  style={{ width: it.w, height: it.h, zIndex: it.z }}
                  animate={{ x: it.x, y: it.y, rotate: it.r }}
                  transition={{ duration: 0.03, ease: "linear" }}
                  onPointerDown={(e) => {
                    const target = e.target as HTMLElement | null;
                    if (
                      target &&
                      target.closest("input,textarea,button,select,a,[contenteditable='true'],[role='textbox']")
                    ) {
                      return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    kick(it.id);
                  }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement | null;
                    if (
                      target &&
                      target.closest("input,textarea,button,select,a,[contenteditable='true'],[role='textbox']")
                    ) {
                      return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    kick(it.id);
                  }}
                >
                  <div
                    className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-black/55 backdrop-blur-xl shadow-[0_18px_80px_-45px_rgba(0,0,0,0.9)]"
                    // snapshot of the section
                    dangerouslySetInnerHTML={{ __html: it.html }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Keep other effects */}
      <GravityLayer enabled={s.gravity} doom={s.doom} />
      <MatrixLayer enabled={s.matrix} />
      <ScanlinesLayer enabled={s.scanlines} />
      <GlitchBurst burst={s.glitchBurst} />
      <ConfettiBurst burst={s.confettiBurst} />
    </>
  );
}

function GravityLayer({ enabled, doom }: { enabled: boolean; doom: boolean }) {
  if (!enabled && !doom) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <AnimatePresence>
        {enabled ? (
          <motion.div
            key="gravity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <motion.div
              className="absolute inset-0"
              animate={{ y: [0, -6, 0, 4, 0], rotate: [0, -0.4, 0.2, -0.15, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        ) : null}

        {doom ? (
          <motion.div
            key="doom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: [0, 1.8, -1.2, 0.8, 0] }}
              transition={{ duration: 0.55, repeat: 6, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 bg-red-500/12"
              animate={{ opacity: [0.0, 0.7, 0.15, 0.55, 0.0] }}
              transition={{ duration: 0.6, repeat: 5, ease: "easeInOut" }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MatrixLayer({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[55] opacity-90 mix-blend-screen">
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_85%,rgba(34,197,94,0.28),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_20%,rgba(34,197,94,0.12),transparent_60%)]" />
      <div className="absolute inset-0 [background-image:linear-gradient(to_bottom,rgba(34,197,94,0.40),transparent_35%,rgba(34,197,94,0.18)),repeating-linear-gradient(90deg,rgba(34,197,94,0.22)_0px,rgba(34,197,94,0.22)_1px,transparent_1px,transparent_10px)] animate-[matrix_1.8s_linear_infinite]" />
      <style>{`
        @keyframes matrix { from { background-position: 0 0, 0 0; } to { background-position: 0 220px, 0 0; } }
      `}</style>
    </div>
  );
}

function ScanlinesLayer({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[56] opacity-55 mix-blend-overlay">
      <div className="absolute inset-0 [background-image:repeating-linear-gradient(to_bottom,rgba(255,255,255,0.28)_0px,rgba(255,255,255,0.28)_1px,transparent_2px,transparent_6px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_50%,rgba(255,255,255,0.10),transparent_62%)]" />
    </div>
  );
}

function GlitchBurst({ burst }: { burst: number }) {
  if (!burst) return null;
  return (
    <AnimatePresence>
      <motion.div
        key={burst}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.65, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none fixed inset-0 z-[70]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(99,102,241,0.28),rgba(217,70,239,0.22))] mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_50%_40%,rgba(255,255,255,0.08),transparent_60%)] mix-blend-overlay" />
        <div className="absolute inset-0 [filter:url(#noise)] opacity-60" />
        <svg width="0" height="0">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </svg>
      </motion.div>
    </AnimatePresence>
  );
}

function ConfettiBurst({ burst }: { burst: number }) {
  if (!burst) return null;
  const pieces = Array.from({ length: 28 }, (_, i) => i);
  return (
    <AnimatePresence>
      <motion.div key={burst} className="pointer-events-none fixed inset-0 z-[75]">
        {pieces.map((i) => {
          const left = (i / pieces.length) * 100;
          const delay = (i % 7) * 0.02;
          const hue = (i * 31) % 360;
          return (
            <motion.span
              key={i}
              initial={{ y: -20, opacity: 0, rotate: 0 }}
              animate={{ y: 700, opacity: [0, 1, 1, 0], rotate: 220 }}
              transition={{ duration: 1.6, delay, ease: "easeOut" }}
              style={{ left: `${left}%`, backgroundColor: `hsl(${hue} 90% 60%)` }}
              className="absolute top-0 h-2.5 w-2.5 rounded-sm"
            />
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
