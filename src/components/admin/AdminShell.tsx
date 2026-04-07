"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
	{ href: "/private-admin", label: "Overview" },
	{ href: "/private-admin/projects", label: "Projects" },
	{ href: "/private-admin/billing", label: "Billing" },
	{ href: "/private-admin/logs", label: "API Logs" },
	{ href: "/private-admin/config", label: "Config" },
];

export default function AdminShell({
	title,
	subtitle,
	children,
	right,
}: {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	right?: React.ReactNode;
}) {
	const pathname = usePathname();

	return (
		<div className="min-h-screen bg-gradient-to-b from-black to-[#071026] text-zinc-100">
			<div className="max-w-7xl mx-auto px-6 py-10">
				<header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div>
						<div className="flex items-center gap-3">
							<Link
								href="/"
								className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 hover:bg-white/7 transition"
							>
								<span aria-hidden>←</span>
								<span>Back to portfolio</span>
							</Link>
							<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
						</div>
						{subtitle ? (
							<p className="mt-1 text-sm text-zinc-300">{subtitle}</p>
						) : null}
					</div>
					{right}
				</header>

				<div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
					<aside className="lg:col-span-3">
						<nav className="rounded-2xl bg-white/3 backdrop-blur border border-white/6 p-2">
							{nav.map((n) => {
								const active = pathname === n.href;
								return (
									<Link
										key={n.href}
										href={n.href}
										className={`block px-4 py-3 rounded-xl text-sm transition border border-transparent ${
											active
												? "bg-white/7 border-white/10 text-white"
												: "text-zinc-300 hover:bg-white/5"
										}`}
									>
										{n.label}
									</Link>
								);
							})}
						</nav>

						<div className="mt-4 rounded-2xl bg-white/3 backdrop-blur border border-white/6 p-4">
							<p className="text-xs text-zinc-400">Hidden area. Owner-only.</p>
							<p className="mt-1 text-[11px] text-zinc-500">
								Use responsibly. All actions are logged.
							</p>
						</div>
					</aside>

					<main className="lg:col-span-9">
						<div className="rounded-2xl bg-white/3 backdrop-blur border border-white/6 p-6 shadow-xl">
							{children}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}
