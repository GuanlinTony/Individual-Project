"use client";

import { motion } from "framer-motion";
import type { PredictionState } from "@/lib/types";
import { Brain, MapPin, ArrowRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// AIPredictionCard — visualises the AI asset predictor's current belief:
//   current zone → predicted next zone, with a confidence ring.
// The card flashes gold when the predictor fires a burst of preloaded assets.
// ─────────────────────────────────────────────────────────────────────────────

export default function AIPredictionCard({
  state,
  pulseTrigger,
}: {
  state: PredictionState;
  pulseTrigger: number; // changing value triggers a flash
}) {
  const pct = Math.round(state.confidence * 100);
  const circumference = 2 * Math.PI * 22;
  const dashOffset = circumference - (state.confidence * circumference);

  return (
    <motion.div
      key={pulseTrigger}
      initial={{ boxShadow: "0 0 0 rgba(245,197,24,0)" }}
      animate={{
        boxShadow: [
          "0 0 24px rgba(245,197,24,0.45)",
          "0 0 0 rgba(245,197,24,0)",
        ],
      }}
      transition={{ duration: 1.2 }}
      className="rounded-xl border border-gold/40 bg-gradient-to-br from-gold/10 via-bg-elevated to-bg-elevated p-4 relative overflow-hidden"
    >
      {/* Subtle AI glyph bg */}
      <Brain className="absolute -right-4 -bottom-4 w-24 h-24 text-gold/5" strokeWidth={1} />

      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-mono text-gold mb-3">
        <Brain className="w-3 h-3" />
        AI Zone Predictor
      </div>

      <div className="flex items-start gap-3">
        {/* Confidence ring */}
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 50 50" className="w-full h-full -rotate-90">
            <circle
              cx="25" cy="25" r="22"
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"
            />
            <motion.circle
              cx="25" cy="25" r="22"
              fill="none" stroke="#F5C518" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.6 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono text-gold">
            {pct}%
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-ink-dim font-mono">
            Current zone
          </div>
          <div className="flex items-center gap-1.5 text-ink text-sm font-medium mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-teal" />
            <span className="truncate">{state.currentZone}</span>
          </div>

          <div className="flex items-center gap-1.5 mt-3 text-[10px] uppercase tracking-wider text-ink-dim font-mono">
            <ArrowRight className="w-3 h-3" />
            Predicted next
          </div>
          <div className="text-gold text-sm font-semibold mt-0.5 truncate">
            {state.nextZone}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/50 text-[10px] font-mono text-ink-muted">
        Preloading {Math.round(12 + state.confidence * 14)} assets ahead of play
      </div>
    </motion.div>
  );
}
