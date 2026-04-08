"use client";

import * as React from "react";
import { motion } from "framer-motion";

type State =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent" }
  | { status: "error"; message: string };

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export default function ContactForm() {
  const [state, setState] = React.useState<State>({ status: "idle" });
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [budget, setBudget] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [companyWebsite, setCompanyWebsite] = React.useState(""); // honeypot

  const disabled = state.status === "sending";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "sending" });
    try {
      await postJson<{ ok: true; delivered: boolean }>("/api/contact", {
        name: name.trim(),
        email: email.trim(),
        budget: budget.trim(),
        message: message.trim(),
        companyWebsite: companyWebsite.trim(),
      });
      setState({ status: "sent" });
      setMessage("");
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Failed" });
    }
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[32px] border border-black/10 bg-[#f3f1ea]/92 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_30px_120px_-60px_rgba(255,236,170,0.65)]"
    >
      {/* top highlight bar */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />

      {/* warm glow */}
      <div
        aria-hidden
        className="absolute -inset-10 opacity-[0.55] [background:radial-gradient(700px_circle_at_35%_10%,rgba(255,200,75,0.40),transparent_55%),radial-gradient(900px_circle_at_80%_70%,rgba(255,120,120,0.22),transparent_55%)]"
      />

      <div aria-hidden className="absolute inset-0 opacity-[0.22]">
        <div className="absolute -left-36 -top-36 h-80 w-80 rounded-full bg-amber-400/25 blur-3xl" />
        <div className="absolute -right-36 -bottom-36 h-80 w-80 rounded-full bg-orange-400/20 blur-3xl" />
      </div>

      <div className="relative p-7 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.28em] uppercase text-black/60">Freelance / Hiring</div>
            <h3 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-black">
              Send a project brief
            </h3>
            <p className="mt-2 text-sm text-black/70 max-w-xl">
              I reply fast. Share what you’re building, timeline, and any constraints.
            </p>
          </div>
          <div className="text-[11px] font-mono text-black/45">secure → email</div>
        </div>

        {/* Honeypot */}
        <div className="sr-only" aria-hidden>
          <label>Company website</label>
          <input
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-black/60">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={disabled}
              className="mt-1 w-full h-11 rounded-2xl bg-white/70 border border-black/10 px-4 outline-none focus:border-black/25 focus:bg-white transition"
            />
          </div>
          <div>
            <label className="text-xs text-black/60">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              disabled={disabled}
              className="mt-1 w-full h-11 rounded-2xl bg-white/70 border border-black/10 px-4 outline-none focus:border-black/25 focus:bg-white transition"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-black/60">Budget (optional)</label>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              disabled={disabled}
              placeholder="$500 / $2k / TBD"
              className="mt-1 w-full h-11 rounded-2xl bg-white/70 border border-black/10 px-4 outline-none focus:border-black/25 focus:bg-white transition"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-black/60">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={disabled}
              rows={7}
              placeholder="What are you building? When do you want to ship? Any links?"
              className="mt-1 w-full rounded-2xl bg-white/70 border border-black/10 px-4 py-3 outline-none focus:border-black/25 focus:bg-white transition resize-none"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-xs text-black/55">
            {state.status === "sent" ? (
              <span className="text-emerald-700">Message sent. Thanks — I’ll reply soon.</span>
            ) : state.status === "error" ? (
              <span className="text-red-700">{state.message}</span>
            ) : (
              <span>By sending, you agree to be contacted back.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="group inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-black text-white px-5 py-3 text-sm hover:bg-black/90 disabled:opacity-60 transition shadow-[0_12px_35px_-20px_rgba(0,0,0,0.55)]"
          >
            {state.status === "sending" ? "Sending…" : "Send"}
            <span className="text-white/80 group-hover:text-white transition">↗</span>
          </button>
        </div>
      </div>
    </motion.form>
  );
}
