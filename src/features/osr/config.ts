export const osrConfig = {
  origin: "https://oldschoolrivals.com",
  brigadeName: "VatallusInfusedTemplars",
  playerUrl:
    "https://oldschoolrivals.com/?p=ranking&tab=players&sort=fame&gear=all&nation=all&limit=250",
  brigadeUrl:
    "https://oldschoolrivals.com/?p=ranking&tab=brig&sort=total&gear=all&nation=all",
  freshnessMs: 26 * 60 * 60 * 1000,
  timeZone: "Europe/Paris",
} as const;

export const gearIds = ["A", "B", "I", "M"] as const;
export type GearId = (typeof gearIds)[number];

export const metricIds = ["fame", "monthly", "win", "lose", "level"] as const;
export type MetricId = (typeof metricIds)[number];

export type PublicBoard = {
  sort: "fame" | "monthly" | "win" | "lose";
  gear: "all" | "a" | "b" | "i" | "m";
  nation: "all" | "bcu" | "ani";
};

/** Public boards that can be read without an account. Nation filters are sources, not a roster rule. */
export const coverageBoards: readonly PublicBoard[] = [
  { sort: "fame", gear: "all", nation: "all" },
  { sort: "monthly", gear: "all", nation: "all" },
  { sort: "win", gear: "all", nation: "all" },
  { sort: "lose", gear: "all", nation: "all" },
  { sort: "fame", gear: "a", nation: "bcu" },
  { sort: "fame", gear: "b", nation: "bcu" },
  { sort: "fame", gear: "i", nation: "bcu" },
  { sort: "fame", gear: "m", nation: "bcu" },
  { sort: "fame", gear: "a", nation: "ani" },
  { sort: "fame", gear: "b", nation: "ani" },
  { sort: "fame", gear: "i", nation: "ani" },
  { sort: "fame", gear: "m", nation: "ani" },
];

export function playerBoardUrl(board: PublicBoard) {
  const params = new URLSearchParams({
    p: "ranking",
    tab: "players",
    sort: board.sort,
    gear: board.gear,
    nation: board.nation,
    limit: "250",
  });
  return `${osrConfig.origin}/?${params.toString()}`;
}

export function businessDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: osrConfig.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
