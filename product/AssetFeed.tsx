"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AssetEvent, AssetType } from "@/lib/types";
import { Image, Music, Box, Sparkles } from "lucide-react";
import clsx from "clsx";

// ─────────────────────────────────────────────────────────────────────────────
// AssetFeed — live scrolling list of incoming asset-fetch events.
// AI-predicted events get a gold tag + different icon treatment so the user
// can visually separate "reactive" streaming (teal) from "predicted" (gold).
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_META: Record<
  AssetType,
  { icon: typeof Image; label: string; color: string }
> = {
  texture: { icon: Image, label: "TEX", color: "text-sky-400" },
  geometry: { icon: Box, label: "GEO", color: "text-emerald-400" },
  audio: { icon: Music, label: "AUD", color: "text-purple-400" },
  shader: { icon: Sparkles, label: "SHD", color: "text-pink-400" },
};

export default function AssetFeed({ events }: { events: AssetEvent[] }) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated/80 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
            Asset Stream · Live
          </span>
        </div>
        <span className="text-[10px] font-mono text-ink-dim">
          {events.length} / 15 shown
        </span>
      </div>
      <div className="h-[340px] overflow-hidden px-2 py-1.5">
        <AnimatePresence initial={false}>
          {events.map((e) => {
            const meta = TYPE_META[e.type];
            const Icon = meta.icon;
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className={clsx(
                  "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs font-mono",
                  e.aiPredicted && "bg-gold/5",
                )}
              >
                <Icon
                  className={clsx(
                    "w-3.5 h-3.5 shrink-0",
                    e.aiPredicted ? "text-gold" : meta.color,
                  )}
                  strokeWidth={2}
                />
                <span
                  className={clsx(
                    "text-[9px] font-bold w-7",
                    e.aiPredicted ? "text-gold" : meta.color,
                  )}
                >
                  {meta.label}
                </span>
                <span
                  className={clsx(
                    "flex-1 truncate",
                    e.aiPredicted ? "text-gold/90" : "text-ink-muted",
                  )}
                >
                  {e.name}
                </span>
                <span className="text-ink-dim tabular-nums w-12 text-right">
                  {e.sizeMB.toFixed(1)}MB
                </span>
                <span
                  className={clsx(
                    "tabular-nums w-10 text-right",
                    e.latencyMs < 30 ? "text-lime" : "text-ink-dim",
                  )}
                >
                  {e.latencyMs}ms
                </span>
                {e.aiPredicted && (
                  <span className="text-[8px] uppercase font-bold text-gold bg-gold/10 border border-gold/30 px-1 py-0.5 rounded">
                    AI
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
