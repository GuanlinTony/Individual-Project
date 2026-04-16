"use client";

import { useState, use, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getGameById } from "@/lib/games";
import { initPredictionState, advancePrediction } from "@/lib/assetSimulator";
import type { PredictionState } from "@/lib/types";
import MockGameView from "@/components/MockGameView";
import StreamingHUD from "@/components/StreamingHUD";
import { ArrowLeft } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Play page — the hero moment. Two columns:
//   LEFT:  <MockGameView /> — atmospheric "game is running" visual
//   RIGHT: <StreamingHUD /> — live asset feed, AI prediction, bandwidth, storage
//
// We keep a shared PredictionState up here so the zone displayed on the mock
// game view stays in sync with what the HUD is predicting/advancing to.
// Advancing happens in StreamingHUD — here we only mirror currentZone.
// ─────────────────────────────────────────────────────────────────────────────

export default function PlayPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const unwrapped =
    typeof (params as Promise<{ id: string }>).then === "function"
      ? use(params as Promise<{ id: string }>)
      : (params as { id: string });

  const game = getGameById(unwrapped.id);
  if (!game) notFound();

  // Mirror of the zone — advances on the same cadence as the HUD
  const [zoneState, setZoneState] = useState<PredictionState>(() =>
    initPredictionState(game),
  );

  useEffect(() => {
    const iv = setInterval(() => {
      setZoneState((prev) => advancePrediction(prev, game));
    }, 10_000);
    return () => clearInterval(iv);
  }, [game]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/game/${game.id}`}
            className="inline-flex items-center gap-1.5 text-ink-muted hover:text-ink text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit
          </Link>
          <span className="w-px h-5 bg-border" />
          <div>
            <div className="font-semibold text-ink leading-tight">{game.title}</div>
            <div className="text-[10px] font-mono text-ink-dim uppercase tracking-wider">
              Streaming demo · all data synthetic
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
          <span className="text-ink-muted">CONNECTED</span>
          <span className="text-ink-dim">· session 4m 12s</span>
        </div>
      </div>

      {/* Main stage: game view + HUD */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-4">
        {/* Mock game viewport */}
        <div className="aspect-video lg:aspect-auto lg:min-h-[720px] relative">
          <MockGameView game={game} currentZone={zoneState.currentZone} />

          {/* Gamer hint footer */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 pointer-events-none">
            <div className="text-[11px] font-mono text-white/70 tracking-wider">
              Watch the HUD → AI preloads the next zone in real time
            </div>
          </div>
        </div>

        {/* Streaming HUD */}
        <aside>
          <StreamingHUD game={game} />
        </aside>
      </div>

      {/* Footer legend */}
      <div className="mt-6 rounded-xl border border-border bg-bg-elevated/60 p-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-mono text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-teal" />
          Reactive stream — fetched on demand
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-gold" />
          AI preload — fetched before you need it
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-lime" />
          Edge cache hit &lt; 30ms
        </div>
        <div className="flex-1" />
        <div className="text-ink-dim">
          Data is simulated client-side for demo purposes only.
        </div>
      </div>
    </div>
  );
}
