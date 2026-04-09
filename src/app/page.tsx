import React from "react";
import TopNav from "@/components/TopNav";
import HeroFull from "@/components/HeroFull";
import ProjectsScroll from "@/components/ProjectsScroll";
import ExperienceSection from "@/components/ExperienceSection";
import GitHubHeatmap from "@/components/GitHubHeatmap";
import Terminal from "@/components/Terminal";
import ContactSection from "@/components/ContactSection";
import ClientOnly from "../components/ClientOnly";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05060a] text-zinc-100 antialiased">
      {/* background */}
      <div aria-hidden className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_20%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(900px_circle_at_80%_25%,rgba(217,70,239,0.14),transparent_55%),radial-gradient(900px_circle_at_50%_90%,rgba(56,189,248,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <TopNav />

      <main>
        <HeroFull />

        <ClientOnly>
          <section data-gravity-item="1" className="py-16">
            <div className="max-w-7xl mx-auto px-6">
              <GitHubHeatmap username="WasimKaunain" />
            </div>
          </section>

          <section data-gravity-item="1" className="py-16" id="terminal">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs tracking-[0.28em] uppercase text-zinc-400">
                    Terminal
                  </div>
                  <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    Interactive shell
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    A tiny command-line UI for navigating the site.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-zinc-500">
                  try: help
                </div>
              </div>

              <div className="mt-6 rounded-[32px] border border-white/10 bg-white/3 backdrop-blur-xl p-5 md:p-6 shadow-2xl">
                <Terminal />
              </div>
            </div>
          </section>

          <section data-gravity-item="1" id="projects" className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs tracking-[0.28em] uppercase text-zinc-400">
                    Projects
                  </div>
                  <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    All projects
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Each project takes a full screen. Titles come from repo names;
                    descriptions are curated in admin.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-zinc-500">Scroll</div>
              </div>

              <div className="mt-8">
                <ProjectsScroll />
              </div>
            </div>
          </section>

          <div data-gravity-item="1">
            <ExperienceSection />
          </div>

          <div data-gravity-item="1">
            <ContactSection />
          </div>
        </ClientOnly>
      </main>
    </div>
  );
}
