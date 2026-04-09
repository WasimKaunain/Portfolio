"use client";

import * as React from "react";

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  tech: string[];
  hidden: boolean;
  githubOwner: string | null;
  githubRepo: string | null;
  githubUrl: string | null;
  exploreUrl?: string | null;
  createdAt: string;
};

type ApiError = { error?: string };

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as ApiError;
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export default function EditProjectClient({ id }: { id: string }) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedMsg, setSavedMsg] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tech, setTech] = React.useState("");
  const [hidden, setHidden] = React.useState(false);
  const [exploreUrl, setExploreUrl] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson<{ project: Project }>(`/api/admin/projects/${id}`);
      const p = data.project;
      setTitle(p.title);
      setSlug(p.slug);
      setDescription(p.description ?? "");
      setTech((p.tech ?? []).join(", "));
      setHidden(Boolean(p.hidden));
      setExploreUrl(p.exploreUrl ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    try {
      await fetchJson<{ project: Project }>(`/api/admin/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim(),
          tech: tech
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          hidden,
          // PATCH schema treats "" as "no update"; don't send null.
          exploreUrl: exploreUrl.trim(),
        }),
      });

      setSavedMsg("Saved successfully.");

      // Give a quick visual confirmation, then return to list.
      window.setTimeout(() => {
        window.location.href = "/private-admin/projects";
      }, 450);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this project?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`Delete failed (${res.status})`);
      window.location.href = "/private-admin/projects";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-4 rounded-xl border border-white/8 bg-black/20 text-sm text-zinc-400">Loading…</div>;
  }

  return (
    <div>
      {error ? <div className="mb-4 text-sm text-red-300">{error}</div> : null}
      {savedMsg ? <div className="mb-4 text-sm text-emerald-300">{savedMsg}</div> : null}

      <form
        className="grid grid-cols-1 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div>
          <label className="text-xs text-zinc-400">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 outline-none font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none min-h-28"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400">Tech (comma separated)</label>
          <input
            value={tech}
            onChange={(e) => setTech(e.target.value)}
            className="mt-1 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400">Explore URL (deployed site)</label>
          <input
            value={exploreUrl}
            onChange={(e) => setExploreUrl(e.target.value)}
            placeholder="https://your-project.com"
            className="mt-1 w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 outline-none font-mono text-sm"
          />
          <p className="mt-2 text-[11px] text-zinc-500">
            Shows as the “Explore” button on the public landing page. Leave empty to hide.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
          Hidden (don’t show on public site)
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 border border-white/10 transition text-sm"
          >
            Save
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void remove()}
            className="h-11 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 border border-red-300/20 transition text-sm"
          >
            Delete
          </button>
        </div>

        <p className="text-xs text-zinc-500">
          GitHub fields are synced (owner/repo/url). Use the Projects list to hide/show repos from the public site.
        </p>
      </form>
    </div>
  );
}
