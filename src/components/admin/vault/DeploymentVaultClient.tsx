"use client";

import * as React from "react";

type VaultListItem = {
  id: string;
  status: string;
  productionUrl: string | null;
  project: { id: string; title: string; slug: string; githubOwner: string | null; githubRepo: string | null };
};

type VaultListResponse = {
  ok: true;
  items: VaultListItem[];
  error?: string;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const json = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error((json as any).error ?? `Request failed (${res.status})`);
  return json as T;
}

type MiniProject = {
  id: string;
  title: string;
  slug: string;
  githubOwner: string | null;
  githubRepo: string | null;
};

type MiniProjectsResponse = {
  ok: true;
  projects: MiniProject[];
  error?: string;
};

type VaultDetail = {
  id: string;
  status: string;
  productionUrl: string | null;
  notes: string | null;
  updatedAt: string;
  project: {
    id: string;
    title: string;
    slug: string;
    description: string;
    tech: string[];
    githubOwner: string | null;
    githubRepo: string | null;
    exploreUrl: string | null;
  };
  credentials: Array<{
    id: string;
    label: string;
    kind: string;
    provider: string | null;
    identifier: string | null;
    metaJson: string | null;
    hasSecret: boolean;
    updatedAt: string;
    createdAt: string;
  }>;
};

