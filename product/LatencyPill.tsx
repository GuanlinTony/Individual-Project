"use client";

import { Wifi } from "lucide-react";
import clsx from "clsx";

// ─────────────────────────────────────────────────────────────────────────────
// LatencyPill — compact latency readout. The colour band (lime / teal / rose)
// gives at-a-glance health without needing a label.
// ─────────────────────────────────────────────────────────────────────────────

export default function LatencyPill({ ms }: { ms: number }) {
  const quality = ms < 30 ? "lime" : ms < 60 ? "teal" : "rose";
  const qualityLabel = ms < 30 ? "EXCELLENT" : ms < 60 ? "GOOD" : "DEGRADED";

  return (
    <div className="rounded-xl border border-border bg-bg-elevated/80 p-4 flex items-center gap-3">
      <Wifi
        className={clsx(
          "w-5 h-5 shrink-0",
          quality === "lime" && "text-lime",
          quality === "teal" && "text-teal",
          quality === "rose" && "text-rose",
        )}
      />
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider font-mono text-ink-muted">
          Edge Latency
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={clsx(
            "text-xl font-bold font-mono tabular-nums",
            quality === "lime" && "text-lime",
            quality === "teal" && "text-teal",
            quality === "rose" && "text-rose",
          )}>
            {ms}
          </span>
          <span className="text-[10px] text-ink-dim font-mono">ms</span>
        </div>
        <div className={clsx(
          "mt-0.5 text-[9px] font-mono tracking-wider",
          quality === "lime" && "text-lime/80",
          quality === "teal" && "text-teal/80",
          quality === "rose" && "text-rose/80",
        )}>
          {qualityLabel}
        </div>
      </div>
    </div>
  );
}
