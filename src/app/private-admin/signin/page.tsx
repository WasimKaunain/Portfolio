"use client";

import React from "react";
import { signIn } from "next-auth/react";

export default function AdminSignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#071026] text-zinc-100">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/3 backdrop-blur border border-white/6">
        <h1 className="text-2xl font-semibold">Owner Sign-in</h1>
        <p className="mt-2 text-sm text-zinc-300">This area is restricted to the portfolio owner.</p>

        <button
          onClick={() => signIn("github", { callbackUrl: "/private-admin" })}
          className="mt-6 w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition"
        >
          Continue with GitHub
        </button>

        <p className="mt-4 text-xs text-zinc-400">
          Access is granted only if your OAuth email matches <span className="font-mono">OWNER_EMAIL</span> on the server.
        </p>
      </div>
    </div>
  );
}
