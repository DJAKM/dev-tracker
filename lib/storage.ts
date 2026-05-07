import fs from "fs";
import path from "path";

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

const REDIS_KEY = "devtracker:progress";

// ─── Upstash Redis (Vercel production) ────────────────────────────────────────
async function redisRead(): Promise<ProgressData> {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  const data = await redis.get<ProgressData>(REDIS_KEY);
  return data ? { ...DEFAULT_DATA, ...data } : DEFAULT_DATA;
}

async function redisWrite(data: ProgressData): Promise<void> {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  await redis.set(REDIS_KEY, data);
}

// ─── Local JSON file (development) ────────────────────────────────────────────
const DATA_FILE = process.env.DATA_PATH || path.join(process.cwd(), "data", "progress.json");

function fileRead(): ProgressData {
  try {
    if (!fs.existsSync(DATA_FILE)) return DEFAULT_DATA;
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DATA;
  }
}

function fileWrite(data: ProgressData): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Unified API ──────────────────────────────────────────────────────────────
const useRedis = () =>
  !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

export async function readProgress(): Promise<ProgressData> {
  return useRedis() ? redisRead() : fileRead();
}

export async function writeProgress(data: ProgressData): Promise<void> {
  return useRedis() ? redisWrite(data) : fileWrite(data);
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
