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
  createdAt: string;
};

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export default function ProjectsClient() {
  const [items, setItems] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const [syncUser, setSyncUser] = React.useState("WasimKaunain");
  const [syncing, setSyncing] = React.useState(false);
  const [syncMsg, setSyncMsg] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson<{ projects: Project[] }>("/api/admin/projects");
      setItems(data.projects);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function syncGithub() {
    const username = syncUser.trim();
    if (!username) {
      setSyncMsg("Enter a GitHub username");
      return;
    }

    setSyncing(true);
    setSyncMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/github/sync", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = (await res.json()) as { ok?: boolean; count?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? `Sync failed (${res.status})`);
      setSyncMsg(`Synced ${data.count ?? 0} repos.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function toggleHidden(p: Project) {
    setBusyId(p.id);
    setError(null);
    try {
      await fetchJson<{ project: Project }>(`/api/admin/projects/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ hidden: !p.hidden }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteProject(p: Project) {
    if (!confirm(`Delete project “${p.title}”?`)) return;

    setBusyId(p.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${p.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`Delete failed (${res.status})`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-base font-semibold">Repo Registry</h2>
          <p className="mt-1 text-sm text-zinc-400">This list is backed by Postgres + Prisma.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void load()}
            className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-sm"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl border border-white/8 bg-black/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Sync GitHub repos</div>
            <div className="text-xs text-zinc-400">
              Imports/updates public repos into the registry. Use Hide/Show to control what appears on the public site.
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              value={syncUser}
              onChange={(e) => setSyncUser(e.target.value)}
              className="h-10 w-full sm:w-56 rounded-xl bg-black/30 border border-white/10 px-3 outline-none font-mono text-sm"
              placeholder="GitHub username"
            />
            <button
              onClick={() => void syncGithub()}
              disabled={syncing}
              className="h-10 px-3 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 disabled:opacity-50 border border-indigo-300/20 transition text-sm"
            >
              {syncing ? "Syncing…" : "Sync"}
            </button>
          </div>
        </div>
        {syncMsg ? <div className="mt-2 text-xs text-zinc-300">{syncMsg}</div> : null}
      </div>

      {error ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}

      <div className="mt-6 grid grid-cols-1 gap-3">
        {loading ? (
          <div className="p-4 rounded-xl border border-white/8 bg-black/20 text-sm text-zinc-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-4 rounded-xl border border-white/8 bg-black/20 text-sm text-zinc-400">No repos yet.</div>
        ) : (
          items.map((p) => (
            <div key={p.id} className="p-4 rounded-xl border border-white/8 bg-black/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{p.title}</div>
                  <div className="text-xs text-zinc-400">slug: {p.slug}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {p.hidden ? "hidden (not on public site)" : "visible (public)"}
                    {p.githubOwner && p.githubRepo ? (
                      <span className="ml-2 font-mono text-zinc-400">
                        {p.githubOwner}/{p.githubRepo}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => void toggleHidden(p)}
                    disabled={busyId === p.id}
                    className="h-9 px-3 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 text-sm"
                  >
                    {p.hidden ? "Show" : "Hide"}
                  </button>
                  <a
                    href={`/private-admin/projects/${p.id}`}
                    className="h-9 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm inline-flex items-center"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => void deleteProject(p)}
                    disabled={busyId === p.id}
                    className="h-9 px-3 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {p.githubUrl ? (
                <div className="mt-3 text-xs text-zinc-400 font-mono truncate">{p.githubUrl}</div>
              ) : null}

              {p.tech?.length ? (
                <div className="mt-2 text-xs text-zinc-400">{p.tech.join(" • ")}</div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <p className="mt-4 text-xs text-zinc-500">Next: add per-repo metadata (pin/featured/order) if you want.</p>
    </div>
  );
}
