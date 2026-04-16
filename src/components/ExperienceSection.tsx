"use client";

import React from "react";
import { motion } from "framer-motion";

function IconArrowUpRight(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<path d="M7 17L17 7" />
			<path d="M9 7h8v8" />
		</svg>
	);
}

function TimelineCard({
	logoSrc,
	org,
	role,
	meta,
	description,
	badges,
	accent,
	soon,
}: {
	logoSrc: string;
	org: string;
	role: string;
	meta: string;
	description: string;
	badges: string[];
	accent: "iit" | "qc";
	soon?: boolean;
}) {
	const accentGrad =
		accent === "qc"
			? "from-[#FF0032]/28 via-white/0 to-white/0"
			: "from-emerald-400/22 via-white/0 to-white/0";

	return (
		<motion.div
			initial={{ opacity: 0, y: 14 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-80px" }}
			transition={{ duration: 0.65, ease: "easeOut" }}
			className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/4 backdrop-blur-xl shadow-[0_30px_120px_-70px_rgba(0,0,0,0.95)]"
		>
			<div aria-hidden className={`absolute inset-0 bg-gradient-to-r ${accentGrad}`} />
			<div aria-hidden className="absolute inset-0 [background:radial-gradient(900px_circle_at_10%_10%,rgba(255,255,255,0.10),transparent_55%)]" />

			<div className="relative p-6 sm:p-8">
				<div className="flex items-start justify-between gap-5">
					<div className="flex items-start gap-4 min-w-0">
						<div className="relative h-12 w-12 shrink-0 rounded-2xl border border-white/12 bg-black/25 grid place-items-center overflow-hidden">
							<img src={logoSrc} alt="" className="h-9 w-9 object-contain" loading="lazy" />
						</div>

						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
								<div className="text-sm font-semibold text-white truncate">{org}</div>
								{soon ? (
									<span className="inline-flex items-center rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[11px] text-white/80">
										Joining soon
									</span>
								) : null}
							</div>
							<div className="mt-1 text-sm text-zinc-200">{role}</div>
							<div className="mt-2 text-xs text-zinc-400 font-mono">{meta}</div>
						</div>
					</div>

					<div className="shrink-0 text-white/70">
						<IconArrowUpRight className="h-5 w-5" />
					</div>
				</div>

				<p className="mt-5 text-sm text-zinc-200/90 leading-relaxed">
					{description}
				</p>

				<div className="mt-5 flex flex-wrap gap-2">
					{badges.map((t) => (
						<span
							key={t}
							className="inline-flex items-center rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/80"
						>
							{t}
						</span>
					))}
				</div>
			</div>
		</motion.div>
	);
}

export default function ExperienceSection() {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);
	if (!mounted) return null;

	return (
		<section id="experience" className="py-24">
			<div className="max-w-7xl mx-auto px-6">
				<div className="flex items-end justify-between gap-6">
					<div>
						<div className="text-xs tracking-[0.28em] uppercase text-zinc-400">Career</div>
						<h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
							Professional timeline
						</h2>
						<p className="mt-2 text-sm text-zinc-400">
							Currently at IIT Gandhinagar, joining Qualcomm shortly as a System Engineer.
						</p>
					</div>
				</div>

				<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
					<TimelineCard
						logoSrc="/iitgn-logo.png"
						org="IIT Gandhinagar"
						role="Student"
						meta="Present"
						description="Pursuing my studies at IIT Gandhinagar while building systems and UI-intensive products in parallel."
						badges={["Systems", "Full‑stack", "Research mindset", "Execution"]}
						accent="iit"
					/>

					<TimelineCard
						logoSrc="/qualcomm-logo.png"
						org="Qualcomm"
						role="Upcoming System Engineer"
						meta="Joining on 1st July 2026"
						description="Incoming System Engineer at Qualcomm — excited to work on high-performance platforms, robust systems, and engineering at scale."
						badges={["Systems", "Performance", "Embedded", "Debugging"]}
						accent="qc"
						soon
					/>
				</div>
			</div>
		</section>
	);
}
