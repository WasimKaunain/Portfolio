import React from "react";

async function getVisitorCount(): Promise<number | null> {
  try {
    const res = await fetch(
      "/api/visitor/stats",
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    return typeof data.total === "number" ? data.total : null;
  } catch {
    return null;
  }
}

export default async function FooterVisitorStats() {
  const count = await getVisitorCount();
  return (
    <footer className="py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-row items-center justify-end">
        <button
          type="button"
          className="ml-auto flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 hover:bg-white/10 transition px-5 py-2 shadow-lg"
          style={{ minWidth: 120 }}
          tabIndex={-1}
          aria-label="Unique visitors"
          disabled
        >
          <span className="text-xs tracking-[0.28em] uppercase text-zinc-400">Visitors</span>
          <span className="text-lg font-mono text-zinc-100">
            {count === null ? "—" : count}
          </span>
        </button>
      </div>
    </footer>
  );
}
