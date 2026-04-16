"use client";

import { useState, useMemo } from "react";
import { GAMES } from "@/lib/games";
import GameCard from "@/components/GameCard";
import type { Genre, Tier } from "@/lib/types";
import clsx from "clsx";

// ─────────────────────────────────────────────────────────────────────────────
// Library page — client component so the filter chips feel instant.
// Filters: tier (All / Basic / Premium) and genre (chip strip).
// ─────────────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const [tierFilter, setTierFilter] = useState<Tier | "All">("All");
  const [genreFilter, setGenreFilter] = useState<Genre | null>(null);

  const genres = useMemo(
    () => Array.from(new Set(GAMES.map((g) => g.genre))),
    [],
  );

  const filtered = useMemo(() => {
    return GAMES.filter((g) => {
      if (tierFilter !== "All" && g.tier !== tierFilter) return false;
      if (genreFilter && g.genre !== genreFilter) return false;
      return true;
    });
  }, [tierFilter, genreFilter]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-ink-dim font-mono">
          Catalog
        </div>
        <h1 className="mt-2 text-4xl font-bold text-ink">Game library</h1>
        <p className="mt-2 text-ink-muted">
          Every title installs in under 10 seconds. Tap any game to see the
          size comparison and start playing.
        </p>
      </div>

      {/* Tier filter — pill group */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-[11px] uppercase tracking-wider font-mono text-ink-dim mr-1">
          Tier:
        </span>
        {(["All", "Basic", "Premium"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTierFilter(t)}
            className={clsx(
              "px-3 py-1.5 text-xs rounded-md font-medium transition-colors",
              tierFilter === t
                ? t === "Premium"
                  ? "bg-gold text-navy"
                  : "bg-teal text-navy"
                : "border border-border text-ink-muted hover:text-ink hover:border-border-bright",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Genre chips */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-[11px] uppercase tracking-wider font-mono text-ink-dim mr-1">
          Genre:
        </span>
        <button
          onClick={() => setGenreFilter(null)}
          className={clsx(
            "px-2.5 py-1 text-xs rounded-md transition-colors",
            !genreFilter
              ? "bg-border text-ink"
              : "text-ink-dim hover:text-ink",
          )}
        >
          All
        </button>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setGenreFilter(g === genreFilter ? null : g)}
            className={clsx(
              "px-2.5 py-1 text-xs rounded-md transition-colors",
              g === genreFilter
                ? "bg-border text-ink"
                : "text-ink-dim hover:text-ink",
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Result count */}
      <div className="text-xs font-mono text-ink-dim mb-4">
        {filtered.length} {filtered.length === 1 ? "title" : "titles"}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-muted">
          No titles match those filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      )}
    </div>
  );
}
