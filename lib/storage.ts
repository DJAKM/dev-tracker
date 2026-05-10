import fs from "fs";
import path from "path";

export interface ProgressData {
  startDate: string | null;
  completions: Record<string, string[]>;
  questionsSeen: Record<string, string[]>;
}

const DEFAULT_DATA: ProgressData = {
  startDate: null,
  completions: {},
  questionsSeen: {},
};

// Per-user Redis key
const redisKey = (userId: string) => `devtracker:progress:${userId}`;

// ─── Upstash Redis ─────────────────────────────────────────────────────────────
async function redisRead(userId: string): Promise<ProgressData> {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  const data = await redis.get<ProgressData>(redisKey(userId));
  return data ? { ...DEFAULT_DATA, ...data } : { ...DEFAULT_DATA };
}

async function redisWrite(userId: string, data: ProgressData): Promise<void> {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  await redis.set(redisKey(userId), data);
}

// ─── Local JSON file (development) ─────────────────────────────────────────────
const DATA_DIR = process.env.DATA_PATH || path.join(process.cwd(), "data");

function fileRead(userId: string): ProgressData {
  try {
    const file = path.join(DATA_DIR, `progress-${userId}.json`);
    if (!fs.existsSync(file)) return { ...DEFAULT_DATA };
    return { ...DEFAULT_DATA, ...JSON.parse(fs.readFileSync(file, "utf-8")) };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function fileWrite(userId: string, data: ProgressData): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `progress-${userId}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Unified API ───────────────────────────────────────────────────────────────
const useRedis = () =>
  !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

export async function readProgress(userId: string): Promise<ProgressData> {
  return useRedis() ? redisRead(userId) : fileRead(userId);
}

export async function writeProgress(userId: string, data: ProgressData): Promise<void> {
  return useRedis() ? redisWrite(userId, data) : fileWrite(userId, data);
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
