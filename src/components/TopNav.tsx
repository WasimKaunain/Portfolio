"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const links = [
	{ href: "#home", label: "Home" },
	{ href: "#terminal", label: "Terminal" },
	{ href: "#projects", label: "Projects" },
	{ href: "#experience", label: "Experience" },
	{ href: "#contact", label: "Contact" },
];

export default function TopNav() {
	const [active, setActive] = React.useState<string>("#home");
	const reduceMotion = useReducedMotion();

	React.useEffect(() => {
		const ids = ["home", "terminal", "projects", "experience", "contact"];
		const els = ids
			.map((id) => document.getElementById(id))
			.filter(Boolean) as HTMLElement[];

		const io = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort(
						(a, b) =>
							(b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
					)[0];
				if (visible?.target?.id) setActive(`#${visible.target.id}`);
			},
			{ threshold: [0.15, 0.25, 0.4, 0.6], rootMargin: "-20% 0px -65% 0px" }
		);

		for (const el of els) io.observe(el);
		return () => io.disconnect();
	}, []);

	function onNavClick(href: string) {
		setActive(href);
	}

	return (
		<div
			suppressHydrationWarning
			className="fixed top-3 sm:top-4 left-0 right-0 z-50"
		>
			<div className="max-w-7xl mx-auto px-3 sm:px-6">
				<div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 backdrop-blur-xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-2xl">
					<a
						data-gravity-item="1"
						href="#home"
						className="shrink-0 font-mono text-[11px] sm:text-xs text-zinc-300 hover:text-white transition"
					>
						wasim.dev
					</a>

					<nav className="flex-1 min-w-0">
						<div className="flex items-center justify-end gap-1 overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
							{links.map((l) => {
								const isActive = active === l.href;
								return (
									<a
										data-gravity-item="1"
										key={l.href}
										href={l.href}
										onClick={() => onNavClick(l.href)}
										className={`relative shrink-0 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs transition border ${
											isActive
												? "text-white border-white/12 bg-white/7"
												: "text-zinc-300 border-transparent hover:border-white/10 hover:bg-white/5"
										}`}
									>
										<span className="relative z-10">{l.label}</span>
										{isActive ? (
											<motion.span
												layoutId="topnav-underline"
												className="absolute left-2 right-2 -bottom-[3px] h-[2px] rounded-full bg-white/70"
												transition={
													reduceMotion
														? { duration: 0 }
														: { type: "spring", stiffness: 500, damping: 40 }
												}
											/>
										) : null}
									</a>
								);
							})}
						</div>
					</nav>
				</div>
			</div>
		</div>
	);
}
