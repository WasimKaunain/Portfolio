import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import { requireOwner } from "@/lib/adminAuth";
import DeploymentVaultClient from "@/components/admin/vault/DeploymentVaultClient";

export default async function AdminVaultPage() {
  await requireOwner();

  return (
    <AdminShell
      title="Deployment Vault"
      subtitle="Private deployed-projects vault (encrypted secrets)."
    >
      <DeploymentVaultClient />
    </AdminShell>
  );
}
