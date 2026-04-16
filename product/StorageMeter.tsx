"use client";

import { motion } from "framer-motion";
import { HardDrive } from "lucide-react";
import { formatSize } from "@/lib/games";

// ─────────────────────────────────────────────────────────────────────────────
// StorageMeter — circular gauge showing the game's local footprint vs the
// storage "saved" compared to a traditional install. The ratio is usually
// extreme (e.g. 220 MB vs 82 GB), so we render it as two stacked numbers
// rather than a proportional arc (a proportional arc would be invisible).
// ─────────────────────────────────────────────────────────────────────────────

export default function StorageMeter({
  bootstrapSizeMB,
  traditionalSizeMB,
}: {
  bootstrapSizeMB: number;
  traditionalSizeMB: number;
}) {
  const savedMB = Math.max(0, traditionalSizeMB - bootstrapSizeMB);
  const savedPct = (savedMB / traditionalSizeMB) * 100;
  const footprintPct = 100 - savedPct;

  // Arc radii / dash calcs
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const footprintDash = (footprintPct / 100) * circumference;

  return (
    <div className="rounded-xl border border-border bg-bg-elevated/80 p-4 flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          {/* Saved track (dim) */}
          <circle
            cx="40" cy="40" r={r}
            fill="none"
            stroke="rgba(16,245,163,0.2)"
            strokeWidth="6"
          />
          {/* Local footprint (teal) — tiny by design */}
          <motion.circle
            cx="40" cy="40" r={r}
            fill="none"
            stroke="#22D3EE"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${footprintDash} ${circumference}`}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${footprintDash} ${circumference}` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <HardDrive className="w-6 h-6 text-teal" strokeWidth={2} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider font-mono text-ink-muted">
          Local footprint
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-teal font-mono tabular-nums">
            {formatSize(bootstrapSizeMB)}
          </span>
          <span className="text-[10px] text-ink-dim font-mono">
            on device
          </span>
        </div>
        <div className="mt-1.5 text-[11px] font-mono text-lime">
          ↓ {formatSize(savedMB)} saved ({savedPct.toFixed(1)}%)
        </div>
      </div>
    </div>
  );
}
