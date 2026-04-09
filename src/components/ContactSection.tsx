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
						Drop me a line
					</h2>
					<p className="mt-2 text-sm text-zinc-400 max-w-3xl">
						Want to work together? If you think I can help you with your project then let's connect or leave a message below and I’ll get right back to you.
					</p>
				</div>

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
