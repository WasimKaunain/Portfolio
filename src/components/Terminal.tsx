"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type Cmd = {
  input: string;
  output: React.ReactNode;
  id: string;
};

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

const initialWelcome = `
Welcome to the Developer Control Center.
Type 'help' to list commands.
`;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function emit(effect: string, detail?: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent("terminal:effect", { detail: { effect, ...(detail ?? {}) } }));
}

export default function Terminal() {
  const [lines, setLines] = useState<Cmd[]>([
    { id: "welcome", input: "", output: <pre className="whitespace-pre-wrap">{initialWelcome}</pre> },
  ]);
  const [buf, setBuf] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Don't steal focus on initial load. Only focus when the user interacts.
    // (Autofocus can cause the browser to scroll directly to the terminal.)
  }, []);

  useEffect(() => {
    // Always keep the scrollable output pinned to the newest line.
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [lines]);

  // keep private admin command hidden (not listed in help)
  const helpText = useMemo(
    () =>
      `
help                - list commands
clear               - clear terminal
reset               - return UI + terminal effects to normal
whoami              - identity check
now                 - show local time
theme               - toggle light/dark
nav <home|terminal|projects|experience|contact>
projects            - list synced projects
open <n>            - open project #n (GitHub)
explore <n>         - open deploy link for project #n
copy email          - copy email to clipboard

fun:
gravity             - enable gravity drop mode (section-based)
ungrounded          - disable gravity
matrix              - toggle matrix rain
scanlines           - toggle CRT scanlines
glitch              - quick glitch the page
confetti            - celebrate
doom                - (temporary) UI chaos
`.
        trim(),
    []
  );

  function push(input: string, output: React.ReactNode) {
    setLines((l) => [...l, { id: uid(), input, output }]);
  }

  async function loadProjects(): Promise<PublicProject[]> {
    const res = await fetch("/api/projects", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
    const data = (await res.json()) as { projects: PublicProject[] };
    return data.projects ?? [];
  }

  async function runCommand(raw: string) {
    const input = raw.trim();
    if (!input) return;

    setHistory((h) => [...h, input]);
    setHistIdx(-1);

    // Hidden command: open private admin (not shown in help)
    if (input === "sudo" || input === "sudo admin" || input === "sudo admin login") {
      window.location.href = "/private-admin";
      setBuf("");
      return;
    }

    if (input === "help") {
      push(input, <pre className="whitespace-pre-wrap">{helpText}</pre>);
      setBuf("");
      return;
    }

    if (input === "clear") {
      setLines([]);
      setBuf("");
      return;
    }

    if (input === "whoami") {
      push(
        input,
        <div>
          <div className="text-zinc-200">wasim</div>
          <div className="text-zinc-400 text-xs">SDE-1 @ Qualcomm · building the control center</div>
        </div>
      );
      setBuf("");
      return;
    }

    if (input === "now") {
      push(input, <div className="text-zinc-200 font-mono">{new Date().toString()}</div>);
      setBuf("");
      return;
    }

    if (input === "theme") {
      window.dispatchEvent(new CustomEvent("toggle-theme"));
      push(input, <div>Theme toggled.</div>);
      setBuf("");
      return;
    }

    if (input.startsWith("nav ")) {
      const dest = input.slice(4).trim();
      const allowed = new Set(["home", "terminal", "projects", "experience", "contact"]);
      if (!allowed.has(dest)) {
        push(input, <div>Unknown section. Try: home | terminal | projects | experience | contact</div>);
      } else {
        window.location.hash = `#${dest}`;
        push(input, <div>Jumped to #{dest}</div>);
      }
      setBuf("");
      return;
    }

    if (input === "copy email") {
      try {
        await navigator.clipboard.writeText("wasimkonain@gmail.com");
        push(input, <div>Copied: wasimkonain@gmail.com</div>);
      } catch {
        push(input, <div>Clipboard blocked by browser.</div>);
      }
      setBuf("");
      return;
    }

    if (input === "projects") {
      push(input, <div className="text-zinc-400">Loading…</div>);
      setBuf("");
      try {
        const projects = await loadProjects();
        if (!projects.length) {
          push("(projects)", <div>No projects found. Sync in admin.</div>);
          return;
        }
        push(
          "(projects)",
          <ol className="list-decimal pl-6">
            {projects.slice(0, 15).map((p, i) => (
              <li key={p.id} className="my-1">
                <span className="text-zinc-100">{p.githubRepo ?? p.title ?? p.slug}</span>
                <span className="text-zinc-500"> — </span>
                <span className="text-zinc-400 text-xs">{(p.description || "").slice(0, 80) || "no description"}</span>
              </li>
            ))}
          </ol>
        );
      } catch (e) {
        push("(projects)", <div className="text-red-300">{e instanceof Error ? e.message : "Failed"}</div>);
      }
      return;
    }

    if (input.startsWith("open ") || input.startsWith("explore ")) {
      const mode = input.startsWith("open ") ? "open" : "explore";
      const rawN = input.replace(/^open\s+|^explore\s+/g, "").trim();
      const n = Number(rawN);
      if (!Number.isFinite(n) || n < 1) {
        push(input, <div>Usage: {mode} &lt;n&gt; (example: {mode} 1)</div>);
        setBuf("");
        return;
      }
      push(input, <div className="text-zinc-400">Loading projects…</div>);
      setBuf("");
      try {
        const projects = await loadProjects();
        const p = projects[n - 1];
        if (!p) {
          push("(open)", <div>No project at index {n}. Run: projects</div>);
          return;
        }
        const url = mode === "open" ? p.githubUrl : p.exploreUrl;
        if (!url) {
          push("(open)", <div>No link available for this project.</div>);
          return;
        }
        window.open(url, "_blank", "noopener,noreferrer");
        push("(open)", <div>Opened {url}</div>);
      } catch (e) {
        push("(open)", <div className="text-red-300">{e instanceof Error ? e.message : "Failed"}</div>);
      }
      return;
    }

    // fun commands (UI effects are handled by a page-level listener)
    if (input === "gravity") {
      emit("gravity:drop");
      push(input, <div>Gravity event: DROP.</div>);
      setBuf("");
      return;
    }

    if (input === "ungrounded") {
      emit("gravity:off");
      push(input, <div>Gravity restored.</div>);
      setBuf("");
      return;
    }

    if (input === "matrix") {
      emit("matrix:toggle");
      push(input, <div>Matrix mode toggled.</div>);
      setBuf("");
      return;
    }

    if (input === "scanlines") {
      emit("scanlines:toggle");
      push(input, <div>CRT scanlines toggled.</div>);
      setBuf("");
      return;
    }

    if (input === "glitch") {
      emit("glitch");
      push(input, <div>gl1tch.exe executed</div>);
      setBuf("");
      return;
    }

    if (input === "confetti") {
      emit("confetti");
      push(input, <div>Approved. 🎉</div>);
      setBuf("");
      return;
    }

    if (input === "doom") {
      emit("doom");
      push(input, <div>DOOM mode engaged (temporary).</div>);
      setBuf("");
      return;
    }

    push(
      input,
      <div>
        Command not found: <span className="font-mono">{input}</span>
      </div>
    );
    setBuf("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") void runCommand(buf);

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const newIdx = Math.max(-history.length, histIdx - 1);
      setHistIdx(newIdx);
      setBuf(history[history.length + newIdx]);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === -1) return;
      const newIdx = histIdx + 1;
      setHistIdx(newIdx);
      if (newIdx === -1) setBuf("");
      else setBuf(history[history.length + newIdx]);
    }
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full rounded-2xl bg-black/55 border border-white/10 p-4 md:p-5 text-sm font-mono text-zinc-200 shadow-[0_18px_80px_-45px_rgba(0,0,0,0.9)]"
      onMouseDown={() => inputRef.current?.focus()}
      onTouchStart={() => inputRef.current?.focus()}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 text-xs text-zinc-400">terminal</span>
        </div>
        <div className="text-[11px] text-zinc-500">type: <span className="text-zinc-300">help</span></div>
      </div>

      <div ref={scrollerRef} className="max-h-72 overflow-auto pr-1">
        {lines.map((ln) => (
          <div key={ln.id} className="mb-2">
            {ln.input ? (
              <div className="flex gap-3">
                <div className="text-zinc-500">&gt;</div>
                <div className="flex-1">{ln.input}</div>
              </div>
            ) : null}
            <div className={ln.input ? "ml-6" : ""}>{ln.output}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-zinc-500">&gt;</span>
        <input
          ref={inputRef}
          value={buf}
          onChange={(e) => setBuf(e.target.value)}
          onKeyDown={onKeyDown}
          className="bg-transparent outline-none flex-1 text-zinc-100 placeholder-zinc-600"
          placeholder="Type a command"
          aria-label="Terminal input"
        />
      </div>
    </motion.div>
  );
}
