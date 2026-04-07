"use client";

import * as React from "react";

type ApiLog = {
  id: string;
  route: string;
  method: string;
  status: number;
  latencyMs: number | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

type LogsResponse = {
  logs: ApiLog[];
  nextCursor: string | null;
  error?: string;
};

export default function LogsClient() {
  const [items, setItems] = React.useState<ApiLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [busyMore, setBusyMore] = React.useState(false);

  const loadFirst = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/logs?take=30", { cache: "no-store" });
      const data = (await res.json()) as LogsResponse;
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setItems(data.logs);
      setNextCursor(data.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = React.useCallback(async () => {
    if (!nextCursor) return;
    setBusyMore(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/logs?take=30&cursor=${encodeURIComponent(nextCursor)}`, { cache: "no-store" });
      const data = (await res.json()) as LogsResponse;
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setItems((prev) => [...prev, ...data.logs]);
      setNextCursor(data.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more logs");
    } finally {
      setBusyMore(false);
    }
  }, [nextCursor]);

  React.useEffect(() => {
    void loadFirst();
  }, [loadFirst]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Recent requests</h2>
          <p className="mt-1 text-sm text-zinc-400">Stored from server API routes into `ApiLog`.</p>
        </div>
        <button
          onClick={() => void loadFirst()}
          className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-sm"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}

      <div className="mt-4 overflow-hidden rounded-xl border border-white/8">
        <div className="grid grid-cols-5 bg-white/5 text-xs text-zinc-300">
          <div className="p-3">Time</div>
          <div className="p-3">Route</div>
          <div className="p-3">Method</div>
          <div className="p-3">Status</div>
          <div className="p-3">Latency</div>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-zinc-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-zinc-400">No logs yet.</div>
        ) : (
          items.map((l) => (
            <div key={l.id} className="grid grid-cols-5 text-sm">
              <div className="p-3 border-t border-white/8 text-zinc-300">{new Date(l.createdAt).toLocaleString()}</div>
              <div className="p-3 border-t border-white/8 text-zinc-300 font-mono truncate">{l.route}</div>
              <div className="p-3 border-t border-white/8 text-zinc-300">{l.method}</div>
              <div className="p-3 border-t border-white/8 text-zinc-300">{l.status}</div>
              <div className="p-3 border-t border-white/8 text-zinc-300">{l.latencyMs ?? "—"}</div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-zinc-500">Showing {items.length} rows</div>
        <button
          onClick={() => void loadMore()}
          disabled={!nextCursor || busyMore}
          className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 border border-white/10 transition text-sm"
        >
          {busyMore ? "Loading…" : nextCursor ? "Load more" : "No more"}
        </button>
      </div>
    </div>
  );
}
