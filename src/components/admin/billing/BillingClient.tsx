"use client";

import * as React from "react";

type BillingRecord = {
  id: string;
  provider: string;
  periodStart: string;
  periodEnd: string;
  requests: number;
  costUsd: string;
  createdAt: string;
};

type BillingSummary = {
  records: BillingRecord[];
  totals: { requests: number; costUsd: string };
};

export default function BillingClient() {
  const [data, setData] = React.useState<BillingSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/billing", { cache: "no-store" });
      const json = (await res.json()) as BillingSummary & { error?: string };
      if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
      setData({ records: json.records, totals: json.totals });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load billing");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const totals = data?.totals;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-black/20 border border-white/8">
          <div className="text-xs text-zinc-400">Total usage (all records)</div>
          <div className="mt-2 text-2xl font-semibold">{loading ? "—" : totals?.requests ?? 0}</div>
          <div className="mt-1 text-xs text-zinc-500">requests</div>
        </div>
        <div className="p-4 rounded-xl bg-black/20 border border-white/8">
          <div className="text-xs text-zinc-400">Total cost</div>
          <div className="mt-2 text-2xl font-semibold">{loading ? "—" : `$${totals?.costUsd ?? "0"}`}</div>
          <div className="mt-1 text-xs text-zinc-500">from `BillingRecord`</div>
        </div>
        <div className="p-4 rounded-xl bg-black/20 border border-white/8">
          <div className="text-xs text-zinc-400">Alert threshold</div>
          <div className="mt-2 text-2xl font-semibold">$25</div>
          <div className="mt-1 text-xs text-zinc-500">(static placeholder)</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Records</h2>
            <p className="mt-1 text-sm text-zinc-400">Populated from `BillingRecord`.</p>
          </div>
          <button
            onClick={() => void load()}
            className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-sm"
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {error ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}

        <div className="mt-3 overflow-hidden rounded-xl border border-white/8">
          <div className="grid grid-cols-4 gap-0 bg-white/5 text-xs text-zinc-300">
            <div className="p-3">Period</div>
            <div className="p-3">Provider</div>
            <div className="p-3">Usage</div>
            <div className="p-3">Cost</div>
          </div>

          {loading ? (
            <div className="p-4 text-sm text-zinc-400">Loading…</div>
          ) : (data?.records?.length ?? 0) === 0 ? (
            <div className="p-4 text-sm text-zinc-400">No billing records yet.</div>
          ) : (
            data!.records.map((r) => (
              <div key={r.id} className="grid grid-cols-4 gap-0 text-sm">
                <div className="p-3 border-t border-white/8 text-zinc-300">
                  {new Date(r.periodStart).toLocaleDateString()} → {new Date(r.periodEnd).toLocaleDateString()}
                </div>
                <div className="p-3 border-t border-white/8 text-zinc-300 font-mono">{r.provider}</div>
                <div className="p-3 border-t border-white/8 text-zinc-300">{r.requests}</div>
                <div className="p-3 border-t border-white/8 text-zinc-300">${r.costUsd}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
