import { osrConfig } from "@/features/osr/config.ts";
import { isFresh, readLatestSnapshot } from "@/features/osr/storage.ts";

const statisticIds = ["members", "ranking", "totalFame", "monthlyFame"] as const;

export type StatisticId = (typeof statisticIds)[number];
export type StatisticSource = "snapshot" | "unavailable";

export type BrigadeStatistic = {
  id: StatisticId;
  value: number | null;
  available: boolean;
  source: StatisticSource;
};

export type BrigadeStatisticsView = {
  recordedOn: string | null;
  sourceUrl: string;
  nation: string | null;
  stale: boolean;
  items: BrigadeStatistic[];
};

export async function getBrigadeStatistics(): Promise<BrigadeStatisticsView> {
  const snapshot = await readLatestSnapshot();
  const brigade = snapshot?.brigade ?? null;
  const figures: Record<StatisticId, number | null> = {
    members: brigade?.members ?? null,
    ranking: brigade?.rank ?? null,
    totalFame: brigade?.totalFame ?? null,
    monthlyFame: brigade?.monthlyFame ?? null,
  };

  return {
    recordedOn: snapshot?.collectedAt ?? null,
    sourceUrl: brigade?.sourceUrl ?? osrConfig.brigadeUrl,
    nation: brigade?.nation ?? null,
    stale: snapshot ? !isFresh(snapshot) : false,
    items: statisticIds.map((id) => {
      const value = figures[id];
      const available = typeof value === "number";
      return {
        id,
        value: available ? value : null,
        available,
        source: available ? "snapshot" : "unavailable",
      };
    }),
  };
}
