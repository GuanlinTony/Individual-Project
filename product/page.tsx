import Link from "next/link";
import { ArrowRight, Zap, Brain, Smartphone } from "lucide-react";
import StorageCalculator from "@/components/StorageCalculator";
import { GAMES } from "@/lib/games";
import GameCover from "@/components/GameCover";

// ─────────────────────────────────────────────────────────────────────────────
// Landing page. Server component — all interactivity is delegated to
// <StorageCalculator /> which is a client component.
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  // Pick a handful of titles for the floating hero covers
  const featured = [GAMES[0], GAMES[2], GAMES[4], GAMES[7], GAMES[10]];

  return (
    <div className="relative">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal/30 bg-teal/5 text-teal text-xs font-mono tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              NOW STREAMING · EDGE NODE ACTIVE
            </div>
            <h1 className="mt-5 text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Play AAA games.
              <br />
              <span className="bg-gradient-to-r from-teal via-lime to-gold bg-clip-text text-transparent">
                Skip the 80 GB download.
              </span>
            </h1>
            <p className="mt-6 text-lg text-ink-muted max-w-xl leading-relaxed">
              Aegis Nexus runs the game on your device and streams only the
              assets you need, when you need them. Install in seconds. Keep
              dozens of games ready to play. Never uninstall to make room
              again.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/library"
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-teal text-navy font-semibold hover:bg-teal/90 transition-colors"
              >
                Browse the library
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <div className="text-sm text-ink-dim font-mono">
                12 titles · all tiers · no credit card required for demo
              </div>
            </div>

            {/* Feature triplet */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              {[
                { icon: Zap, label: "Install in seconds", sub: "8 s vs 45 min" },
                { icon: Brain, label: "AI asset prediction", sub: "87% hit rate" },
                { icon: Smartphone, label: "Works on any device", sub: "2 GB free is enough" },
              ].map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <f.icon className="w-5 h-5 text-teal" strokeWidth={2} />
                  <div className="text-sm font-semibold text-ink">{f.label}</div>
                  <div className="text-xs font-mono text-ink-dim">{f.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating cover collage */}
          <div className="relative h-[520px] hidden lg:block">
            {featured.map((g, i) => {
              const positions = [
                "top-0 left-4 rotate-[-6deg] w-44",
                "top-16 right-8 rotate-[4deg] w-40",
                "top-44 left-20 rotate-[2deg] w-48 z-10",
                "bottom-20 right-0 rotate-[-3deg] w-44",
                "bottom-0 left-4 rotate-[5deg] w-40",
              ];
              return (
                <div
                  key={g.id}
                  className={`absolute ${positions[i]} rounded-xl overflow-hidden shadow-2xl border border-border-bright`}
                  style={{ aspectRatio: "3 / 4" }}
                >
                  <GameCover game={g} size="md" />
                </div>
              );
            })}
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-gradient-radial from-teal/10 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── Storage calculator ──────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="mb-5">
          <div className="text-xs uppercase tracking-[0.2em] text-ink-dim font-mono">
            Do the math
          </div>
          <h2 className="mt-2 text-3xl font-bold text-ink">
            How many games fit on your device?
          </h2>
        </div>
        <StorageCalculator />
      </section>

      {/* ── How it works strip ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.2em] text-ink-dim font-mono">
            How it works
          </div>
          <h2 className="mt-2 text-3xl font-bold text-ink">
            Assets stream. Game logic stays on your device.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              n: "01",
              title: "You tap Install",
              body: "A ~200 MB runtime streams in under 10 seconds. That's the game's executable code, not the asset library.",
            },
            {
              n: "02",
              title: "You tap Play",
              body: "The game starts instantly. Textures, audio, and geometry stream from the nearest edge node as the engine requests them.",
            },
            {
              n: "03",
              title: "The AI thinks ahead",
              body: "A predictor watches your play and preloads the assets for the zone you're most likely to enter next — at 87%+ accuracy.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-border bg-bg-elevated p-6"
            >
              <div className="text-gold font-mono text-sm">{s.n}</div>
              <h3 className="mt-3 font-semibold text-ink text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-teal/40 bg-gradient-to-br from-teal/10 via-bg-elevated to-gold/5 p-10 text-center">
          <h2 className="text-3xl font-bold text-ink">
            Try the streaming HUD live.
          </h2>
          <p className="mt-3 text-ink-muted max-w-xl mx-auto">
            Pick any game, watch the 8-second install, then see the AI predictor
            preload assets for you in real time.
          </p>
          <Link
            href="/library"
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-teal text-navy font-semibold hover:bg-teal/90 transition-colors"
          >
            Open the library
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
