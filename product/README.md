# Aegis Nexus — Product Demo

A consumer-facing web app that shows what it feels like to **actually use**
Aegis Nexus as a gamer — not a marketing pitch. Built as the product-side
companion to the RSM 8542 launch plan.

Pick a game from the catalog, watch it install in ~8 seconds (not 45
minutes), then see the AI asset predictor preload the next zone live in the
streaming HUD.

---

## Tech stack

| Layer       | Choice                      |
| ----------- | --------------------------- |
| Framework   | Next.js 14 (App Router)     |
| Language    | TypeScript                  |
| Styling     | Tailwind CSS                |
| Animation   | Framer Motion               |
| Icons       | lucide-react                |
| Deploy      | Vercel (free, GitHub-linked)|

Everything is client-side simulated — no backend, no API keys, no database.

---

## Prerequisites

- **Node.js ≥ 18.17** — [nodejs.org](https://nodejs.org) or `nvm install 20`
- **npm** (bundled with Node) — or pnpm / yarn if you prefer

Check:

```bash
node -v   # v18.17+ or v20+
npm -v    # 9+
```

---

## Run locally (first time)

From the repository root:

```bash
cd product
npm install           # ~30-60 seconds
npm run dev           # start the Next.js dev server
```

Open **http://localhost:3000** — the app hot-reloads on file save.

### Common issues

| Symptom                                    | Fix                                                  |
| ------------------------------------------ | ---------------------------------------------------- |
| `EADDRINUSE: port 3000 already in use`     | `npm run dev -- -p 3001`                             |
| `Cannot find module '@/components/...'`    | Run from the `product/` folder — not the repo root.  |
| Blank white page, console errors on fonts  | Network blocked Google Fonts — try a different network, fonts will fall back to system sans. |
| Slow first load                            | Normal — Next.js compiles on demand in dev mode.     |

### Production build (optional sanity check)

```bash
npm run build         # type-checks and produces an optimized bundle
npm run start         # serves the production build on :3000
```

---

## Deploy to Vercel (public URL, free)

1. **Push the `product/` folder to a public GitHub repo.** It must contain
   `package.json` at the directory Vercel is pointed at.

2. Go to **[https://vercel.com/new](https://vercel.com/new)** and sign in
   with GitHub.

3. Click **Import Project** → pick your repo.
   - **Root Directory:** set this to `product` (or leave as root if `product/`
     is at the top of the repo)
   - **Framework Preset:** Vercel auto-detects Next.js — leave it
   - **Environment variables:** none needed

4. Click **Deploy**. In ~60 seconds you get a public URL like
   `https://aegis-nexus-product.vercel.app` that anyone can view.

5. **Re-deployment is automatic** — every `git push` to the connected branch
   rebuilds and redeploys the site.

### Alternative deployment options

- **Netlify** — same flow, point it at the `product/` folder.
- **Self-hosted** — `npm run build` then serve with `npm run start` behind
  a reverse proxy (nginx, caddy).

---

## What's in the demo

### User flow

1. **Landing (`/`)** — hero, floating cover collage, interactive storage
   calculator (slider: "Your phone has X GB free → you could install Y games"),
   "How it works" strip, CTA.
2. **Library (`/library`)** — 12 mock AAA titles in a filterable grid
   (by tier and genre). Each card shows the traditional size crossed out
   next to the Aegis Nexus bootstrap size.
3. **Game detail (`/game/[id]`)** — big cover, stark side-by-side comparison
   (`82 GB / 45 min` vs `220 MB / 8 s`), zone preview, and the **Install &amp;
   play** button.
4. **Install overlay** — full-screen modal with a 6-stage install
   animation (edge-node handshake → bootstrap → AI warm-up → zone preload
   → ready) paced to `game.bootstrapInstallSeconds`. Routes to /play on
   completion.
5. **Play (`/play/[id]`)** — **the hero.** Mock game view on the left
   (atmospheric parallax scene + HUD chrome: health bar, minimap,
   crosshair) and the live **Streaming HUD** on the right.

### The Streaming HUD (your chosen hero moment)

Five widgets driven by a single event loop in `components/StreamingHUD.tsx`:

- **LatencyPill** — rolling average of recent fetch latencies, colour-coded.
- **BandwidthChart** — live SVG sparkline of synthetic throughput.
- **StorageMeter** — circular gauge showing the tiny local footprint vs
  the storage saved.
- **AIPredictionCard** — current zone → predicted next zone, with a
  confidence ring. Pulses gold when the predictor advances and fires a
  burst of preloaded assets.
- **AssetFeed** — the centerpiece. A scrolling list of incoming
  asset fetches, colour-tagged by type (TEX / GEO / AUD / SHD). Reactive
  fetches are neutral; AI-predicted preloads are gold with an **AI** badge.

Every ~10 seconds the predictor advances zone and emits a visible burst of
gold preload events — that's the "AI visibility" moment the demo is built
around.

---

## File tree

```
product/
├── app/
│   ├── layout.tsx              # root shell + fonts + nav
│   ├── page.tsx                # landing
│   ├── globals.css             # Tailwind + body defaults
│   ├── library/page.tsx        # catalog grid with filters
│   ├── game/[id]/page.tsx      # detail + install trigger
│   └── play/[id]/page.tsx      # mock game view + streaming HUD
├── components/
│   ├── Nav.tsx
│   ├── GameCover.tsx           # procedural SVG cover art
│   ├── GameCard.tsx
│   ├── StorageCalculator.tsx
│   ├── InstallOverlay.tsx      # 8-second staged install
│   ├── MockGameView.tsx        # atmospheric gameplay background
│   ├── StreamingHUD.tsx        # ⭐ event loop + widget orchestrator
│   ├── AssetFeed.tsx           # scrolling live fetch list
│   ├── AIPredictionCard.tsx    # zone predictor with confidence ring
│   ├── BandwidthChart.tsx      # live sparkline
│   ├── StorageMeter.tsx        # circular local-footprint gauge
│   └── LatencyPill.tsx         # latency readout
├── lib/
│   ├── types.ts                # shared TypeScript types
│   ├── games.ts                # 12-title mock catalog
│   └── assetSimulator.ts       # asset event generator + zone predictor
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── postcss.config.mjs
└── README.md                   # this file
```

---

## Customising

### Add / edit games
Edit `lib/games.ts`. Each entry needs a unique `id`, traditional/bootstrap
sizes in MB, install times, a `coverGradient` (two hex colours — these drive
both the cover art and the in-game scene mood), and a `zones` list that
powers the AI predictor on the play page.

### Tune the streaming feel
All pacing lives in `components/StreamingHUD.tsx` and
`lib/assetSimulator.ts`:

| Knob                        | File                     | Effect                                   |
| --------------------------- | ------------------------ | ---------------------------------------- |
| `NORMAL_EVENT_MIN/MAX_MS`   | `StreamingHUD.tsx`       | Pace of reactive asset events            |
| `PREDICTION_CYCLE_MS`       | `StreamingHUD.tsx`       | How often the AI advances zones          |
| `MAX_FEED_ITEMS`            | `StreamingHUD.tsx`       | Depth of the scrolling feed              |
| AI-predicted probability    | `assetSimulator.ts`      | `Math.random() < 0.22` — raise for more  |
| Asset type mix              | `assetSimulator.ts`      | `TYPE_WEIGHTS` array                     |
| Size ranges per type        | `assetSimulator.ts`      | `TYPE_SIZE_RANGE` object                 |

### Change the palette
Edit `tailwind.config.ts` — the `colors` object defines the whole look.
The current palette carries the navy/gold/teal from the marketing deck but
shifted into gaming-dark territory (near-black backgrounds, electric
accents).

---

## Demo script (60 seconds, for the bonus-mark pitch)

1. **Landing** — "This is what a gamer lands on. Move the storage slider —
   at 8 GB free, a traditional user fits 0 AAA games; with Aegis Nexus, they
   fit dozens."
2. **Library → pick Ironveil** — "Normally an 82 GB, 45-minute download."
3. **Click Install & play** — "Watch the HUD. Edge handshake. Bootstrap
   runtime. AI primes the first zone. Ready in 8 seconds."
4. **Play page — point at the HUD** — "Every line is a live asset fetch.
   White and teal are reactive — the engine asked, the edge delivered.
   **Gold** means the AI predicted it and had it waiting before the player
   needed it."
5. **Wait ~10 seconds** — "There it goes. The predictor just advanced,
   confidence 84%, and fired a burst of preloaded textures and geometry
   for the next zone. The player will walk into that area and it'll feel
   instant — that's the product."

---

Aegis Nexus · RSM 8542 Individual Project · Spring 2026
