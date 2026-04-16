"use client";

import { useEffect, useState } from "react";
import type { Game } from "@/lib/types";
import { Heart, Target, Map, User } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// MockGameView — atmospheric "gameplay is happening" visual. Intentionally
// NOT a real game engine (Core scope). Uses layered CSS gradients + slow
// parallax transforms to suggest motion, plus typical game HUD chrome
// (health bar, minimap, crosshair) to sell the illusion.
//
// The game.coverGradient colours drive the scene's mood so different games
// feel different without needing real environment art.
// ─────────────────────────────────────────────────────────────────────────────

export default function MockGameView({
  game,
  currentZone,
}: {
  game: Game;
  currentZone: string;
}) {
  const [c1, c2] = game.coverGradient;

  // Time-based subtle pan — creates ambient motion
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = performance.now();
    const tick = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const panX = Math.sin(t * 0.15) * 14;
  const panY = Math.cos(t * 0.12) * 8;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl bg-bg">
      {/* Background atmospheric layers */}
      <div
        className="absolute inset-[-10%] transition-none"
        style={{
          background: `radial-gradient(ellipse at ${50 + panX}% ${45 + panY}%, ${c2}55 0%, ${c1}55 30%, #070B14 70%)`,
          transform: `translate(${panX * 0.4}px, ${panY * 0.4}px) scale(1.05)`,
        }}
      />
      {/* Grid floor suggestion */}
      <div
        className="absolute inset-0 bg-grid opacity-30"
        style={{
          transform: `perspective(500px) rotateX(62deg) translateY(30%) translateX(${panX * 0.6}px)`,
          transformOrigin: "center bottom",
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      />
      {/* Soft silhouettes suggesting characters/props */}
      <div
        className="absolute bottom-[22%] left-[18%] w-32 h-48 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, ${c1}99 0%, transparent 70%)`,
          transform: `translate(${panX * 1.5}px, 0)`,
        }}
      />
      <div
        className="absolute bottom-[26%] right-[22%] w-40 h-52 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, ${c2}aa 0%, transparent 70%)`,
          transform: `translate(${-panX * 1.2}px, 0)`,
        }}
      />
      {/* Subtle particle dots */}
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/30"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${20 + ((i * 23) % 60)}%`,
            transform: `translateY(${Math.sin(t * 0.5 + i) * 6}px)`,
            opacity: 0.2 + 0.3 * Math.sin(t + i),
          }}
        />
      ))}

      {/* ── Game HUD chrome ── */}

      {/* Zone banner top-center */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Map className="w-3 h-3 text-white/60" />
          <span className="text-white/90 tracking-wider uppercase">
            {currentZone}
          </span>
        </div>
      </div>

      {/* Health bar bottom-left */}
      <div className="absolute bottom-4 left-4 space-y-1.5 w-56">
        <div className="flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-rose" fill="currentColor" />
          <div className="flex-1 h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose to-rose/60" style={{ width: "78%" }} />
          </div>
          <span className="text-[10px] font-mono text-white/80">78/100</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-sm bg-teal/80" />
          <div className="flex-1 h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal to-teal/60" style={{ width: "62%" }} />
          </div>
          <span className="text-[10px] font-mono text-white/80">STA</span>
        </div>
      </div>

      {/* Minimap bottom-right */}
      <div className="absolute bottom-4 right-4 w-28 h-28 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `conic-gradient(from ${t * 20}deg, ${c1}80, ${c2}80, ${c1}80)`,
          }}
        />
        {/* Player indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 rounded-full bg-white" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-white animate-ping" />
        </div>
        {/* Objective */}
        <div
          className="absolute w-2 h-2 rounded-full bg-gold"
          style={{
            top: `${40 + Math.sin(t * 0.3) * 12}%`,
            left: `${55 + Math.cos(t * 0.3) * 18}%`,
          }}
        />
      </div>

      {/* Crosshair center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-4 h-4 relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/50" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/50" />
          <div className="absolute inset-[30%] rounded-full border border-white/70" />
        </div>
      </div>

      {/* Player panel top-left */}
      <div className="absolute top-5 left-5 flex items-center gap-2 text-white/90">
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-semibold">Player</div>
          <div className="text-[10px] font-mono text-white/60">LVL 23 · {game.genre}</div>
        </div>
      </div>

      {/* Stat counter top-right */}
      <div className="absolute top-5 right-5 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-sm border border-white/10">
        <Target className="w-3 h-3 text-gold" />
        <span className="text-xs font-mono text-white/80 tabular-nums">
          {Math.floor(t * 3 + 147).toLocaleString()}
        </span>
      </div>

      {/* "Streaming in" demo hint — appears & fades cyclically */}
      <div
        className="absolute bottom-36 left-1/2 -translate-x-1/2 text-center pointer-events-none"
        style={{
          opacity: 0.35 + 0.45 * Math.sin(t * 0.8),
        }}
      >
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/60">
          ✦ Assets streaming ✦
        </div>
      </div>
    </div>
  );
}
