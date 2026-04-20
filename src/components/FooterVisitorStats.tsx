import React from "react";
import VisitorStatsDropdown from "@/components/VisitorStatsDropdown";

export default function FooterVisitorStats() {
  return (
    <footer className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-[28px] border border-white/10 bg-white/3 backdrop-blur-xl p-4 md:p-5">
          <VisitorStatsDropdown />
          <div className="mt-3 text-[11px] text-zinc-500">
            Location is approximate (from hosting provider headers) and may be missing in local dev.
          </div>
        </div>
      </div>
    </footer>
  );
}