export default function DeploymentVaultClient() {
  const [items, setItems] = React.useState<VaultListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [unlocked, setUnlocked] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [busyUnlock, setBusyUnlock] = React.useState(false);

  const [showImport, setShowImport] = React.useState(false);
  const [projects, setProjects] = React.useState<MiniProject[]>([]);
  const [busyImport, setBusyImport] = React.useState<string | null>(null);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<VaultDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);

  const [credLabel, setCredLabel] = React.useState("");
  const [credKind, setCredKind] = React.useState("api_key");
  const [credProvider, setCredProvider] = React.useState("");
  const [credIdentifier, setCredIdentifier] = React.useState("");
  const [credMeta, setCredMeta] = React.useState("");
  const [credSecret, setCredSecret] = React.useState("");
  const [busyCreateCred, setBusyCreateCred] = React.useState(false);

  const [revealedId, setRevealedId] = React.useState<string | null>(null);
  const [revealedSecret, setRevealedSecret] = React.useState<string | null>(null);
  const [busyReveal, setBusyReveal] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson<VaultListResponse>("/api/admin/vault");
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vault");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnlockStatus = React.useCallback(async () => {
    try {
      const res = await fetchJson<{ ok: true; unlocked: boolean }>("/api/admin/vault/reveal/status");
      setUnlocked(Boolean(res.unlocked));
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    void load();

    // Require password entry each time user lands on this page.
    // (We still keep the server cookie for the Reveal API, but the UI starts locked.)
    setUnlocked(false);
    setPassword("");

    // Best-effort: clear any existing reveal cookie so a fresh visit always asks.
    void fetch("/api/admin/vault/reveal/logout", { method: "POST" }).catch(() => undefined);
  }, [load]);

  async function unlock() {
    setBusyUnlock(true);
    setError(null);
    try {
      await fetchJson("/api/admin/vault/reveal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setPassword("");
      setUnlocked(true);
      await load();
    } catch (e) {
      setUnlocked(false);
      setError(e instanceof Error ? e.message : "Unlock failed");
    } finally {
      setBusyUnlock(false);
    }
  }

  async function lock() {
    setBusyUnlock(true);
    setError(null);
    try {
      await fetchJson("/api/admin/vault/reveal/logout", { method: "POST" });
      setUnlocked(false);
      setDetail(null);
      setActiveId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lock failed");
    } finally {
      setBusyUnlock(false);
    }
  }

  async function loadProjectsForImport() {
    setError(null);
    try {
      const data = await fetchJson<MiniProjectsResponse>("/api/admin/projects/minimal");
      setProjects(data.projects ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    }
  }

  async function importProject(projectId: string) {
    setBusyImport(projectId);
    setError(null);
    try {
      await fetchJson("/api/admin/vault/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      setShowImport(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusyImport(null);
    }
  }

  React.useEffect(() => {
    if (!showImport) return;
    void loadProjectsForImport();
  }, [showImport]);

  function prettyProj(p: MiniProject) {
    return p.githubOwner && p.githubRepo ? `${p.githubOwner}/${p.githubRepo}` : p.slug;
  }

  async function openDetail(id: string) {
    setActiveId(id);
    setLoadingDetail(true);
    setError(null);
    setRevealedId(null);
    setRevealedSecret(null);
    try {
      const data = await fetchJson<{ ok: true; item: VaultDetail }>(`/api/admin/vault/${encodeURIComponent(id)}`);
      setDetail(data.item);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load details");
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function refreshDetail() {
    if (!activeId) return;
    await openDetail(activeId);
  }

  async function saveDetailPatch(patch: Partial<Pick<VaultDetail, "status" | "productionUrl" | "notes">>) {
    if (!activeId) return;
    setError(null);

    // Optimistic update so inputs remain editable while we persist.
    setDetail((prev) => (prev ? ({ ...prev, ...patch } as VaultDetail) : prev));

    try {
      await fetchJson(`/api/admin/vault/${encodeURIComponent(activeId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      // Avoid reloading detail here; it makes typing feel like a reload.
      // The list can be refreshed manually if needed.
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      // Fallback to server state if save failed.
      await refreshDetail();
    }
  }

  async function createCredential() {
    if (!detail) return;
    setBusyCreateCred(true);
    setError(null);
    try {
      await fetchJson("/api/admin/vault/credentials/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vaultProjectId: detail.id,
          label: credLabel,
          kind: credKind,
          provider: credProvider,
          identifier: credIdentifier,
          metaJson: credMeta,
          secret: credSecret,
        }),
      });
      setCredLabel("");
      setCredProvider("");
      setCredIdentifier("");
      setCredMeta("");
      setCredSecret("");
      await refreshDetail();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create credential");
    } finally {
      setBusyCreateCred(false);
    }
  }

  async function revealCredential(credId: string) {
    setBusyReveal(true);
    setError(null);
    try {
      const data = await fetchJson<{ ok: true; secret: string | null }>(
        `/api/admin/vault/credentials/${encodeURIComponent(credId)}/reveal`,
      );
      setRevealedId(credId);
      setRevealedSecret(data.secret);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reveal failed");
      setRevealedId(null);
      setRevealedSecret(null);
    } finally {
      setBusyReveal(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Deployed projects</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Import any portfolio project into the vault to attach hosting, APIs, credentials and free-tier limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-sm"
          >
            Import from Projects
          </button>

          {unlocked ? (
            <button
              onClick={() => void lock()}
              disabled={busyUnlock}
              className="h-10 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-400/20 transition text-sm"
              title="Lock secret reveal"
            >
              Vault unlocked
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Vault password"
                className="h-10 w-44 rounded-xl border border-white/10 bg-black/35 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-white/20"
              />
              <button
                onClick={() => void unlock()}
                disabled={busyUnlock || !password.trim()}
                className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-60 border border-white/10 transition text-sm"
              >
                {busyUnlock ? "…" : "Unlock"}
              </button>
            </div>
          )}

          <button
            onClick={() => void load()}
            disabled={loading}
            className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}

      <div className="mt-6 rounded-2xl border border-white/8 overflow-hidden">
        <div className="grid grid-cols-12 gap-0 bg-white/5 text-xs text-zinc-300">
          <div className="p-3 col-span-5">Project</div>
          <div className="p-3 col-span-2">Status</div>
          <div className="p-3 col-span-5">Production URL</div>
        </div>

        {!unlocked ? (
          <div className="p-5 text-sm text-zinc-400">
            Enter the vault password to view deployed projects.
            <div className="mt-2 text-xs text-zinc-500">
              (The list and details are hidden until unlocked. Secret reveal is also protected by the unlock cookie.)
            </div>
          </div>
        ) : loading ? (
          <div className="p-4 text-sm text-zinc-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-zinc-400">No items in the vault yet.</div>
        ) : (
          items.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => void openDetail(it.id)}
              className="grid grid-cols-12 gap-0 text-sm text-left hover:bg-white/[0.03] transition"
              title="Open details"
            >
              <div className="p-3 border-t border-white/8 col-span-5">
                <div className="font-medium text-zinc-100 truncate">{it.project.title}</div>
                <div className="text-xs text-zinc-500 font-mono truncate">
                  {it.project.githubOwner && it.project.githubRepo
                    ? `${it.project.githubOwner}/${it.project.githubRepo}`
                    : it.project.slug}
                </div>
              </div>
              <div className="p-3 border-t border-white/8 col-span-2 text-zinc-300">{it.status}</div>
              <div className="p-3 border-t border-white/8 col-span-5">
                {it.productionUrl ? (
                  <span className="text-zinc-200 underline underline-offset-2 break-all">{it.productionUrl}</span>
                ) : (
                  <span className="text-zinc-500">—</span>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-zinc-500">
        Secrets are encrypted at rest. Revealing secrets requires the vault password and unlocks reveal for ~10 minutes.
      </div>

      {showImport ? (
        <div className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#071026]/85 shadow-2xl overflow-hidden my-auto">
            <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Import from Projects</div>
                <div className="mt-1 text-xs text-zinc-400">
                  Creates a vault record (1 per project). The project remains in the Projects section.
                </div>
              </div>
              <button
                className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-sm"
                onClick={() => setShowImport(false)}
              >
                Close
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-white/8 overflow-hidden">
                <div className="grid grid-cols-12 gap-0 bg-white/5 text-xs text-zinc-300">
                  <div className="p-3 col-span-7">Project</div>
                  <div className="p-3 col-span-3">Repo/Slug</div>
                  <div className="p-3 col-span-2">Action</div>
                </div>

                {projects.length === 0 ? (
                  <div className="p-4 text-sm text-zinc-400">Loading…</div>
                ) : (
                  projects.map((p) => {
                    const inVault = items.some((it) => it.project.id === p.id);
                    return (
                      <div key={p.id} className="grid grid-cols-12 gap-0 text-sm">
                        <div className="p-3 border-t border-white/8 col-span-7">
                          <div className="font-medium text-zinc-100 truncate">{p.title}</div>
                        </div>
                        <div className="p-3 border-t border-white/8 col-span-3 text-xs font-mono text-zinc-400 truncate">
                          {prettyProj(p)}
                        </div>
                        <div className="p-3 border-t border-white/8 col-span-2">
                          {inVault ? (
                            <span className="text-xs text-zinc-500">Imported</span>
                          ) : (
                            <button
                              onClick={() => void importProject(p.id)}
                              disabled={busyImport === p.id}
                              className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-60 border border-white/10 transition text-xs"
                            >
                              {busyImport === p.id ? "…" : "Import"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {detail ? (
        <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#071026]/85 shadow-2xl overflow-hidden my-auto">
            <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Project details</div>
                <div className="mt-1 text-xs text-zinc-400">Edit status, production URL, notes. Manage credentials.</div>
              </div>
              <button
                className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-sm"
                onClick={() => {
                  setDetail(null);
                  setActiveId(null);
                }}
              >
                Close
              </button>
            </div>

            <div className="p-5">
              {loadingDetail ? <div className="mb-4 text-sm text-zinc-400">Loading…</div> : null}

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-8">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                      <label className="block text-xs font-medium text-zinc-400">Status</label>
                      <select
                        value={detail.status}
                        onChange={(e) => void saveDetailPatch({ status: e.target.value })}
                        className="mt-1 block w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/20"
                      >
                        <option value="deployed">Deployed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-span-6">
                      <label className="block text-xs font-medium text-zinc-400">Production URL</label>
                      <input
                        value={detail.productionUrl ?? ""}
                        onChange={(e) => void saveDetailPatch({ productionUrl: e.target.value })}
                        type="url"
                        placeholder="https://example.com"
                        className="mt-1 block w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/20"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-zinc-400">Notes</label>
                    <textarea
                      value={detail.notes ?? ""}
                      onChange={(e) => void saveDetailPatch({ notes: e.target.value })}
                      rows={3}
                      placeholder="Optional notes about this project"
                      className="mt-1 block w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/20"
                    />
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Credentials</div>
                      <button
                        type="button"
                        onClick={() => {
                          setCredLabel("new credential");
                          setCredSecret("");
                          setCredProvider("");
                          setCredIdentifier("");
                          setCredMeta("");
                        }}
                        className="text-sm text-zinc-400 hover:text-zinc-300 transition"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="mt-2 rounded-xl border border-white/8 bg-[#0a1421]">
                      {detail.credentials.length === 0 ? (
                        <div className="p-4 text-sm text-zinc-400">No credentials yet.</div>
                      ) : (
                        detail.credentials.map((cred) => (
                          <div
                            key={cred.id}
                            className="flex items-center justify-between p-4 text-sm border-b border-white/8 last:border-b-0"
                          >
                            <div className="min-w-0">
                              <div className="font-medium text-zinc-100 truncate">{cred.label}</div>
                              <div className="text-xs text-zinc-500 font-mono truncate">
                                {cred.provider && cred.identifier
                                  ? `${cred.provider}: ${cred.identifier}`
                                  : cred.metaJson || "—"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void revealCredential(cred.id)}
                                disabled={busyReveal}
                                className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-60 border border-white/10 transition text-xs"
                              >
                                {busyReveal && revealedId === cred.id ? "…" : "Reveal"}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {revealedSecret != null ? (
                      <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                        <div className="text-xs font-medium text-emerald-200">Revealed secret</div>
                        <div className="mt-2 flex items-start justify-between gap-3">
                          <pre className="text-xs text-emerald-100 whitespace-pre-wrap break-all leading-relaxed">{revealedSecret}</pre>
                          <button
                            type="button"
                            className="h-8 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-400/20 transition text-xs"
                            onClick={() => void navigator.clipboard.writeText(revealedSecret)}
                          >
                            Copy
                          </button>
                        </div>
                        {!unlocked ? (
                          <div className="mt-2 text-xs text-emerald-200/80">
                            If reveal fails, unlock the vault first (top right) and retry.
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="col-span-12 md:col-span-4">
                  <div className="text-sm font-semibold">Project</div>
                  <div className="mt-2 rounded-xl border border-white/8 bg-[#0a1421] p-4">
                    <div className="text-sm font-medium text-zinc-100">{detail.project.title}</div>
                    <div className="mt-1 text-xs text-zinc-500 font-mono">
                      {detail.project.githubOwner && detail.project.githubRepo
                        ? `${detail.project.githubOwner}/${detail.project.githubRepo}`
                        : detail.project.slug}
                    </div>
                  </div>
                </div>
              </div>

              {credLabel.trim().length > 0 ? (
                <div className="mt-6">
                  <div className="text-sm font-semibold">New credential</div>

                  <div className="grid grid-cols-12 gap-4 mt-2">
                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-xs font-medium text-zinc-400">Label</label>
                      <input
                        value={credLabel}
                        onChange={(e) => setCredLabel(e.target.value)}
                        type="text"
                        placeholder="E.g. Vercel token"
                        className="mt-1 block w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/20"
                      />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-xs font-medium text-zinc-400">Kind</label>
                      <select
                        value={credKind}
                        onChange={(e) => setCredKind(e.target.value)}
                        className="mt-1 block w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-100 focus:border-white/20"
                      >
                        <option value="api_key">API key</option>
                        <option value="token">Token</option>
                        <option value="password">Password</option>
                        <option value="connection_string">Connection string</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-xs font-medium text-zinc-400">Provider (optional)</label>
                      <input
                        value={credProvider}
                        onChange={(e) => setCredProvider(e.target.value)}
                        type="text"
                        placeholder="E.g. vercel / aws / neon"
                        className="mt-1 block w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/20"
                      />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-xs font-medium text-zinc-400">Identifier (optional)</label>
                      <input
                        value={credIdentifier}
                        onChange={(e) => setCredIdentifier(e.target.value)}
                        type="text"
                        placeholder="E.g. account / username / key id"
                        className="mt-1 block w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/20"
                      />
                    </div>

                    <div className="col-span-12">
                      <label className="block text-xs font-medium text-zinc-400">Meta JSON (optional)</label>
                      <textarea
                        value={credMeta}
                        onChange={(e) => setCredMeta(e.target.value)}
                        rows={2}
                        placeholder='{"region":"ap-south-1"}'
                        className="mt-1 block w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/20"
                      />
                    </div>

                    <div className="col-span-12">
                      <label className="block text-xs font-medium text-zinc-400">Secret</label>
                      <textarea
                        value={credSecret}
                        onChange={(e) => setCredSecret(e.target.value)}
                        rows={3}
                        placeholder="Will be encrypted at rest"
                        className="mt-1 block w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/20"
                      />
                    </div>

                    <div className="col-span-12 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void createCredential()}
                        disabled={busyCreateCred || !credLabel.trim() || !credSecret.trim()}
                        className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-60 border border-white/10 transition text-sm"
                      >
                        {busyCreateCred ? "Saving…" : "Save credential"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCredLabel("");
                          setCredSecret("");
                        }}
                        className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-sm text-zinc-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* ...existing code... */}
    </div>
  );
}
