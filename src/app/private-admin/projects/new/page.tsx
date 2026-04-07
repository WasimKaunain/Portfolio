import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import { requireOwner } from "@/lib/adminAuth";
import NewProjectClient from "@/components/admin/projects/NewProjectClient";

export default async function NewProjectPage() {
  await requireOwner();

  return (
    <AdminShell title="New Project" subtitle="Create a new project entry.">
      <NewProjectClient />
    </AdminShell>
  );
}
