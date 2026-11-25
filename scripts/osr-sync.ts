import { syncPublicRanking } from "../src/features/osr/sync.ts";

const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");

const result = await syncPublicRanking({ force, dryRun });
const { snapshot } = result;
const members = snapshot.brigade?.members ?? null;
console.log(
  [
    result.status,
    snapshot.businessDate,
    `brigade ${snapshot.brigade?.rank ?? "-"}`,
    `members ${members ?? "-"}`,
    `visible ${snapshot.players.characters.length}`,
    `exhaustive ${snapshot.players.exhaustive}`,
    snapshot.players.reason,
  ].join(" | "),
);
