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
        budget: "", // keep API payload shape stable
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
      className="relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-900/45 backdrop-blur-xl text-white shadow-2xl"
    >
      {/* subtle glow */}
      <div
        aria-hidden
        className="absolute -inset-10 opacity-[0.35] [background:radial-gradient(700px_circle_at_30%_20%,rgba(255,255,255,0.10),transparent_55%),radial-gradient(900px_circle_at_80%_70%,rgba(99,102,241,0.10),transparent_55%)]"
      />

      <div className="relative p-7 md:p-10">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/70">
              Name<span className="text-red-300">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={disabled}
              placeholder="Your Name"
              className="mt-1 w-full h-11 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-white/25 focus:bg-white/8 transition"
            />
          </div>
          <div>
            <label className="text-xs text-white/70">
              Email<span className="text-red-300">*</span>
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              disabled={disabled}
              placeholder="Your Email"
              className="mt-1 w-full h-11 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-white/25 focus:bg-white/8 transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-white/70">
              Message<span className="text-red-300">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={disabled}
              rows={7}
              placeholder="Message"
              className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/25 focus:bg-white/8 transition resize-none"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs text-white/60">
            {state.status === "sent" ? (
              <span className="text-emerald-300">Message sent. I’ll get back to you soon.</span>
            ) : state.status === "error" ? (
              <span className="text-red-300">{state.message}</span>
            ) : (
              <span>By sending, you agree to be contacted back.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="group inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-2xl border border-white/12 bg-white/10 text-white px-5 py-3 text-sm hover:bg-white/14 disabled:opacity-60 transition"
          >
            {state.status === "sending" ? "Sending…" : "Send"}
            <span className="text-white/70 group-hover:text-white transition">↗</span>
          </button>
        </div>
      </div>
    </motion.form>
  );
}
