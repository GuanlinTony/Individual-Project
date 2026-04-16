"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Game } from "@/lib/types";
import { formatSize } from "@/lib/games";
import { CheckCircle2, Loader2, Zap } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Install overlay — full-screen modal that simulates the bootstrap install.
// Stages are paced to fill bootstrapInstallSeconds; on completion we push
// the user to /play/[id] for the gameplay + streaming HUD demo.
// ─────────────────────────────────────────────────────────────────────────────

interface Stage {
  label: string;
  detail: string;
  pctEnd: number; // cumulative % complete at the end of this stage
}

function buildStages(game: Game): Stage[] {
  return [
    {
      label: "Connecting to nearest edge node",
      detail: "sfo-3 · 14 ms round-trip",
      pctEnd: 8,
    },
    {
      label: "Streaming bootstrap runtime",
      detail: `${formatSize(game.bootstrapSizeMB * 0.35)} · core binaries & shaders`,
      pctEnd: 38,
    },
    {
      label: "Loading game logic locally",
      detail: "Install runs on your device · cloud handles assets",
      pctEnd: 58,
    },
    {
      label: "AI analyzing play patterns",
      detail: `Predictor priming for ${game.zones[0]}`,
      pctEnd: 76,
    },
    {
      label: `Preloading ${game.zones[0]} assets`,
      detail: "Textures, geometry, shaders — predicted first-use",
      pctEnd: 96,
    },
    {
      label: "Ready to play",
      detail: `Only ${formatSize(game.bootstrapSizeMB)} on your device`,
      pctEnd: 100,
    },
  ];
}

export default function InstallOverlay({
  game,
  onClose,
}: {
  game: Game;
  onClose: () => void;
}) {
  const router = useRouter();
  const stages = buildStages(game);
  const totalMs = game.bootstrapInstallSeconds * 1000;

  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / totalMs) * 100);
      setProgress(pct);
      // Advance stage index based on thresholds
      const newStageIdx = stages.findIndex((s) => pct <= s.pctEnd);
      if (newStageIdx >= 0) setStageIdx(newStageIdx);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
        // Linger briefly on "Ready" before routing
        setTimeout(() => router.push(`/play/${game.id}`), 900);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [game.id, router, stages, totalMs]);

  // The reference point — how long this would have taken "the old way"
  const tradMinutes = game.traditionalInstallMinutes;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-md flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.96, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-xl rounded-2xl border border-border bg-bg-elevated p-7 md:p-9 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-teal font-mono">
              Installing
            </div>
            <button
              onClick={onClose}
              disabled={done}
              className="text-ink-dim hover:text-ink text-xs disabled:opacity-50"
            >
              cancel
            </button>
          </div>
          <h2 className="text-2xl font-bold text-ink mb-6">{game.title}</h2>

          {/* Progress bar */}
          <div className="relative h-2 rounded-full bg-bg overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal to-lime"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0 }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs font-mono">
            <span className="text-ink-muted">{progress.toFixed(0)}%</span>
            <span className="text-ink-dim">
              {Math.max(0, game.bootstrapInstallSeconds - (progress / 100) * game.bootstrapInstallSeconds).toFixed(1)}s remaining
            </span>
          </div>

          {/* Stage list */}
          <div className="mt-6 space-y-2.5">
            {stages.map((s, i) => {
              const isComplete = i < stageIdx || (done && i === stages.length - 1);
              const isActive = i === stageIdx && !done;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg px-3 py-2 ${
                    isActive
                      ? "bg-teal/5 border border-teal/30"
                      : "border border-transparent"
                  }`}
                >
                  <div className="mt-0.5">
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-lime" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-teal animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-border" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm ${
                        isComplete
                          ? "text-ink-muted line-through decoration-ink-dim/40"
                          : isActive
                          ? "text-ink font-medium"
                          : "text-ink-dim"
                      }`}
                    >
                      {s.label}
                    </div>
                    {(isActive || isComplete) && (
                      <div className="text-[11px] font-mono text-ink-dim mt-0.5">
                        {s.detail}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison footer */}
          <div className="mt-6 pt-5 border-t border-border flex items-center gap-3 text-xs">
            <Zap className="w-4 h-4 text-gold shrink-0" />
            <span className="text-ink-muted">
              Traditional install would take{" "}
              <span className="text-rose font-mono line-through">~{tradMinutes} min</span>.
              You're ready in{" "}
              <span className="text-lime font-mono font-semibold">
                {game.bootstrapInstallSeconds}s
              </span>
              .
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
