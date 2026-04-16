// ─────────────────────────────────────────────────────────────────────────────
// Shared types for the Aegis Nexus product demo.
// Keeping these in one place means every component agrees on the data shape.
// ─────────────────────────────────────────────────────────────────────────────

export type Tier = "Basic" | "Premium";

export type Genre =
  | "Action RPG"
  | "Open World"
  | "Shooter"
  | "MOBA"
  | "MMO"
  | "Strategy"
  | "Space Sim"
  | "Survival Horror"
  | "Co-op Adventure"
  | "Simulation"
  | "Fighting"
  | "Survival";

export interface Game {
  id: string;
  title: string;
  tagline: string;
  genre: Genre;
  tier: Tier;
  // Size in MB for precise math, converted in the UI
  traditionalSizeMB: number;
  bootstrapSizeMB: number;
  // Estimated traditional install time at 50 Mbps
  traditionalInstallMinutes: number;
  // Bootstrap install time in seconds on Aegis Nexus
  bootstrapInstallSeconds: number;
  // Visual: two-colour gradient used on procedurally generated covers
  coverGradient: [string, string];
  // Zones that the AI predictor cycles through while the user "plays"
  zones: string[];
}

export type AssetType = "texture" | "audio" | "geometry" | "shader";

export interface AssetEvent {
  id: string;
  name: string;
  type: AssetType;
  sizeMB: number;
  latencyMs: number;
  timestamp: number;
  // true when the asset was preloaded by the AI predictor before the user
  // actually needed it. Gold highlight in the HUD.
  aiPredicted: boolean;
  zone: string;
}

export interface PredictionState {
  currentZone: string;
  nextZone: string;
  confidence: number; // 0..1
  // Rising-edge flag the HUD uses to trigger a burst of predicted asset events
  justChanged: boolean;
}
