import fs from "fs";
import path from "path";

const DATA_FILE = process.env.DATA_PATH || path.join(process.cwd(), "data", "progress.json");

export interface ProgressData {
  startDate: string | null;
  completions: Record<string, string[]>; // date -> task ids
  questionsSeen: Record<string, string[]>; // date -> question ids
}

const DEFAULT_DATA: ProgressData = {
  startDate: null,
  completions: {},
  questionsSeen: {},
};

export function readProgress(): ProgressData {
  try {
    if (!fs.existsSync(DATA_FILE)) return DEFAULT_DATA;
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DATA;
  }
}

export function writeProgress(data: ProgressData): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getDayNumber(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
}
