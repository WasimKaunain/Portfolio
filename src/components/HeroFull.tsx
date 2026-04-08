"use client";

import React from "react";
import AboutShowcase from "@/components/AboutShowcase";

export default function HeroFull() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center" id="home">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <AboutShowcase
          bgSrc="/hero_pic.jpg"
        />
      </div>
    </section>
  );
}
