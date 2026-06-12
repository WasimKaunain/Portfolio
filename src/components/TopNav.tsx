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

function IconMail(props: React.SVGProps<SVGSVGElement>) {
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
			<path d="M4 6h16v12H4z" />
			<path d="m4 7 8 6 8-6" />
		</svg>
	);
}

function IconLinkedIn(props: React.SVGProps<SVGSVGElement>) {
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
			<path d="M7 10v10" />
			<path d="M7 7v.5" />
			<path d="M11 20v-6.2c0-2 1.2-3.3 3.1-3.3 1.9 0 2.9 1.3 2.9 3.3V20" />
			<path d="M11 10v10" />
			<path d="M4 4h16v16H4z" />
		</svg>
	);
}

function IconPdf(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M9 16h6" />
    </svg>
  );
}

export default function TopNav() {
	const [active, setActive] = React.useState<string>("#home");
	const reduceMotion = useReducedMotion();
	const [mounted, setMounted] = React.useState(false);
	const [contactOpen, setContactOpen] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	React.useEffect(() => {
		if (!mounted) return;
		const onDocPointerDown = (e: PointerEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;
			if (target.closest("[data-contact-root]")) return;
			setContactOpen(false);
		};
		document.addEventListener("pointerdown", onDocPointerDown);
		return () => document.removeEventListener("pointerdown", onDocPointerDown);
	}, [mounted]);

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
		setContactOpen(false);
	}

	const emailHref = "mailto:wasimkonain@gmail.com";
	const linkedInHref = "https://www.linkedin.com/in/wasim-konain-a3609925a/";
	const resumeHref = "/Wasimkonain%20resume.pdf";

	return (
		<div
			suppressHydrationWarning
			className="fixed top-3 sm:top-4 left-0 right-0 z-[300]"
		>
			<div className="max-w-7xl mx-auto px-3 sm:px-6">
				<div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/35 backdrop-blur-xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-2xl">

					<nav className="w-full">
						<div className="flex items-center justify-between sm:justify-center sm:gap-2 overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

							{/* Contact: render a non-interactive stub until mounted to avoid hydration attribute mismatch */}
							{!mounted ? (
								<div className="relative shrink-0">
									<span className="inline-flex rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs border border-transparent text-zinc-300">
										Contact
									</span>
								</div>
							) : (
								<div
									data-contact-root
									className="relative shrink-0"
									onMouseEnter={() => setContactOpen(true)}
									onMouseLeave={() => setContactOpen(false)}
								>
									<button
										type="button"
										onClick={() => setContactOpen((v) => !v)}
										className="relative shrink-0 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs transition border text-zinc-300 border-transparent hover:border-white/10 hover:bg-white/5"
									>
										Links
									</button>

									<div
										className={`absolute right-0 top-full mt-2 w-72 rounded-2xl border border-white/10 ring-1 ring-white/5 bg-[#090b11]/95  backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.55)] overflow-hidden transition duration-150 z-[310] ${
											contactOpen
												? "opacity-100 translate-y-0 pointer-events-auto"
												: "opacity-0 translate-y-1 pointer-events-none"
										}`}
									>
										<a
										  href={emailHref}
										  className="group flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition"
										>
										  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
										    <IconMail className="h-4 w-4" />
										  </div>

										  <div>
										    <div className="text-white">Email</div>
										    <div className="text-xs text-zinc-500">
										      wasimkonain@gmail.com
										    </div>
										  </div>
										</a>

										<a
										  href={linkedInHref}
										  target="_blank"
										  rel="noreferrer"
										  className="group flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition"
										>
										  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A66C2]/15 text-[#0A66C2]">
										    <IconLinkedIn className="h-4 w-4" />
										  </div>
																			
										  <div>
										    <div className="text-white">LinkedIn</div>
										    <div className="text-xs text-zinc-500">
										      Connect professionally
										    </div>
										  </div>
										</a>

										<a
										  href={resumeHref}
										  download
										  className="group flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition"
										>
										  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/15 text-red-500">
										    <IconPdf className="h-4 w-4" />
										  </div>

										  <div>
										    <div className="text-white">Download Resume</div>
										    <div className="text-xs text-zinc-500">
										      PDF format
										    </div>
										  </div>
										</a>
									</div>
								</div>
							)}
						</div>
					</nav>
				</div>
			</div>
		</div>
	);
}
