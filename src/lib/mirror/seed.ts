import { readJson, writeJson, StorageKeys } from "./storage";
import { SoulSeed, MemoryShard } from "./types";
import { createBaseTraits, applyTextToTraits } from "./traits";
import { drawRandomArtifact } from "./artifacts";

export function defaultSeed(alias: string = "Seeker", vibe: SoulSeed["vibe"] = "ethereal"): SoulSeed {
  return {
    alias,
    vibe,
    level: 1,
    streakCount: 0,
    lastFedAt: null,
    traits: createBaseTraits(),
    artifacts: [],
    memories: [],
  };
}

export function loadSeed(): SoulSeed {
  return readJson<SoulSeed>(StorageKeys.soulSeed, defaultSeed());
}

export function saveSeed(seed: SoulSeed): void {
  writeJson(StorageKeys.soulSeed, seed);
}

function sameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export function feedSeed(seed: SoulSeed, promptId: string, text: string): { seed: SoulSeed; shard: MemoryShard } {
  const now = Date.now();
  const shard: MemoryShard = {
    id: `${promptId}_${now}`,
    createdAt: now,
    promptId,
    text,
    tags: [],
  };
  const updated: SoulSeed = { ...seed };
  updated.traits = applyTextToTraits(updated.traits, text);
  updated.memories = [...updated.memories, shard];
  if (!seed.lastFedAt || !sameDay(seed.lastFedAt, now)) {
    updated.streakCount = (seed.streakCount || 0) + 1;
  }
  updated.lastFedAt = now;
  // Leveling: every 5 streak days
  updated.level = Math.max(1, Math.floor(updated.streakCount / 5) + 1);
  // Reward
  const artifact = drawRandomArtifact();
  updated.artifacts = [...updated.artifacts, artifact];
  saveSeed(updated);
  return { seed: updated, shard };
} 