"use client";

import * as React from "react";

type Item = {
  id: string;
  createdAt: string;
  path: string;
  country: string | null;
  region: string | null;
  city: string | null;
};

type StatsResponse = {
  ok: boolean;
  total: number;
  items: Item[];
  nextCursor: string | null;
  error?: string;
};

export default function VisitorStatsDropdown() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [total, setTotal] = React.useState<number | null>(null);
  const [items, setItems] = React.useState<Item[]>([]);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);

  const load = React.useCallback(async (cursor?: string) => {
    if (cursor) setLoadingMore(true);
    else setLoading(true);

    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("take", "10");
      if (cursor) qs.set("cursor", cursor);

      const res = await fetch(`/api/visitor/stats?${qs.toString()}`, { cache: "no-store" });
      const data = (await res.json()) as StatsResponse;
      if (!res.ok || !data.ok) throw new Error(data.error ?? `Request failed (${res.status})`);

      setTotal(data.total);
      setNextCursor(data.nextCursor);
      setItems((prev) => (cursor ? [...prev, ...data.items] : data.items));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load visitor stats");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  React.useEffect(() => {
    if (open && total === null && !loading) void load();
  }, [open, total, loading, load]);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <div className="text-xs tracking-[0.28em] uppercase text-zinc-400">Visitors</div>
          <div className="text-sm text-zinc-200 font-mono">
            {total === null ? "—" : total}
          </div>
        </div>
        <div className="text-xs text-zinc-400">{open ? "Hide" : "Details"}</div>
      </button>

      {open ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/25 overflow-hidden">
          <div className="grid grid-cols-4 bg-white/5 text-[11px] text-zinc-300">
            <div className="p-3">When</div>
            <div className="p-3">Page</div>
            <div className="p-3">Location</div>
            <div className="p-3">Country</div>
          </div>

          {loading ? (
            <div className="p-4 text-sm text-zinc-400">Loading…</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-300">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-zinc-400">No visits recorded yet.</div>
          ) : (
            <>
              {items.map((it) => {
                const when = new Date(it.createdAt).toLocaleString();
                const loc = [it.city, it.region].filter(Boolean).join(", ") || "—";
                return (
                  <div key={it.id} className="grid grid-cols-4 text-sm">
                    <div className="p-3 border-t border-white/8 text-zinc-300">{when}</div>
                    <div className="p-3 border-t border-white/8 text-zinc-300 font-mono truncate">{it.path}</div>
                    <div className="p-3 border-t border-white/8 text-zinc-300 truncate">{loc}</div>
                    <div className="p-3 border-t border-white/8 text-zinc-300">{it.country ?? "—"}</div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between gap-3 p-3 border-t border-white/8">
                <div className="text-xs text-zinc-500">Showing latest {items.length}</div>
                <button
                  type="button"
                  disabled={!nextCursor || loadingMore}
                  onClick={() => nextCursor && void load(nextCursor)}
                  className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? "Loading…" : "Next page"}
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
