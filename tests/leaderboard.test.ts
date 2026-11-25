import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { currentDistinctions, archivedDistinctions } from "../src/features/leaderboard/distinctions.ts";
import { progressFor } from "../src/features/leaderboard/progress.ts";
import { podiumRows, rankRows } from "../src/features/leaderboard/rank.ts";
import { parseLeaderboardQuery } from "../src/features/leaderboard/query.ts";
import { parseInteger, parsePlayers, nextPagePath } from "../src/features/osr/parse.ts";
import { buildSnapshot } from "../src/features/osr/snapshot.ts";
import { publishSnapshot, readLatestSnapshot } from "../src/features/osr/storage.ts";

const playerRow = (cells: string[]) => `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`;

function board(rows: string[][], more: string | null = null) {
  const table = `<table>${rows.map(playerRow).join("")}</table>`;
  const link = more ? `<a class="gpill loadmore rfilter" href="${more}">more</a>` : "";
  return table + link;
}

const brigadeHtml = board([
  ["10", "VatallusInfusedTemplars", "BCU", "Kirbozz", "100", "2", "1,000", "40"],
]);

test("parses grouped thousands and keeps zero distinct from a blank", () => {
  assert.equal(parseInteger("1,778"), 1778);
  assert.equal(parseInteger(""), null);
  assert.equal(parseInteger("0"), 0);
  const html = board([
    ["1", "Ace", "BCU", "I-Gear", "10", "1,200", "", "0", "3", "VatallusInfusedTemplars"],
    ["header", "only"],
  ]);
  const [player] = parsePlayers(html);
  assert.equal(player.fame, 1200);
  assert.equal(player.monthly, null);
  assert.equal(player.win, 0);
  assert.equal(nextPagePath(html + `<a class="gpill loadmore" href="/?p=ranking&amp;limit=100">x</a>`), "/?p=ranking&limit=100");
});

test("does not treat a short public list as the full roster", () => {
  const players = board([
    ["1", "Ace", "BCU", "I-Gear", "10", "100", "1", "2", "3", "VatallusInfusedTemplars"],
    ["2", "Other", "ANI", "B-Gear", "10", "90", "1", "2", "3", "Elsewhere"],
  ]);
  const snapshot = buildSnapshot({
    playersHtml: players,
    brigadeHtml: board([["10", "VatallusInfusedTemplars", "BCU", "Kirbozz", "100", "39", "1000", "40"]]),
    collectedAt: new Date("2026-11-25T12:00:00.000Z"),
  });
  assert.equal(snapshot.players.characters.length, 1);
  assert.equal(snapshot.players.exhaustive, false);
  assert.equal(snapshot.players.reason, "public-list-shorter-than-roster");
  assert.equal(snapshot.brigade?.members, 39);
});

test("marks a matching finished roster exhaustive", () => {
  const players = board([
    ["1", "Ace", "BCU", "I-Gear", "10", "100", "1", "2", "3", "VatallusInfusedTemplars"],
    ["2", "Second", "BCU", "M-Gear", "9", "80", "0", "1", "1", "VatallusInfusedTemplars"],
  ]);
  const snapshot = buildSnapshot({ playersHtml: players, brigadeHtml, collectedAt: new Date("2026-11-25T12:00:00.000Z") });
  assert.equal(snapshot.players.exhaustive, true);
});

test("ranks ties by the higher value and keeps search out of the rank", () => {
  const rows = rankRows(
    [
      { nickname: "B", nation: "BCU", gear: "I", level: 1, fame: 10, monthly: 0, win: 1, lose: 0 },
      { nickname: "A", nation: "BCU", gear: "I", level: 1, fame: 10, monthly: 0, win: 1, lose: 0 },
      { nickname: "C", nation: "BCU", gear: "B", level: 1, fame: null, monthly: 0, win: 1, lose: 0 },
    ],
    "fame",
    "desc",
  );
  assert.deepEqual(
    rows.map((row) => [row.character.nickname, row.rank]),
    [
      ["A", 1],
      ["B", 1],
      ["C", null],
    ],
  );
});

test("rejects an unknown sort and falls back to fame descending", () => {
  const query = parseLeaderboardQuery({ sort: "kd", order: "sideways", gear: "z", q: "  Ace  " });
  assert.deepEqual(query, { gear: "all", sort: "fame", order: "desc", q: "Ace" });
});

test("publishes a snapshot atomically and reads it back", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "vit-osr-"));
  process.env.OSR_DATA_DIR = dir;
  const snapshot = buildSnapshot({
    playersHtml: board([
      ["1", "Ace", "BCU", "I-Gear", "10", "100", "1", "2", "3", "VatallusInfusedTemplars"],
      ["2", "Second", "BCU", "M-Gear", "9", "80", "0", "1", "1", "VatallusInfusedTemplars"],
    ]),
    brigadeHtml,
    collectedAt: new Date("2026-11-25T12:00:00.000Z"),
  });
  await publishSnapshot(snapshot);
  const read = await readLatestSnapshot();
  assert.equal(read?.players.characters[0]?.nickname, "Ace");
  const raw = await readFile(path.join(dir, "latest.json"), "utf8");
  assert.equal(raw.trimEnd().endsWith("}"), true);
  await rm(dir, { recursive: true, force: true });
  delete process.env.OSR_DATA_DIR;
});

