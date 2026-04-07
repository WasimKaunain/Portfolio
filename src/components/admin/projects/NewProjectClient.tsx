"use client";

import * as React from "react";

type CreateProjectBody = {
  title: string;
  slug: string;
  description: string;
  tech?: string[];
  hidden?: boolean;
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function NewProjectClient() {
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tech, setTech] = React.useState("");
  const [hidden, setHidden] = React.useState(false);

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onTitleChange = (v: string) => {
    setTitle(v);
    setSlug((prev) => (prev ? prev : slugify(v)));
  };

  async function submit() {
    setSaving(true);
    setError(null);

    const body: CreateProjectBody = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      tech: tech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      hidden,
    };

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let msg = `Create failed (${res.status})`;
        try {
          const data = (await res.json()) as { error?: string };
          if (data?.error) msg = data.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      window.location.href = "/private-admin/projects";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
      setSaving(false);
    }
  }

  return (
    <form
      className="grid grid-cols-1 gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div>
        <label className="text-xs text-zinc-400">Title</label>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="mt-1 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 outline-none"
          placeholder="My Cool Repo"
          autoFocus
        />
      </div>
      <div>
        <label className="text-xs text-zinc-400">Slug</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 outline-none font-mono text-sm"
          placeholder="my-cool-repo"
        />
      </div>
      <div>
        <label className="text-xs text-zinc-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none min-h-28"
          placeholder="Short description (required)"
        />
      </div>
      <div>
        <label className="text-xs text-zinc-400">Tech (comma separated)</label>
        <input
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          className="mt-1 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 outline-none"
          placeholder="Next.js, TypeScript, Postgres"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
        Hidden (don’t show on public site)
      </label>

      {error ? <div className="text-sm text-red-300">{error}</div> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-11 px-4 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 disabled:opacity-50 border border-indigo-300/20 transition text-sm"
        >
          Create
        </button>
      </div>
    </form>
  );
}
