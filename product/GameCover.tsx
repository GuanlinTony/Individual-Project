import type { Game } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// GameCover renders a procedurally generated SVG "cover art" panel.
// Avoids copyright issues with real game art and works offline.
// The gradient + pattern + title typography reads surprisingly well.
// ─────────────────────────────────────────────────────────────────────────────

export default function GameCover({
  game,
  size = "md",
}: {
  game: Game;
  size?: "sm" | "md" | "lg";
}) {
  const [c1, c2] = game.coverGradient;
  const id = `grad-${game.id}`;

  const dims = {
    sm: { w: 160, h: 214, titleSize: 14, taglineSize: 8 },
    md: { w: 260, h: 348, titleSize: 22, taglineSize: 10 },
    lg: { w: 420, h: 562, titleSize: 34, taglineSize: 14 },
  }[size];

  return (
    <svg
      viewBox={`0 0 ${dims.w} ${dims.h}`}
      className="w-full h-full block"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`${id}-r`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <pattern
          id={`${id}-dots`}
          width="8" height="8"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="0.6" fill="rgba(255,255,255,0.08)" />
        </pattern>
      </defs>

      <rect width={dims.w} height={dims.h} fill={`url(#${id})`} />
      <rect width={dims.w} height={dims.h} fill={`url(#${id}-r)`} />
      <rect width={dims.w} height={dims.h} fill={`url(#${id}-dots)`} />

      {/* Dark wash at bottom for text legibility */}
      <rect
        x="0"
        y={dims.h * 0.55}
        width={dims.w}
        height={dims.h * 0.45}
        fill="url(#dark-wash)"
      />
      <defs>
        <linearGradient id="dark-wash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(7,11,20,0)" />
          <stop offset="100%" stopColor="rgba(7,11,20,0.85)" />
        </linearGradient>
      </defs>

      {/* Genre tag */}
      <text
        x="12"
        y="22"
        fontSize={dims.taglineSize}
        fill="rgba(255,255,255,0.9)"
        fontFamily="ui-monospace, monospace"
        letterSpacing="1"
      >
        {game.genre.toUpperCase()}
      </text>

      {/* Tier badge, top-right */}
      <rect
        x={dims.w - (game.tier === "Premium" ? 66 : 52)}
        y="10"
        width={game.tier === "Premium" ? 56 : 42}
        height="18"
        rx="3"
        fill={game.tier === "Premium" ? "#F5C518" : "rgba(255,255,255,0.18)"}
      />
      <text
        x={dims.w - (game.tier === "Premium" ? 38 : 31)}
        y="22"
        fontSize="10"
        fontWeight="700"
        fill={game.tier === "Premium" ? "#1a1a2e" : "#fff"}
        fontFamily="ui-monospace, monospace"
        textAnchor="middle"
        letterSpacing="1"
      >
        {game.tier.toUpperCase()}
      </text>

      {/* Title */}
      <text
        x="12"
        y={dims.h - 34}
        fontSize={dims.titleSize}
        fontWeight="800"
        fill="#fff"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {game.title.length > 22 ? game.title.slice(0, 21) + "…" : game.title}
      </text>
      {size !== "sm" && (
        <text
          x="12"
          y={dims.h - 14}
          fontSize={dims.taglineSize}
          fill="rgba(230,237,245,0.75)"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {game.tagline.length > 52
            ? game.tagline.slice(0, 51) + "…"
            : game.tagline}
        </text>
      )}
    </svg>
  );
}
