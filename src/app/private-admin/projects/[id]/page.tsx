import React from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { requireOwner } from "@/lib/adminAuth";
import EditProjectClient from "@/components/admin/projects/EditProjectClient";

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  await requireOwner();

  const { id } = await props.params;

  return (
    <AdminShell
      title="Edit Project"
      subtitle={`Project ID: ${id}`}
      right={
        <Link
          href="/private-admin/projects"
          className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-sm"
        >
          Back
        </Link>
      }
    >
      <EditProjectClient id={id} />
    </AdminShell>
  );
}
