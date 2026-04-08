"use client";

import React from "react";
import { motion } from "framer-motion";
import ContactForm from "@/components/ContactForm";

export default function ContactSection() {
  return (
    <section id="contact" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div>
          <div className="text-xs tracking-[0.28em] uppercase text-zinc-400">Contact</div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Let’s build something
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            For freelance work or collaborations, send a brief below.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mt-8 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-7 md:p-10 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-sm text-zinc-300">Email</div>
              <a
                className="mt-1 block text-base text-white hover:underline underline-offset-4"
                href="mailto:wasimkonain@gmail.com"
              >
                wasimkonain@gmail.com
              </a>
              <div className="mt-3 text-xs text-zinc-500">Usually replies within 24 hours.</div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/WasimKaunain"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/12 bg-slate-800/60 px-5 py-3 text-sm text-white hover:bg-slate-800/80 transition"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/wasim-konain-a3609925a/"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/12 bg-slate-800/60 px-5 py-3 text-sm text-white hover:bg-slate-800/80 transition"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </motion.div>

        <div className="mt-10">
          <ContactForm />
        </div>

        <footer className="mt-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} Wasim Konain
        </footer>
      </div>
    </section>
  );
}
