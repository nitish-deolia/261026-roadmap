import { seedRoadmaps } from "./data/roadmaps";
import type { Roadmap, RoadmapBackup } from "./types";

const STORAGE_KEY = "roadmap-hub:state:v1";
const MAX_BACKUP_BYTES = 2_000_000;
const MAX_ROADMAPS = 50;
const MAX_SECTIONS_PER_ROADMAP = 200;
const MAX_TODOS_PER_SECTION = 500;
const MAX_LINKS_PER_ROADMAP = 100;
const MAX_TEXT_LENGTH = 2_000;

function isText(value: unknown, maxLength = MAX_TEXT_LENGTH): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

function isSafeExternalUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2_000) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isRoadmap(value: unknown): value is Roadmap {
  if (!value || typeof value !== "object") return false;
  const roadmap = value as Partial<Roadmap>;
  return isText(roadmap.id, 100) && isText(roadmap.slug, 100) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(roadmap.slug) &&
    isText(roadmap.title, 160) && isText(roadmap.shortTitle, 160) &&
    isText(roadmap.description, 1_000) && isText(roadmap.category, 100) &&
    isText(roadmap.duration, 100) && isText(roadmap.weeklyHours, 100) &&
    Array.isArray(roadmap.sections) && roadmap.sections.length <= MAX_SECTIONS_PER_ROADMAP &&
    roadmap.sections.every((section) => section && isText(section.id, 100) &&
      isText(section.title, 160) && isText(section.subtitle, 300) &&
      isText(section.notes, 1_000) && isText(section.weeks, 100) &&
      ["lime", "mint", "blue", "violet", "orange", "pink"].includes(section.color) &&
      (section.milestone === undefined || isText(section.milestone, 1_000)) &&
      (section.custom === undefined || typeof section.custom === "boolean") &&
      Array.isArray(section.todos) && section.todos.length <= MAX_TODOS_PER_SECTION &&
      section.todos.every((todo) => todo && isText(todo.id, 100) &&
        isText(todo.text, 500) && typeof todo.completed === "boolean")) &&
    Array.isArray(roadmap.links) && roadmap.links.length <= MAX_LINKS_PER_ROADMAP &&
    roadmap.links.every((link) => link && isText(link.label, 200) &&
      isSafeExternalUrl(link.url) && isText(link.tag, 100));
}

function isRoadmapList(value: unknown): value is Roadmap[] {
  return Array.isArray(value) && value.length <= MAX_ROADMAPS && value.every(isRoadmap);
}

function mergeNewSeedRoadmaps(saved: Roadmap[]): Roadmap[] {
  const savedIds = new Set(saved.map((roadmap) => roadmap.id));
  return [...saved, ...seedRoadmaps.filter((roadmap) => !savedIds.has(roadmap.id))];
}

export function loadRoadmaps(): Roadmap[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return seedRoadmaps;
    if (new Blob([stored]).size > MAX_BACKUP_BYTES) return seedRoadmaps;
    const parsed: unknown = JSON.parse(stored);
    if (isRoadmapList(parsed)) return mergeNewSeedRoadmaps(parsed);
  } catch {
    // Use the starter roadmap if storage is unavailable or malformed.
  }
  return seedRoadmaps;
}

export function saveRoadmaps(roadmaps: Roadmap[]): void {
  try {
    const serialized = JSON.stringify(roadmaps);
    if (new Blob([serialized]).size <= MAX_BACKUP_BYTES) localStorage.setItem(STORAGE_KEY, serialized);
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
    !isRoadmapList((parsed as { roadmaps: unknown[] }).roadmaps)) {
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
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function roadmapProgress(roadmap: Roadmap): { done: number; total: number; percent: number } {
  const todos = roadmap.sections.flatMap((section) => section.todos);
  const done = todos.filter((todo) => todo.completed).length;
  return { done, total: todos.length, percent: todos.length ? Math.round((done / todos.length) * 100) : 0 };
}