test("merges boards, keeps the first row and ignores an unavailable board", () => {
  const snapshot = buildSnapshot({
    boards: [
      {
        html: board([["1", "Ace", "BCU", "I-Gear", "10", "100", "5", "2", "3", "VatallusInfusedTemplars"]]),
        sourceUrl: "https://oldschoolrivals.com/?sort=fame",
      },
      {
        html: board([
          ["4", "New", "BCU", "M-Gear", "9", "40", "1", "9", "1", "VatallusInfusedTemplars"],
          ["1", "Ace", "BCU", "B-Gear", "10", "999", "8", "2", "3", "VatallusInfusedTemplars"],
        ]),
        sourceUrl: "https://oldschoolrivals.com/?sort=win",
      },
      { html: "Ranking data is temporarily unavailable", sourceUrl: "https://oldschoolrivals.com/?sort=level" },
    ],
    brigadeHtml: board([["10", "VatallusInfusedTemplars", "BCU", "Kirbozz", "100", "39", "1000", "40"]]),
    collectedAt: new Date("2026-11-25T12:00:00.000Z"),
  });
  const ace = snapshot.players.characters.find((character) => character.nickname === "Ace");
  assert.equal(ace?.gear, "I");
  assert.equal(ace?.fame, 100);
  assert.deepEqual(snapshot.players.characters.map((character) => character.nickname).sort(), ["Ace", "New"]);
  assert.equal(snapshot.players.sources.length, 2);
  assert.equal(snapshot.players.exhaustive, false);
});

test("keeps fame deltas and drops rank deltas when coverage differs", () => {
  const brigade = board([["10", "VatallusInfusedTemplars", "BCU", "Kirbozz", "100", "2", "1000", "40"]]);
  const previous = buildSnapshot({
    playersHtml: board([
      ["1", "Ace", "BCU", "I-Gear", "10", "100", "4", "1", "1", "VatallusInfusedTemplars"],
      ["2", "Second", "BCU", "M-Gear", "9", "80", "1", "1", "1", "VatallusInfusedTemplars"],
    ]),
    brigadeHtml: brigade,
    collectedAt: new Date("2026-11-24T12:00:00.000Z"),
  });
  const current = buildSnapshot({
    playersHtml: board([["1", "Ace", "BCU", "I-Gear", "10", "130", "9", "1", "1", "VatallusInfusedTemplars"]]),
    brigadeHtml: brigade,
    collectedAt: new Date("2026-11-25T12:00:00.000Z"),
  });
  const progress = progressFor(current, [previous]);
  assert.equal(progress.Ace?.fameDeltaDay, 30);
  assert.equal(progress.Ace?.rankDeltaDay, null);
  assert.equal(progress.Ace?.fameDeltaWeek, null);
});

test("awards a provisional ace and withholds duel and rising star", () => {
  const snapshot = buildSnapshot({
    playersHtml: board([
      ["1", "Ace", "BCU", "I-Gear", "10", "100", "9", "1", "1", "VatallusInfusedTemplars"],
      ["2", "Tie", "BCU", "B-Gear", "10", "90", "9", "1", "1", "VatallusInfusedTemplars"],
      ["3", "Zero", "BCU", "M-Gear", "10", "80", "0", "1", "1", "VatallusInfusedTemplars"],
    ]),
    brigadeHtml,
    collectedAt: new Date("2026-11-25T12:00:00.000Z"),
  });
  const distinctions = currentDistinctions(snapshot, []);
  assert.deepEqual(distinctions.ace.names.sort(), ["Ace", "Tie"]);
  assert.equal(distinctions.ace.status, "provisional");
  assert.equal(distinctions.duel.reason, "period-incomplete");
  assert.equal(distinctions.rising.reason, "period-incomplete");
  assert.deepEqual(archivedDistinctions(), []);
  assert.deepEqual(podiumRows(rankRows(snapshot.players.characters, "lose", "asc"), "lose"), []);
});

test("awards duel master from the largest win gain in the open month", () => {
  const previous = buildSnapshot({
    playersHtml: board([
      ["1", "Ace", "BCU", "I-Gear", "10", "100", "4", "2", "1", "VatallusInfusedTemplars"],
      ["2", "Second", "BCU", "M-Gear", "9", "80", "1", "5", "1", "VatallusInfusedTemplars"],
    ]),
    brigadeHtml,
    collectedAt: new Date("2026-11-24T12:00:00.000Z"),
  });
  const current = buildSnapshot({
    playersHtml: board([
      ["1", "Ace", "BCU", "I-Gear", "10", "100", "4", "8", "1", "VatallusInfusedTemplars"],
      ["2", "Second", "BCU", "M-Gear", "9", "80", "1", "6", "1", "VatallusInfusedTemplars"],
    ]),
    brigadeHtml,
    collectedAt: new Date("2026-11-25T12:00:00.000Z"),
  });
  const distinctions = currentDistinctions(current, [previous]);
  assert.deepEqual(distinctions.duel.names, ["Ace"]);
  assert.equal(distinctions.duel.value, 6);
  assert.equal(distinctions.duel.status, "provisional");
  assert.equal(distinctions.duel.reason, "ok");
});
