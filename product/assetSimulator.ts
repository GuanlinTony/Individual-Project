import type { AssetEvent, AssetType, PredictionState, Game } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Asset simulator
// ─────────────────────────────────────────────────────────────────────────────
// This module fabricates a convincing stream of asset-fetch events for the
// live streaming HUD. It is intentionally pseudo-random but reproducible-ish
// so demos don't produce awkward dead time.
//
// Design rules:
//   • Most events are reactive fetches (user stepped into view) — white/teal.
//   • ~25% of events are AI-predicted preloads — gold.
//   • Texture fetches are common & small; geometry chunks are bigger & rarer.
//   • When the predictor switches "zone," we emit a burst of 4-6 predicted
//     events within ~800 ms to make the AI's work visible in the feed.
// ─────────────────────────────────────────────────────────────────────────────

const TEXTURE_NAMES = [
  "castle_wall_4k", "cobblestone_diffuse", "oak_bark_normal", "metal_plate_roughness",
  "sand_dune_albedo", "ice_crystal_metallic", "concrete_weathered", "moss_detail",
  "leather_worn", "neon_sign_emissive", "rain_puddle_caustic", "fabric_silk_sheen",
  "bronze_engraving", "ash_ground_2k", "mossy_rock_displacement", "char_face_skin",
];

const AUDIO_NAMES = [
  "ambient_wind_loop", "footstep_stone_01", "sword_draw_metal", "dialogue_guard_03",
  "music_cue_combat", "water_splash_shallow", "crow_distant_02", "door_creak_wood",
  "crowd_murmur_tavern", "ember_crackle", "wind_howl_mountain", "bell_toll_far",
];

const GEOMETRY_NAMES = [
  "char_npc_villager_lod0", "prop_barrel_medium", "tree_oak_seasonal", "building_keep_tower",
  "weapon_longsword", "prop_torch_lit", "terrain_chunk_A4", "char_enemy_grunt_lod1",
  "door_iron_heavy", "wagon_merchant", "crate_stacked_set", "arch_stone_weathered",
];

const SHADER_NAMES = [
  "PBR_metallic_v3", "water_caustic_v2", "foliage_wind_v4", "skin_subsurf_v2",
  "fog_volumetric_v1", "glass_refract_v2", "fire_emissive_v3", "terrain_blend_v5",
];

const ASSET_POOLS: Record<AssetType, string[]> = {
  texture: TEXTURE_NAMES,
  audio: AUDIO_NAMES,
  geometry: GEOMETRY_NAMES,
  shader: SHADER_NAMES,
};

// Mix weights: textures dominate real asset streams (Unreal/Unity workloads).
const TYPE_WEIGHTS: Array<[AssetType, number]> = [
  ["texture", 0.55],
  ["geometry", 0.22],
  ["audio", 0.17],
  ["shader", 0.06],
];

// Plausible file-size ranges in MB per asset type
const TYPE_SIZE_RANGE: Record<AssetType, [number, number]> = {
  texture: [0.4, 4.2],
  audio: [0.2, 1.8],
  geometry: [1.5, 8.0],
  shader: [0.1, 0.9],
};

function weightedPick<T>(weights: Array<[T, number]>): T {
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of weights) {
    r -= w;
    if (r <= 0) return v;
  }
  return weights[0][0];
}

function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickName(type: AssetType): string {
  const pool = ASSET_POOLS[type];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Generate a single asset-fetch event.
 * If `forcePredicted` is true, mark it as AI-preloaded (gold highlight).
 */
export function generateAssetEvent(
  zone: string,
  forcePredicted = false,
): AssetEvent {
  const type = weightedPick(TYPE_WEIGHTS);
  const [sizeMin, sizeMax] = TYPE_SIZE_RANGE[type];
  const name = pickName(type);
  // File extension reflects typical asset pipelines
  const ext = { texture: ".dds", audio: ".ogg", geometry: ".mesh", shader: ".spv" }[type];
  // Predicted fetches come from the edge cache → notably lower latency
  const aiPredicted = forcePredicted || Math.random() < 0.22;
  const latency = aiPredicted ? randRange(12, 28) : randRange(28, 72);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: `${name}${ext}`,
    type,
    sizeMB: Number(randRange(sizeMin, sizeMax).toFixed(2)),
    latencyMs: Math.round(latency),
    timestamp: Date.now(),
    aiPredicted,
    zone,
  };
}

/**
 * Produce a burst of predicted events — fired when the AI predictor
 * switches to a new likely-next zone.
 */
export function generatePredictedBurst(nextZone: string, count = 5): AssetEvent[] {
  return Array.from({ length: count }, () => generateAssetEvent(nextZone, true));
}

// ─────────────────────────────────────────────────────────────────────────────
// AI zone predictor state machine
// ─────────────────────────────────────────────────────────────────────────────
// Starts in the game's first zone, "predicts" the next one with 75-95%
// confidence. Every ~9-14 s, advances to the predicted zone and locks in
// a new prediction. The rising-edge of justChanged = true is the HUD's cue
// to emit a predicted-asset burst.
// ─────────────────────────────────────────────────────────────────────────────

export function initPredictionState(game: Game): PredictionState {
  const zones = game.zones;
  return {
    currentZone: zones[0],
    nextZone: zones[1] ?? zones[0],
    confidence: 0.82,
    justChanged: false,
  };
}

export function advancePrediction(
  state: PredictionState,
  game: Game,
): PredictionState {
  const zones = game.zones;
  // Move into the previously predicted zone
  const current = state.nextZone;
  // Predict next: prefer moving forward in the list, wrap around with lower confidence
  const currentIdx = zones.indexOf(current);
  const nextIdx = (currentIdx + 1) % zones.length;
  const next = zones[nextIdx];
  // Confidence drifts between 0.72 and 0.95
  const confidence = Number((0.72 + Math.random() * 0.23).toFixed(2));
  return {
    currentZone: current,
    nextZone: next,
    confidence,
    justChanged: true,
  };
}
