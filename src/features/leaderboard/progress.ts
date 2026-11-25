import type { RankingSnapshot, RankedCharacter } from "../osr/snapshot.ts";
import { rankRows } from "./rank.ts";

export type Progress = {
  fameDeltaDay: number | null;
  fameDeltaWeek: number | null;
  rankDeltaDay: number | null;
};

export function shiftBusinessDate(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function delta(current: number | null, previous: number | null) {
  if (current === null || previous === null) return null;
  return current - previous;
}

function fameRanks(characters: readonly RankedCharacter[]) {
  return new Map(rankRows(characters, "fame", "desc").map((row) => [row.character.nickname, row.rank]));
}

function comparable(current: RankingSnapshot, other: RankingSnapshot | null) {
  if (!other) return false;
  return (
    other.players.exhaustive === current.players.exhaustive &&
    other.players.reason === current.players.reason &&
    other.players.characters.length === current.players.characters.length
  );
}

export function progressFor(current: RankingSnapshot, history: readonly RankingSnapshot[]) {
  const yesterday = shiftBusinessDate(current.businessDate, -1);
  const weekCut = shiftBusinessDate(current.businessDate, -7);
  const weekFloor = shiftBusinessDate(current.businessDate, -8);
  const previous = history.find((snapshot) => snapshot.businessDate === yesterday) ?? null;
  const week =
    [...history].reverse().find((snapshot) => snapshot.businessDate <= weekCut && snapshot.businessDate >= weekFloor) ??
    null;
  const previousByName = new Map(previous?.players.characters.map((character) => [character.nickname, character]) ?? []);
  const weekByName = new Map(week?.players.characters.map((character) => [character.nickname, character]) ?? []);
  const rankComparable = comparable(current, previous);
  const currentRanks = rankComparable ? fameRanks(current.players.characters) : null;
  const previousRanks = rankComparable && previous ? fameRanks(previous.players.characters) : null;
  const record: Record<string, Progress> = {};

  for (const character of current.players.characters) {
    const day = previousByName.get(character.nickname);
    const weekCharacter = weekByName.get(character.nickname);
    const currentRank = currentRanks?.get(character.nickname) ?? null;
    const previousRank = previousRanks?.get(character.nickname) ?? null;
    record[character.nickname] = {
      fameDeltaDay: day ? delta(character.fame, day.fame) : null,
      fameDeltaWeek: weekCharacter ? delta(character.fame, weekCharacter.fame) : null,
      rankDeltaDay: currentRank !== null && previousRank !== null ? previousRank - currentRank : null,
    };
  }
  return record;
}
