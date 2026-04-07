import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import { requireOwner } from "@/lib/adminAuth";
import LogsClient from "@/components/admin/logs/LogsClient";

export default async function AdminLogsPage() {
  await requireOwner();

  return (
    <AdminShell title="API Logs" subtitle="Request audit trail. Useful for usage analytics and anomaly detection.">
      <LogsClient />
    </AdminShell>
  );
}
