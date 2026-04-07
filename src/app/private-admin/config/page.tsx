import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import { requireOwner } from "@/lib/adminAuth";

function mask(v?: string) {
  if (!v) return "—";
  if (v.length <= 6) return "******";
  return `${v.slice(0, 2)}******${v.slice(-2)}`;
}

export default async function AdminConfigPage() {
  await requireOwner();

  return (
    <AdminShell title="Config" subtitle="View masked configuration (never show secrets in full).">
      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-xl border border-white/8 bg-black/20 p-4">
          <div className="text-xs text-zinc-400">DATABASE_URL</div>
          <div className="mt-2 font-mono text-sm text-zinc-200">{mask(process.env.DATABASE_URL)}</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-black/20 p-4">
          <div className="text-xs text-zinc-400">UPSTASH_REDIS_REST_URL</div>
          <div className="mt-2 font-mono text-sm text-zinc-200">{mask(process.env.UPSTASH_REDIS_REST_URL)}</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-black/20 p-4">
          <div className="text-xs text-zinc-400">OWNER_EMAIL</div>
          <div className="mt-2 font-mono text-sm text-zinc-200">{process.env.OWNER_EMAIL ?? "—"}</div>
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        This page is intentionally read-only and masked. Do not implement secret editing in the browser.
      </p>
    </AdminShell>
  );
}
