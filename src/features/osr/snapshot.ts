import { z } from "zod";
import { businessDate, gearIds, osrConfig } from "./config.ts";
import { boardUnavailable, findBrigade, mergePlayers, nextPagePath, playersInBrigade, type ParsedPlayer } from "./parse.ts";

const characterSchema = z.object({
  nickname: z.string().min(1),
  nation: z.string(),
  gear: z.enum(gearIds),
  level: z.number().int().nullable(),
  fame: z.number().int().nullable(),
  monthly: z.number().int().nullable(),
  win: z.number().int().nullable(),
  lose: z.number().int().nullable(),
});

export const rankingSnapshotSchema = z.object({
  version: z.literal(1),
  collectedAt: z.string().datetime(),
  businessDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  brigade: z
    .object({
      name: z.string(),
      nation: z.string(),
      leader: z.string(),
      averageLevel: z.number().int().nullable(),
      members: z.number().int().nullable(),
      rank: z.number().int().nullable(),
      totalFame: z.number().int().nullable(),
      monthlyFame: z.number().int().nullable(),
      sourceUrl: z.string().url(),
    })
    .nullable(),
  players: z.object({
    sourceUrl: z.string().url(),
    rowsRead: z.number().int().nonnegative(),
    reachedEnd: z.boolean(),
    characters: z.array(characterSchema),
    sources: z.array(z.string()).default([]),
    exhaustive: z.boolean(),
    reason: z.enum([
      "complete",
      "public-list-shorter-than-roster",
      "list-not-finished",
      "duplicate-nicknames",
      "members-unknown",
      "brigade-missing",
    ]),
  }),
});

export type RankingSnapshot = z.infer<typeof rankingSnapshotSchema>;
export type RankedCharacter = RankingSnapshot["players"]["characters"][number];

export function assessCoverage(input: {
  characters: ParsedPlayer[];
  members: number | null;
  reachedEnd: boolean;
  brigadeFound: boolean;
}): Pick<RankingSnapshot["players"], "exhaustive" | "reason"> {
  const names = input.characters.map((character) => character.nickname);
  const unique = new Set(names);
  if (!input.brigadeFound) return { exhaustive: false, reason: "brigade-missing" };
  if (!input.reachedEnd) return { exhaustive: false, reason: "list-not-finished" };
  if (unique.size !== names.length) return { exhaustive: false, reason: "duplicate-nicknames" };
  if (input.members === null) return { exhaustive: false, reason: "members-unknown" };
  if (unique.size !== input.members) {
    return { exhaustive: false, reason: "public-list-shorter-than-roster" };
  }
  return { exhaustive: true, reason: "complete" };
}

export type PlayerBoardHtml = {
  html: string;
  sourceUrl: string;
};

function readBoards(input: { playersHtml?: string; boards?: PlayerBoardHtml[]; playersSourceUrl?: string }) {
  const boards = input.boards ?? [
    { html: input.playersHtml ?? "", sourceUrl: input.playersSourceUrl ?? osrConfig.playerUrl },
  ];
  const usable = boards.filter((board) => !boardUnavailable(board.html));
  const characters = mergePlayers(usable.map((board) => playersInBrigade(board.html)));
  return {
    characters,
    reachedEnd: usable.length > 0 && usable.every((board) => nextPagePath(board.html) === null),
    sources: usable.map((board) => board.sourceUrl),
  };
}

export function buildSnapshot(input: {
  playersHtml?: string;
  boards?: PlayerBoardHtml[];
  brigadeHtml: string;
  collectedAt?: Date;
  playersSourceUrl?: string;
  brigadeSourceUrl?: string;
}): RankingSnapshot {
  const collectedAt = input.collectedAt ?? new Date();
  const brigade = findBrigade(input.brigadeHtml);
  const read = readBoards(input);
  const characters = read.characters.map((player) => ({
    nickname: player.nickname,
    nation: player.nation,
    gear: player.gear,
    level: player.level,
    fame: player.fame,
    monthly: player.monthly,
    win: player.win,
    lose: player.lose,
  }));
  const coverage = assessCoverage({
    characters: read.characters,
    members: brigade?.members ?? null,
    reachedEnd: read.reachedEnd,
    brigadeFound: brigade !== null,
  });

  return {
    version: 1,
    collectedAt: collectedAt.toISOString(),
    businessDate: businessDate(collectedAt),
    brigade: brigade
      ? {
          name: brigade.name,
          nation: brigade.nation,
          leader: brigade.leader,
          averageLevel: brigade.averageLevel,
          members: brigade.members,
          rank: brigade.rank,
          totalFame: brigade.totalFame,
          monthlyFame: brigade.monthlyFame,
          sourceUrl: input.brigadeSourceUrl ?? osrConfig.brigadeUrl,
        }
      : null,
    players: {
      sourceUrl: input.playersSourceUrl ?? read.sources[0] ?? osrConfig.playerUrl,
      rowsRead: characters.length,
      reachedEnd: read.reachedEnd,
      characters,
      sources: read.sources,
      exhaustive: coverage.exhaustive,
      reason: coverage.reason,
    },
  };
}
