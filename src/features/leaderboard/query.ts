import { gearIds, metricIds, type GearId, type MetricId } from "../osr/config.ts";
import type { SortOrder } from "./rank.ts";

export type LeaderboardQuery = {
  gear: GearId | "all";
  sort: MetricId;
  order: SortOrder;
  q: string;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseLeaderboardQuery(
  input: Record<string, string | string[] | undefined>,
): LeaderboardQuery {
  const gearRaw = one(input.gear)?.toUpperCase();
  const sortRaw = one(input.sort);
  const orderRaw = one(input.order);
  const gear = gearIds.find((id) => id === gearRaw) ?? "all";
  const sort = metricIds.find((id) => id === sortRaw) ?? "fame";
  const order = orderRaw === "asc" || orderRaw === "desc" ? orderRaw : "desc";
  const q = (one(input.q) ?? "").trim().slice(0, 40);
  return { gear, sort, order, q };
}

export function leaderboardHref(query: LeaderboardQuery, patch: Partial<LeaderboardQuery> = {}) {
  const next = { ...query, ...patch };
  const params = new URLSearchParams();
  if (next.gear !== "all") params.set("gear", next.gear);
  if (next.sort !== "fame") params.set("sort", next.sort);
  if (next.order !== "desc") params.set("order", next.order);
  if (next.q) params.set("q", next.q);
  const search = params.toString();
  return search ? `/leaderboard?${search}` : "/leaderboard";
}
