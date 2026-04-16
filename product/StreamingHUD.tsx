"use client";

import { useEffect, useState, useRef } from "react";
import type { Game, AssetEvent, PredictionState } from "@/lib/types";
import {
  generateAssetEvent,
  generatePredictedBurst,
  initPredictionState,
  advancePrediction,
} from "@/lib/assetSimulator";

import AssetFeed from "./AssetFeed";
import AIPredictionCard from "./AIPredictionCard";
import BandwidthChart from "./BandwidthChart";
import StorageMeter from "./StorageMeter";
import LatencyPill from "./LatencyPill";

// ─────────────────────────────────────────────────────────────────────────────
// StreamingHUD — the hero of the demo. Owns the event loop:
//
//   1. Every 350-900ms, emit a single asset-fetch event into the feed.
//      (The jitter makes it feel organic; a fixed cadence would look fake.)
//   2. Every ~10 seconds, advance the AI zone predictor. When it changes,
//      emit a burst of 4-6 gold "predicted" events in quick succession.
//   3. The feed holds the most-recent 15 events; older ones scroll off.
//
// All children (AssetFeed, AIPredictionCard, BandwidthChart, StorageMeter,
// LatencyPill) are presentational — they just render what the HUD pushes to
// them. This keeps the timing logic in one place.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_FEED_ITEMS = 15;
const NORMAL_EVENT_MIN_MS = 350;
const NORMAL_EVENT_MAX_MS = 900;
const PREDICTION_CYCLE_MS = 10_000;

export default function StreamingHUD({ game }: { game: Game }) {
  const [events, setEvents] = useState<AssetEvent[]>([]);
  const [prediction, setPrediction] = useState<PredictionState>(() =>
    initPredictionState(game),
  );
  const [pulseTrigger, setPulseTrigger] = useState(0);

  // Rolling metrics derived from recent events
  const [avgLatency, setAvgLatency] = useState(42);
  const [totalStreamed, setTotalStreamed] = useState(0);

  // Refs so timer callbacks always see latest values
  const predictionRef = useRef(prediction);
  predictionRef.current = prediction;

  // ── Asset event loop ──────────────────────────────────────────────────────
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const emitNext = () => {
      const ev = generateAssetEvent(predictionRef.current.currentZone);
      setEvents((prev) => [ev, ...prev].slice(0, MAX_FEED_ITEMS));
      const delay =
        NORMAL_EVENT_MIN_MS +
        Math.random() * (NORMAL_EVENT_MAX_MS - NORMAL_EVENT_MIN_MS);
      timeout = setTimeout(emitNext, delay);
    };

    // Kick off the loop
    emitNext();
    return () => clearTimeout(timeout);
  }, []);

  // ── Prediction advancement loop ───────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      setPrediction((prev) => {
        const next = advancePrediction(prev, game);
        // Emit a burst of predicted assets for the new "next zone"
        const burst = generatePredictedBurst(next.nextZone, 5);
        // Stagger burst insertion so it scrolls visibly
        burst.forEach((ev, i) => {
          setTimeout(() => {
            setEvents((prevEv) => [ev, ...prevEv].slice(0, MAX_FEED_ITEMS));
          }, i * 140);
        });
        setPulseTrigger((x) => x + 1);
        return next;
      });
    }, PREDICTION_CYCLE_MS);
    return () => clearInterval(iv);
  }, [game]);

  // ── Rolling metrics: latency EMA + cumulative MB streamed ─────────────────
  useEffect(() => {
    if (events.length === 0) return;
    const recent = events.slice(0, 8);
    const avg =
      recent.reduce((s, e) => s + e.latencyMs, 0) / Math.max(1, recent.length);
    setAvgLatency(Math.round(avg));
    setTotalStreamed(
      events.reduce((s, e) => s + e.sizeMB, 0) + (events.length > 0 ? 120 : 0),
    );
  }, [events]);

  const aiHitCount = events.filter((e) => e.aiPredicted).length;

  return (
    <div className="w-full h-full flex flex-col gap-3">
      {/* Top strip — compact metrics */}
      <div className="grid grid-cols-2 gap-3">
        <LatencyPill ms={avgLatency} />
        <BandwidthChart />
      </div>

      {/* Storage */}
      <StorageMeter
        bootstrapSizeMB={game.bootstrapSizeMB}
        traditionalSizeMB={game.traditionalSizeMB}
      />

      {/* AI prediction */}
      <AIPredictionCard state={prediction} pulseTrigger={pulseTrigger} />

      {/* Live feed */}
      <AssetFeed events={events} />

      {/* Session summary strip */}
      <div className="rounded-xl border border-border bg-bg-elevated/80 px-4 py-2.5 flex items-center justify-between text-[11px] font-mono">
        <div className="text-ink-muted">
          <span className="text-ink">{events.length}</span> streaming
          <span className="text-gold ml-2">● {aiHitCount}</span> AI preload
        </div>
        <div className="text-ink-muted">
          <span className="text-teal">{totalStreamed.toFixed(1)}</span> MB this session
        </div>
      </div>
    </div>
  );
}
