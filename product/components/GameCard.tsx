import Link from "next/link";
import type { Game } from "@/lib/types";
import GameCover from "./GameCover";
import { formatSize } from "@/lib/games";
import { Zap } from "lucide-react";

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link
      href={`/game/${game.id}`}
      className="group block rounded-xl overflow-hidden bg-bg-elevated border border-border hover:border-border-bright transition-all hover:-translate-y-1 hover:shadow-glow-teal"
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
          <GameCover game={game} size="md" />
        </div>
      </div>
      <div className="p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold text-ink text-sm leading-tight line-clamp-1">
            {game.title}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-ink-dim line-through">
            {formatSize(game.traditionalSizeMB)}
          </span>
          <span className="flex items-center gap-1 text-teal">
            <Zap className="w-3 h-3" strokeWidth={2.5} />
            {formatSize(game.bootstrapSizeMB)}
          </span>
        </div>
      </div>
    </Link>
  );
}
