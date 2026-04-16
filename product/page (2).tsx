"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getGameById, formatSize } from "@/lib/games";
import GameCover from "@/components/GameCover";
import InstallOverlay from "@/components/InstallOverlay";
import { ArrowLeft, Zap, Clock, HardDrive, Download } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Game detail page. Shows the core value pitch: a stark side-by-side of
// traditional install vs Aegis Nexus bootstrap, with the big Install button
// that triggers the 8-second simulation.
// ─────────────────────────────────────────────────────────────────────────────

// Next.js 15+ makes params a Promise; use() unwraps it. Works in 14 too.
export default function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Support both promise and plain params (Next 14 vs 15)
  const unwrapped =
    typeof (params as Promise<{ id: string }>).then === "function"
      ? use(params as Promise<{ id: string }>)
      : (params as { id: string });

  const game = getGameById(unwrapped.id);
  if (!game) notFound();

  const [installing, setInstalling] = useState(false);

  const sizeRatio = (game.bootstrapSizeMB / game.traditionalSizeMB) * 100;
  const timeRatio =
    (game.bootstrapInstallSeconds / (game.traditionalInstallMinutes * 60)) * 100;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Back link */}
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-ink-muted hover:text-ink text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to library
      </Link>

      <div className="grid lg:grid-cols-[340px_1fr] gap-10">
        {/* Cover */}
        <div>
          <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border shadow-2xl">
            <GameCover game={game} size="lg" />
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-dim">
              {game.genre}
            </span>
            <span className="w-1 h-1 rounded-full bg-ink-dim" />
            <span
              className={`text-xs font-mono uppercase tracking-wider font-semibold ${
                game.tier === "Premium" ? "text-gold" : "text-teal"
              }`}
            >
              {game.tier} tier
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-ink leading-tight">
            {game.title}
          </h1>
          <p className="mt-3 text-lg text-ink-muted">{game.tagline}</p>

          {/* ── Install comparison ──────────────────────────────────────── */}
          <div className="mt-8 rounded-2xl border border-border bg-bg-elevated overflow-hidden">
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Traditional */}
              <div className="p-6 bg-rose/[0.03]">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-rose/80 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose" />
                  Traditional download
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-rose/70 shrink-0" />
                    <div>
                      <div className="text-3xl font-bold text-rose font-mono tabular-nums">
                        {formatSize(game.traditionalSizeMB)}
                      </div>
                      <div className="text-xs text-ink-dim">
                        downloaded to your device
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-rose/70 shrink-0" />
                    <div>
                      <div className="text-3xl font-bold text-rose font-mono tabular-nums">
                        ~{game.traditionalInstallMinutes} min
                      </div>
                      <div className="text-xs text-ink-dim">on 50 Mbps home broadband</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aegis Nexus */}
              <div className="p-6 bg-teal/[0.04]">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-teal mb-3">
                  <Zap className="w-3 h-3" />
                  With Aegis Nexus
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-teal shrink-0" />
                    <div>
                      <div className="text-3xl font-bold text-teal font-mono tabular-nums">
                        {formatSize(game.bootstrapSizeMB)}
                      </div>
                      <div className="text-xs text-ink-dim">
                        bootstrap runtime only · {sizeRatio.toFixed(2)}% of original
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-teal shrink-0" />
                    <div>
                      <div className="text-3xl font-bold text-teal font-mono tabular-nums">
                        {game.bootstrapInstallSeconds} sec
                      </div>
                      <div className="text-xs text-ink-dim">
                        then you're playing · {timeRatio.toFixed(3)}% of the wait
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Install CTA */}
          <button
            onClick={() => setInstalling(true)}
            className="mt-8 group inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-teal text-navy font-semibold text-lg hover:bg-teal/90 transition-colors shadow-glow-teal"
          >
            <Download className="w-5 h-5" />
            Install &amp; play
            <span className="text-xs font-mono font-normal opacity-70 ml-1">
              ({game.bootstrapInstallSeconds}s)
            </span>
          </button>

          {/* Zone preview */}
          <div className="mt-10">
            <div className="text-[11px] uppercase tracking-wider font-mono text-ink-dim mb-2">
              Zones in this title
            </div>
            <div className="flex flex-wrap gap-2">
              {game.zones.map((z) => (
                <span
                  key={z}
                  className="px-3 py-1 rounded-md border border-border bg-bg-elevated text-xs text-ink-muted font-mono"
                >
                  {z}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {installing && (
        <InstallOverlay game={game} onClose={() => setInstalling(false)} />
      )}
    </div>
  );
}
