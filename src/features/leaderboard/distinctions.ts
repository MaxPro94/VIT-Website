import type { RankingSnapshot } from "../osr/snapshot.ts";

export type DistinctionId = "ace" | "duel" | "rising";
export type DistinctionStatus = "provisional" | "unavailable";
export type DistinctionReason = "ok" | "partial" | "win-unconfirmed" | "period-incomplete" | "no-positive";

export type Distinction = {
  id: DistinctionId;
  status: DistinctionStatus;
  names: string[];
  value: number | null;
  reason: DistinctionReason;
};

function unavailable(id: DistinctionId, reason: DistinctionReason): Distinction {
  return { id, status: "unavailable", names: [], value: null, reason };
}

/**
 * Ace of the Month uses the public Monthly column. It stays provisional:
 * OSR has not documented when that column resets, and a closed month needs
 * a snapshot on both sides of the boundary. Win is the career total of duels
 * won. Duel Master is the largest Win gain inside the civil month, and it
 * stays unawarded until an earlier snapshot of that month exists. Rising
 * Star is the Fame gain over the same month, never a copy of Monthly.
 */
export function currentDistinctions(snapshot: RankingSnapshot, history: readonly RankingSnapshot[]) {
  const characters = snapshot.players.characters;
  const scored = characters.filter((character) => character.monthly !== null && character.monthly > 0);
  const bestMonthly = scored.reduce((best, character) => Math.max(best, character.monthly ?? 0), 0);
  const ace: Distinction =
    bestMonthly > 0
      ? {
          id: "ace",
          status: "provisional",
          names: scored.filter((character) => character.monthly === bestMonthly).map((character) => character.nickname),
          value: bestMonthly,
          reason: snapshot.players.exhaustive ? "ok" : "partial",
        }
      : unavailable("ace", "no-positive");

  const month = snapshot.businessDate.slice(0, 7);
  const baseline = history.find(
    (item) => item.businessDate.startsWith(month) && item.businessDate < snapshot.businessDate,
  );
  const gainAward = (id: "duel" | "rising", field: "win" | "fame"): Distinction => {
    if (!baseline) return unavailable(id, "period-incomplete");
    const gains = characters.flatMap((character) => {
      const then = baseline.players.characters.find((item) => item.nickname === character.nickname);
      const now = character[field];
      const before = then?.[field];
      if (now === null || now === undefined || before === null || before === undefined) return [];
      const gain = now - before;
      return gain > 0 ? [{ name: character.nickname, gain }] : [];
    });
    const bestGain = gains.reduce((best, item) => Math.max(best, item.gain), 0);
    if (bestGain <= 0) return unavailable(id, "no-positive");
    return {
      id,
      status: "provisional",
      names: gains.filter((item) => item.gain === bestGain).map((item) => item.name),
      value: bestGain,
      reason: snapshot.players.exhaustive && baseline.players.characters.length === characters.length ? "ok" : "partial",
    };
  };

  return { ace, duel: gainAward("duel", "win"), rising: gainAward("rising", "fame") };
}

/** No archived award until a month is bounded and the Monthly reset is known. */
export function archivedDistinctions() {
  return [] as const;
}
