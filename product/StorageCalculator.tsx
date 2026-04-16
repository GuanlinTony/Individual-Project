"use client";

import { useState, useMemo } from "react";
import { GAMES } from "@/lib/games";
import { HardDrive } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Storage calculator
// Compares how many games fit in a given free-storage budget under traditional
// downloads vs Aegis Nexus bootstrap installs. Uses the average of the real
// catalog for both numbers so it's grounded in the data.
// ─────────────────────────────────────────────────────────────────────────────

export default function StorageCalculator() {
  const [freeGB, setFreeGB] = useState(8);

  const stats = useMemo(() => {
    const avgTradMB = GAMES.reduce((s, g) => s + g.traditionalSizeMB, 0) / GAMES.length;
    const avgBootMB = GAMES.reduce((s, g) => s + g.bootstrapSizeMB, 0) / GAMES.length;
    const freeMB = freeGB * 1024;
    return {
      traditional: Math.floor(freeMB / avgTradMB),
      aegis: Math.floor(freeMB / avgBootMB),
    };
  }, [freeGB]);

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated/60 backdrop-blur-sm p-6 md:p-8">
      <div className="flex items-center gap-2 text-ink-muted text-sm mb-5">
        <HardDrive className="w-4 h-4" />
        <span className="font-mono uppercase tracking-wider text-xs">
          Storage Reality Check
        </span>
      </div>
      <label className="block">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-ink-muted text-sm">Free space on your device</span>
          <span className="font-mono text-2xl text-ink font-semibold">
            {freeGB} GB
          </span>
        </div>
        <input
          type="range"
          min={2}
          max={64}
          step={1}
          value={freeGB}
          onChange={(e) => setFreeGB(Number(e.target.value))}
          className="w-full accent-teal cursor-pointer"
        />
        <div className="flex justify-between mt-1 text-[10px] font-mono text-ink-dim">
          <span>2 GB</span>
          <span>64 GB</span>
        </div>
      </label>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="rounded-lg border border-border bg-bg p-4">
          <div className="text-[10px] uppercase tracking-wider text-ink-dim font-mono">
            Traditional download
          </div>
          <div className="mt-2 text-4xl font-bold text-rose tabular-nums">
            {stats.traditional}
          </div>
          <div className="text-xs text-ink-muted mt-1">
            AAA games fit on your device
          </div>
        </div>
        <div className="rounded-lg border border-teal/50 bg-teal/5 p-4 relative overflow-hidden">
          <div className="text-[10px] uppercase tracking-wider text-teal font-mono">
            With Aegis Nexus
          </div>
          <div className="mt-2 text-4xl font-bold text-teal tabular-nums">
            {stats.aegis}
          </div>
          <div className="text-xs text-ink-muted mt-1">
            AAA games fit on your device
          </div>
          <div className="absolute top-2 right-2 text-[10px] font-mono text-teal/80 px-2 py-0.5 rounded-full bg-teal/10 border border-teal/30">
            {stats.aegis > 0 && stats.traditional > 0
              ? `${(stats.aegis / Math.max(1, stats.traditional)).toFixed(0)}× more`
              : "∞"}
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-dim">
        Based on average across the current catalog of {GAMES.length} titles.
        Aegis Nexus streams assets on demand — you keep only the ~200 MB runtime.
      </p>
    </div>
  );
}
