import { seedRoadmaps } from "./data/roadmaps";
import type { Roadmap, RoadmapBackup } from "./types";

const STORAGE_KEY = "roadmap-hub:state:v1";
const MAX_BACKUP_BYTES = 2_000_000;

function isRoadmap(value: unknown): value is Roadmap {
  if (!value || typeof value !== "object") return false;
  const roadmap = value as Partial<Roadmap>;
  return typeof roadmap.id === "string" && typeof roadmap.slug === "string" &&
    typeof roadmap.title === "string" && Array.isArray(roadmap.sections) &&
    roadmap.sections.every((section) => section && typeof section.id === "string" &&
      typeof section.title === "string" && Array.isArray(section.todos) &&
      section.todos.every((todo) => todo && typeof todo.id === "string" &&
        typeof todo.text === "string" && typeof todo.completed === "boolean"));
}

function mergeNewSeedRoadmaps(saved: Roadmap[]): Roadmap[] {
  const savedIds = new Set(saved.map((roadmap) => roadmap.id));
  return [...saved, ...seedRoadmaps.filter((roadmap) => !savedIds.has(roadmap.id))];
}

export function loadRoadmaps(): Roadmap[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return seedRoadmaps;
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.every(isRoadmap)) return mergeNewSeedRoadmaps(parsed);
  } catch {
    // Use the starter roadmap if storage is unavailable or malformed.
  }
  return seedRoadmaps;
}

export function saveRoadmaps(roadmaps: Roadmap[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmaps));
  } catch {
    // Keep the interface usable if browser storage is disabled or full.
  }
}

export function serializeBackup(roadmaps: Roadmap[]): string {
  const backup: RoadmapBackup = { schemaVersion: 1, exportedAt: new Date().toISOString(), roadmaps };
  return JSON.stringify(backup, null, 2);
}

export async function parseBackup(file: File): Promise<Roadmap[]> {
  if (file.size > MAX_BACKUP_BYTES) throw new Error("That backup is larger than 2 MB.");
  const parsed: unknown = JSON.parse(await file.text());
  if (!parsed || typeof parsed !== "object" || !("schemaVersion" in parsed) ||
    (parsed as { schemaVersion?: unknown }).schemaVersion !== 1 ||
    !("roadmaps" in parsed) || !Array.isArray((parsed as { roadmaps?: unknown }).roadmaps) ||
    !(parsed as { roadmaps: unknown[] }).roadmaps.every(isRoadmap)) {
    throw new Error("This file is not a valid Roadmap Hub backup.");
  }
  return mergeNewSeedRoadmaps((parsed as RoadmapBackup).roadmaps);
}

export function downloadBackup(roadmaps: Roadmap[]): void {
  const blob = new Blob([serializeBackup(roadmaps)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "roadmap-hub-backup.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function roadmapProgress(roadmap: Roadmap): { done: number; total: number; percent: number } {
  const todos = roadmap.sections.flatMap((section) => section.todos);
  const done = todos.filter((todo) => todo.completed).length;
  return { done, total: todos.length, percent: todos.length ? Math.round((done / todos.length) * 100) : 0 };
}
