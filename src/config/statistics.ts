/**
 * Historical manual reading of the public brigade ranking, 25 November 2026.
 * The live homepage reads `data/osr/latest.json` instead of these figures.
 */
export const statisticsSnapshot = {
  recordedOn: "2026-11-25",
  sourceUrl: "https://oldschoolrivals.com/?p=ranking&tab=brig&sort=total&gear=all&nation=all",
  figures: {
    members: 39,
    ranking: 10,
    totalFame: 33922,
    monthlyFame: 1672,
  },
} as const;

export const manualStatistics = statisticsSnapshot.figures;

export type StatisticId = keyof typeof manualStatistics;
