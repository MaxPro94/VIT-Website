import { mkdir, readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { rankingSnapshotSchema, type RankingSnapshot } from "./snapshot.ts";

export function osrDataDir() {
  return process.env.OSR_DATA_DIR ?? path.join(process.cwd(), "data", "osr");
}

function latestPath() {
  return path.join(osrDataDir(), "latest.json");
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withOsrLock<T>(action: () => Promise<T>) {
  const dir = osrDataDir();
  await mkdir(dir, { recursive: true });
  const lockPath = path.join(dir, ".lock");
  const started = Date.now();
  for (;;) {
    try {
      await writeFile(lockPath, String(process.pid), { flag: "wx" });
      break;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") throw error;
      const info = await stat(lockPath).catch(() => null);
      if (info && Date.now() - info.mtimeMs > 10 * 60 * 1000) {
        await unlink(lockPath).catch(() => undefined);
        continue;
      }
      if (Date.now() - started > 15_000) throw new Error("OSR lock busy");
      await sleep(200);
    }
  }
  try {
    return await action();
  } finally {
    await unlink(lockPath).catch(() => undefined);
  }
}

async function atomicWrite(file: string, payload: string) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, payload);
  await rename(temporary, file);
}

export async function publishSnapshot(snapshot: RankingSnapshot) {
  const payload = `${JSON.stringify(snapshot, null, 2)}\n`;
  const dayFile = path.join(osrDataDir(), "snapshots", `${snapshot.businessDate}.json`);
  await atomicWrite(dayFile, payload);
  await atomicWrite(latestPath(), payload);
}

export async function readLatestSnapshot(): Promise<RankingSnapshot | null> {
  try {
    const raw = await readFile(latestPath(), "utf8");
    const parsed = rankingSnapshotSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function readRankingHistory(): Promise<RankingSnapshot[]> {
  const dir = path.join(osrDataDir(), "snapshots");
  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  const snapshots: RankingSnapshot[] = [];
  for (const file of files) {
    if (!/^\d{4}-\d{2}-\d{2}\.json$/.test(file)) continue;
    try {
      const raw = await readFile(path.join(dir, file), "utf8");
      const parsed = rankingSnapshotSchema.safeParse(JSON.parse(raw));
      if (parsed.success) snapshots.push(parsed.data);
    } catch {
      continue;
    }
  }
  snapshots.sort((left, right) => left.businessDate.localeCompare(right.businessDate));
  return snapshots;
}

export function isFresh(snapshot: RankingSnapshot, now = Date.now()) {
  const collected = Date.parse(snapshot.collectedAt);
  if (Number.isNaN(collected)) return false;
  return now - collected <= 26 * 60 * 60 * 1000;
}
