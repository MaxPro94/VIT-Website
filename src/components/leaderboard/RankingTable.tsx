"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { officers } from "@/config/officers";
import type { MetricId } from "@/features/osr/config";
import type { Progress } from "@/features/leaderboard/progress";
import type { RankedRow } from "@/features/leaderboard/rank";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { GearMark } from "@/components/leaderboard/GearMark";
import { cn } from "@/lib/cn";

const metal = ["", "#C9A227", "#C6C6C2", "#8C6239"] as const;

function roleFor(nickname: string) {
  return (
    officers.find((officer) => officer.name.localeCompare(nickname, undefined, { sensitivity: "accent" }) === 0)?.role ??
    null
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted">—</span>;
  if (value === 0) return <span className="text-muted tabular-nums">0</span>;
  const up = value > 0;
  return <span className={cn("tabular-nums", up ? "text-gold" : "text-muted")}>{up ? `+${value}` : value}</span>;
}

export function RankingTable({
  rows,
  metric,
  order,
  max,
  progress,
  showNation,
  showDay,
  showWeek,
  showRankDelta,
  format,
  onSort,
}: {
  rows: RankedRow[];
  metric: MetricId;
  order: "asc" | "desc";
  max: number;
  progress: Record<string, Progress>;
  showNation: boolean;
  showDay: boolean;
  showWeek: boolean;
  showRankDelta: boolean;
  format: (value: number | null) => string;
  onSort: (metric: MetricId) => void;
}) {
  const t = useTranslations("leaderboard");
  const roles = useTranslations("officers.roles");
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-pilot]", {
        autoAlpha: 0,
        y: 8,
        stagger: 0.025,
        duration: 0.35,
        ease: "power2.out",
      });
    },
    { scope: root },
  );

  const columns: MetricId[] = ["level", "fame", "monthly", "win", "lose"];

  function header(id: MetricId, label: string) {
    const active = metric === id;
    return (
      <th className="px-3 py-2 text-right font-normal" aria-sort={active ? (order === "asc" ? "ascending" : "descending") : "none"}>
        <button
          type="button"
          onClick={() => onSort(id)}
          className={cn(
            "inline-flex min-h-11 items-center gap-1 tracking-[0.14em] uppercase md:min-h-0",
            active ? "text-foreground" : "text-muted hover:text-foreground",
          )}
        >
          {label}
          {active ? <span className="text-gold">{order === "desc" ? "↓" : "↑"}</span> : null}
        </button>
      </th>
    );
  }

  return (
    <div ref={root} className="mt-8 overflow-x-auto border-t border-line">
      <table className="board-table w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
        <caption className="sr-only">{t("title")}</caption>
        <thead className="text-[0.66rem] text-muted">
          <tr>
            <th className="sticky left-0 z-10 w-12 bg-background px-2 py-2 text-right font-normal tracking-[0.14em] uppercase">{t("columns.rank")}</th>
            <th className="sticky left-12 z-10 bg-background px-3 py-2 text-left font-normal tracking-[0.14em] uppercase">{t("columns.pilot")}</th>
            {showNation ? <th className="px-3 py-2 text-left font-normal tracking-[0.14em] uppercase">{t("columns.nation")}</th> : null}
            <th className="px-3 py-2 text-left font-normal tracking-[0.14em] uppercase">{t("columns.gear")}</th>
            {header("level", t("columns.level"))}
            {header("fame", t("columns.fame"))}
            {header("monthly", "Monthly")}
            {header("win", t("sorts.win"))}
            {header("lose", "Lose")}
            {showDay ? <th className="px-3 py-2 text-right font-normal tracking-[0.14em] uppercase">{t("columns.day")}</th> : null}
            {showWeek ? <th className="px-3 py-2 text-right font-normal tracking-[0.14em] uppercase">{t("columns.week")}</th> : null}
            {showRankDelta ? <th className="px-3 py-2 text-right font-normal tracking-[0.14em] uppercase">{t("columns.rankDelta")}</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const role = roleFor(row.character.nickname);
            const highlight = metric !== "lose" && row.rank !== null && row.rank <= 3;
            const delta = progress[row.character.nickname];
            return (
              <tr
                key={row.character.nickname}
                data-pilot
                data-flip-id={row.character.nickname}
                className={cn(
                  "group border-t border-line",
                  highlight && row.rank === 1 && "shadow-[inset_2px_0_0_#C9A227]",
                  highlight && row.rank === 2 && "shadow-[inset_2px_0_0_#B7B7B2]",
                  highlight && row.rank === 3 && "shadow-[inset_2px_0_0_#8C6239]",
                )}
              >
                <td
                  className="sticky left-0 z-10 w-12 bg-background px-2 py-2 text-right font-display text-base tabular-nums"
                  style={{ color: highlight && row.rank ? metal[row.rank] : undefined }}
                >
                  {row.rank ?? "—"}
                </td>
                <td className="sticky left-12 z-10 bg-background px-3 py-2 whitespace-nowrap">
                  <span className="font-display text-base tracking-[-0.03em]">{row.character.nickname}</span>
                  {role ? (
                    <span className="ml-2 align-middle text-[0.62rem] tracking-[0.14em] text-gold uppercase">{roles(role)}</span>
                  ) : null}
                </td>
                {showNation ? <td className="px-3 py-2.5 text-muted">{row.character.nation}</td> : null}
                <td className="px-3 py-2">
                  <GearMark gear={row.character.gear} />
                </td>
                {columns.map((id) => {
                  const value = row.character[id];
                  const active = metric === id && value !== null && max > 0;
                  return (
                    <td key={id} className="px-3 py-2 text-right tabular-nums">
                      <span className="block">{format(value)}</span>
                      {active ? (
                        <span className="ml-auto mt-1 block h-0.5 w-14 bg-line">
                          <span className="block h-full bg-gold" style={{ width: `${Math.max(8, (value / max) * 100)}%` }} />
                        </span>
                      ) : null}
                    </td>
                  );
                })}
                {showDay ? <td className="px-3 py-2.5 text-right"><Delta value={delta?.fameDeltaDay ?? null} /></td> : null}
                {showWeek ? <td className="px-3 py-2.5 text-right"><Delta value={delta?.fameDeltaWeek ?? null} /></td> : null}
                {showRankDelta ? <td className="px-3 py-2.5 text-right"><Delta value={delta?.rankDeltaDay ?? null} /></td> : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
