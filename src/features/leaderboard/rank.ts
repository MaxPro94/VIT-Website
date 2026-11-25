import type { GearId, MetricId } from "../osr/config.ts";
import type { RankedCharacter } from "../osr/snapshot.ts";

export type SortOrder = "asc" | "desc";

export type RankedRow = {
  character: RankedCharacter;
  value: number | null;
  rank: number | null;
};

function metricValue(character: RankedCharacter, metric: MetricId) {
  return character[metric];
}

function byIdentity(left: RankedCharacter, right: RankedCharacter) {
  const name = left.nickname.localeCompare(right.nickname, "fr");
  if (name !== 0) return name;
  return left.gear.localeCompare(right.gear);
}

export function rankRows(
  characters: readonly RankedCharacter[],
  metric: MetricId,
  order: SortOrder,
): RankedRow[] {
  const rows = characters.map((character) => ({
    character,
    value: metricValue(character, metric),
    rank: null as number | null,
  }));
  const known = rows.filter((row): row is RankedRow & { value: number } => row.value !== null);
  for (const row of rows) {
    if (row.value === null) continue;
    const value = row.value;
    row.rank = 1 + known.filter((other) => other.value > value).length;
  }
  return rows.sort((left, right) => {
    if (left.value === null && right.value === null) return byIdentity(left.character, right.character);
    if (left.value === null) return 1;
    if (right.value === null) return -1;
    const delta = order === "asc" ? left.value - right.value : right.value - left.value;
    if (delta !== 0) return delta;
    return byIdentity(left.character, right.character);
  });
}

export function podiumRows(rows: readonly RankedRow[], metric: MetricId) {
  if (metric === "lose") return [];
  const places = [...new Set(rows.map((row) => row.rank).filter((rank): rank is number => rank !== null))].sort(
    (left, right) => left - right,
  );
  const shown = places.slice(0, 3);
  return shown.map((rank) => rows.filter((row) => row.rank === rank));
}

export function filterGear(characters: readonly RankedCharacter[], gear: GearId | "all") {
  if (gear === "all") return [...characters];
  return characters.filter((character) => character.gear === gear);
}
