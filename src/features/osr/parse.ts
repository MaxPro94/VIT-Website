import { osrConfig, type GearId } from "./config.ts";

export type ParsedPlayer = {
  nickname: string;
  nation: string;
  gear: GearId;
  level: number | null;
  fame: number | null;
  monthly: number | null;
  win: number | null;
  lose: number | null;
  brigade: string;
};

export type ParsedBrigade = {
  rank: number | null;
  name: string;
  nation: string;
  leader: string;
  averageLevel: number | null;
  members: number | null;
  totalFame: number | null;
  monthlyFame: number | null;
};

const gears = new Set<GearId>(["A", "B", "I", "M"]);

export function parseInteger(value: string): number | null {
  const cleaned = value.replace(/,/g, "").replace(/\s+/g, "").trim();
  if (!/^-?\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}

function textCells(row: string) {
  return [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) =>
    cell[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function gearId(value: string): GearId | null {
  const match = /^([ABIM])-Gear$/i.exec(value.trim());
  if (!match) return null;
  const id = match[1].toUpperCase();
  return gears.has(id as GearId) ? (id as GearId) : null;
}

export function parsePlayers(html: string): ParsedPlayer[] {
  const players: ParsedPlayer[] = [];
  for (const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = textCells(row[1]);
    if (cells.length !== 10) continue;
    const gear = gearId(cells[3]);
    const nickname = cells[1];
    if (!gear || !nickname) continue;
    players.push({
      nickname,
      nation: cells[2],
      gear,
      level: parseInteger(cells[4]),
      fame: parseInteger(cells[5]),
      monthly: parseInteger(cells[6]),
      win: parseInteger(cells[7]),
      lose: parseInteger(cells[8]),
      brigade: cells[9],
    });
  }
  return players;
}

export function parseBrigades(html: string): ParsedBrigade[] {
  const brigades: ParsedBrigade[] = [];
  for (const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = textCells(row[1]);
    if (cells.length !== 8 || !cells[1]) continue;
    brigades.push({
      rank: parseInteger(cells[0]),
      name: cells[1],
      nation: cells[2],
      leader: cells[3],
      averageLevel: parseInteger(cells[4]),
      members: parseInteger(cells[5]),
      totalFame: parseInteger(cells[6]),
      monthlyFame: parseInteger(cells[7]),
    });
  }
  return brigades;
}

export function findBrigade(html: string, name = osrConfig.brigadeName) {
  return parseBrigades(html).find((row) => row.name === name) ?? null;
}

export function playersInBrigade(html: string, name = osrConfig.brigadeName) {
  return parsePlayers(html).filter((player) => player.brigade === name);
}

export function nextPagePath(html: string) {
  const match = html.match(/<a\b[^>]*class="[^"]*\bloadmore\b[^"]*"[^>]*href="([^"]+)"/i);
  return match?.[1].replace(/&amp;/g, "&") ?? null;
}

export function boardUnavailable(html: string) {
  return /ranking data is temporarily unavailable/i.test(html);
}

/** Same nickname keeps the first row. Later boards only fill blank stats and add new names. */
export function mergePlayers(groups: readonly (readonly ParsedPlayer[])[]): ParsedPlayer[] {
  const byName = new Map<string, ParsedPlayer>();
  for (const group of groups) {
    for (const player of group) {
      const current = byName.get(player.nickname);
      if (!current) {
        byName.set(player.nickname, { ...player });
        continue;
      }
      byName.set(player.nickname, {
        ...current,
        nation: current.nation || player.nation,
        level: current.level ?? player.level,
        fame: current.fame ?? player.fame,
        monthly: current.monthly ?? player.monthly,
        win: current.win ?? player.win,
        lose: current.lose ?? player.lose,
      });
    }
  }
  return [...byName.values()];
}
