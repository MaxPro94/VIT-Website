import { businessDate, coverageBoards, osrConfig, playerBoardUrl } from "./config.ts";
import { boardUnavailable, nextPagePath } from "./parse.ts";
import { buildSnapshot, type PlayerBoardHtml, type RankingSnapshot } from "./snapshot.ts";
import { publishSnapshot, readLatestSnapshot, withOsrLock } from "./storage.ts";

const userAgent = "VIT-Website/1.0 (public ranking sync)";

async function fetchPage(url: string) {
  const response = await fetch(url, {
    headers: { accept: "text/html", "user-agent": userAgent },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`OSR ${response.status} ${url}`);
  return response.text();
}

async function pause(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchBoard(start: string): Promise<PlayerBoardHtml & { skipped: boolean }> {
  let url = start;
  let html = await fetchPage(url);
  if (boardUnavailable(html)) return { html, sourceUrl: url, skipped: true };
  const next = nextPagePath(html);
  if (next) {
    const nextUrl = new URL(next, osrConfig.origin).toString();
    if (nextUrl !== url) {
      await pause(2000);
      html = await fetchPage(nextUrl);
      url = nextUrl;
    }
  }
  return { html, sourceUrl: url, skipped: boardUnavailable(html) };
}

export async function fetchPlayerBoards() {
  const boards: Array<PlayerBoardHtml & { skipped: boolean }> = [];
  for (const board of coverageBoards) {
    if (boards.length > 0) await pause(2000);
    boards.push(await fetchBoard(playerBoardUrl(board)));
  }
  if (boards.every((board) => board.skipped)) {
    throw new Error("OSR ranking unavailable");
  }
  return boards.filter((board) => !board.skipped);
}

export async function syncPublicRanking(options: { dryRun?: boolean; force?: boolean } = {}) {
  const today = businessDate();
  const current = await readLatestSnapshot();
  if (!options.force && !options.dryRun && current?.businessDate === today) {
    return { status: "skipped" as const, snapshot: current };
  }

  const boards = await fetchPlayerBoards();
  await pause(2000);
  const brigadeHtml = await fetchPage(osrConfig.brigadeUrl);
  const snapshot = buildSnapshot({
    boards,
    brigadeHtml,
    playersSourceUrl: osrConfig.playerUrl,
    brigadeSourceUrl: osrConfig.brigadeUrl,
  });

  if (options.dryRun) return { status: "dry-run" as const, snapshot };
  await withOsrLock(() => publishSnapshot(snapshot));
  return { status: "published" as const, snapshot };
}

export type SyncResult = {
  status: "skipped" | "dry-run" | "published";
  snapshot: RankingSnapshot;
};
