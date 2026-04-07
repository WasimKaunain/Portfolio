import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import { requireOwner } from "@/lib/adminAuth";
import BillingClient from "@/components/admin/billing/BillingClient";

export default async function AdminBillingPage() {
  await requireOwner();

  return (
    <AdminShell title="Billing" subtitle="Usage tracking, cost estimation, and alerts.">
      <BillingClient />
    </AdminShell>
  );
}
