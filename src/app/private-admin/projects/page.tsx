import React from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { requireOwner } from "@/lib/adminAuth";
import ProjectsClient from "@/components/admin/projects/ProjectsClient";

export default async function AdminProjectsPage() {
  await requireOwner();

  return (
    <AdminShell
      title="Projects"
      subtitle="Manage your public projects (create, edit, publish)."
      right={
        <Link
          href="/private-admin/projects/new"
          className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-sm"
        >
          New project
        </Link>
      }
    >
      <ProjectsClient />
    </AdminShell>
  );
}
