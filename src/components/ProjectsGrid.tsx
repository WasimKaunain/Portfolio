"use client";

import React from "react";
import { motion } from "framer-motion";

type PublicProject = {
	id: string;
	slug: string;
	title: string;
	description: string;
	tech: string[];
	githubUrl: string | null;
	githubOwner: string | null;
	githubRepo: string | null;
};

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.05,
			delayChildren: 0.05,
		},
	},
};

const item = {
	hidden: { opacity: 0, y: 10 },
	show: { opacity: 1, y: 0 },
};

function Chip({ children }: { children: React.ReactNode }) {
	return (
		<span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/6 border border-white/10 text-[11px] text-zinc-200">
			{children}
		</span>
	);
}

export default function ProjectsGrid() {
	const [items, setItems] = React.useState<PublicProject[]>([]);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch("/api/projects", { cache: "no-store" });
				if (!res.ok) return;
				const data = (await res.json()) as { projects: PublicProject[] };
				if (!cancelled) setItems(data.projects ?? []);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) {
		return <div className="text-sm text-zinc-400">Loading…</div>;
	}

	if (items.length === 0) {
		return (
			<div className="text-sm text-zinc-400">
				No projects yet.
			</div>
		);
	}

	return (
		<motion.div
			variants={container}
			initial="hidden"
			animate="show"
			className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
		>
			{items.map((p) => (
				<motion.a
					key={p.id}
					variants={item}
					whileHover={{ y: -3, scale: 1.01 }}
					whileTap={{ scale: 0.99 }}
					href={p.githubUrl ?? "#"}
					target={p.githubUrl ? "_blank" : undefined}
					rel={p.githubUrl ? "noreferrer" : undefined}
					className="group relative overflow-hidden rounded-2xl p-4 bg-white/3 backdrop-blur-xl border border-white/10 shadow-[0_18px_65px_-28px_rgba(0,0,0,0.85)] hover:border-white/20 transition"
				>
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-indigo-500/10 via-transparent to-fuchsia-500/10"
					/>

					<div className="relative flex h-full flex-col">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<div className="text-sm font-semibold text-white truncate">
									{p.title}
								</div>
								<div className="mt-1 text-xs text-zinc-300/80 line-clamp-2 leading-relaxed">
									{p.description || "No description."}
								</div>
							</div>

							<div className="shrink-0 text-[11px] text-zinc-400 font-mono">
								{p.githubOwner && p.githubRepo
									? `${p.githubOwner}/${p.githubRepo}`
									: p.slug}
							</div>
						</div>

						{(p.tech ?? []).length ? (
							<div className="mt-3 flex flex-wrap gap-2">
								{p.tech.slice(0, 4).map((t) => (
									<Chip key={t}>{t}</Chip>
								))}
							</div>
						) : (
							<div className="mt-3">
								<Chip>GitHub</Chip>
							</div>
						)}

						<div className="mt-auto pt-4 flex items-center justify-between">
							<span className="text-[11px] text-zinc-400">Open</span>
							<span className="text-[11px] text-zinc-300 group-hover:text-white transition">
								↗
							</span>
						</div>
					</div>
				</motion.a>
			))}
		</motion.div>
	);
}
