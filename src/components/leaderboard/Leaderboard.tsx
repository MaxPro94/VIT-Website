import { currentDistinctions } from "@/features/leaderboard/distinctions";
import type { LeaderboardQuery } from "@/features/leaderboard/query";
import { progressFor } from "@/features/leaderboard/progress";
import type { RankingSnapshot } from "@/features/osr/snapshot";
import { isFresh, readRankingHistory } from "@/features/osr/storage";
import { LeaderboardExperience } from "@/components/leaderboard/LeaderboardExperience";

export async function Leaderboard({
  snapshot,
  query,
}: {
  snapshot: RankingSnapshot | null;
  query: LeaderboardQuery;
}) {
  const history = snapshot ? await readRankingHistory() : [];
  const progress = snapshot ? progressFor(snapshot, history) : {};
  const distinctions = snapshot?.brigade ? currentDistinctions(snapshot, history) : null;
  return (
    <LeaderboardExperience
      snapshot={snapshot}
      initialQuery={query}
      progress={progress}
      distinctions={distinctions ? [distinctions.ace, distinctions.duel, distinctions.rising] : null}
      fresh={snapshot ? isFresh(snapshot) : false}
    />
  );
}
