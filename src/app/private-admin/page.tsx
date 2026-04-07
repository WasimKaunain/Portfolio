import React from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { requireOwner } from "@/lib/adminAuth";

export default async function PrivateAdminPage() {
  const session = await requireOwner();

  return (
    <AdminShell
      title="Private Admin"
      subtitle="Owner-only control panel (billing, logs, projects, config)."
      right={
        <div className="text-xs text-zinc-400">
          Signed in as{" "}
          <span className="font-mono text-zinc-200">{session.user?.email}</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/private-admin/projects"
          className="block p-5 rounded-xl bg-black/20 border border-white/8 hover:bg-black/30 transition"
        >
          <div className="text-sm font-semibold">Projects</div>
          <div className="mt-1 text-sm text-zinc-400">
            Create/edit projects and publish updates.
          </div>
        </Link>
        <Link
          href="/private-admin/billing"
          className="block p-5 rounded-xl bg-black/20 border border-white/8 hover:bg-black/30 transition"
        >
          <div className="text-sm font-semibold">Billing</div>
          <div className="mt-1 text-sm text-zinc-400">
            Usage tracking, cost estimation, alerts.
          </div>
        </Link>
        <Link
          href="/private-admin/logs"
          className="block p-5 rounded-xl bg-black/20 border border-white/8 hover:bg-black/30 transition"
        >
          <div className="text-sm font-semibold">API Logs</div>
          <div className="mt-1 text-sm text-zinc-400">
            Audit trail and anomaly signals.
          </div>
        </Link>
        <Link
          href="/private-admin/config"
          className="block p-5 rounded-xl bg-black/20 border border-white/8 hover:bg-black/30 transition"
        >
          <div className="text-sm font-semibold">Config</div>
          <div className="mt-1 text-sm text-zinc-400">
            Masked environment overview.
          </div>
        </Link>
      </div>
    </AdminShell>
  );
}
