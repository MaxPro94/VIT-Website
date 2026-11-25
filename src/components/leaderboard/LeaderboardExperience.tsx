"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Flip } from "gsap/Flip";
import type { Distinction } from "@/features/leaderboard/distinctions";
import type { Progress } from "@/features/leaderboard/progress";
import { filterGear, podiumRows, rankRows } from "@/features/leaderboard/rank";
import { leaderboardHref, type LeaderboardQuery } from "@/features/leaderboard/query";
import { osrConfig } from "@/features/osr/config";
import type { RankingSnapshot } from "@/features/osr/snapshot";
import { useRouter } from "@/i18n/navigation";
import { safeHttpsUrl } from "@/lib/external";
import { gsap, prefersReducedMotion, prefersSimpleMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { Distinctions } from "@/components/leaderboard/Distinctions";
import { GearMark } from "@/components/leaderboard/GearMark";
import { Podium } from "@/components/leaderboard/Podium";
import { RankingTable } from "@/components/leaderboard/RankingTable";

const gears = ["all", "A", "B", "I", "M"] as const;
const sorts = ["fame", "monthly", "win", "lose", "level"] as const;

gsap.registerPlugin(Flip);

function formatStat(value: number | null, locale: string) {
  if (value === null) return "—";
  return new Intl.NumberFormat(locale).format(value);
}

function StatValue({ value, locale }: { value: number | null; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const text = formatStat(value, locale);
  useGSAP(
    () => {
      const element = ref.current;
      if (!element || value === null || prefersReducedMotion()) return;
      const state = { current: 0 };
      element.textContent = formatStat(0, locale);
      gsap.to(state, {
        current: value,
        duration: prefersSimpleMotion() ? 0.6 : 1.05,
        ease: "power2.out",
        onUpdate: () => {
          element.textContent = formatStat(Math.round(state.current), locale);
        },
      });
    },
    { scope: ref },
  );
  return (
    <span ref={ref} className="tabular-nums">
      {text}
    </span>
  );
}

export function LeaderboardExperience({
  snapshot,
  initialQuery,
  progress,
  distinctions,
  fresh,
}: {
  snapshot: RankingSnapshot | null;
  initialQuery: LeaderboardQuery;
  progress: Record<string, Progress>;
  distinctions: Distinction[] | null;
  fresh: boolean;
}) {
  const t = useTranslations("leaderboard");
  const locale = useLocale();
  const router = useRouter();
  const hero = useRef<HTMLElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const replaceTimer = useRef<number | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const format = (value: number | null) => formatStat(value, locale);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const simple = prefersSimpleMotion();
      gsap.from("[data-reveal]", {
        yPercent: 110,
        duration: simple ? 0.55 : 0.8,
        stagger: 0.06,
        ease: "power3.out",
      });
      gsap.from("[data-stat]", {
        autoAlpha: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.45,
        delay: 0.15,
        ease: "power2.out",
      });
    },
    { scope: hero },
  );

  useLayoutEffect(() => {
    const state = flipStateRef.current;
    if (!state) return;
    flipStateRef.current = null;
    if (prefersReducedMotion()) return;
    Flip.from(state, {
      duration: prefersSimpleMotion() ? 0.25 : 0.42,
      ease: "power2.inOut",
      absolute: false,
    });
  });

  function commit(next: LeaderboardQuery, animate: boolean) {
    if (animate && !prefersReducedMotion()) {
      flipStateRef.current = Flip.getState("[data-pilot]");
    } else {
      flipStateRef.current = null;
    }
    setQuery(next);
    if (replaceTimer.current) window.clearTimeout(replaceTimer.current);
    replaceTimer.current = window.setTimeout(() => {
      router.replace(leaderboardHref(next), { scroll: false });
    }, animate ? 0 : 160);
  }

  const recorded = snapshot
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: osrConfig.timeZone,
      }).format(new Date(snapshot.collectedAt))
    : null;
  const characters = snapshot?.players.characters ?? [];
  const pool = filterGear(characters, query.gear);
  const ranked = rankRows(pool, query.sort, query.order);
  const needle = query.q.toLocaleLowerCase(locale);
  const visible = needle
    ? ranked.filter((row) => row.character.nickname.toLocaleLowerCase(locale).includes(needle))
    : ranked;
  const podium = podiumRows(ranked, query.sort);
  const nations = [...new Set(characters.map((character) => character.nation).filter(Boolean))];
  const max = ranked.reduce((best, row) => (row.value !== null && row.value > best ? row.value : best), 0);
  const showDay = Object.values(progress).some((item) => item.fameDeltaDay !== null);
  const showWeek = Object.values(progress).some((item) => item.fameDeltaWeek !== null);
  const showRankDelta = Object.values(progress).some((item) => item.rankDeltaDay !== null);
  const dirty = query.gear !== "all" || query.sort !== "fame" || query.order !== "desc" || query.q !== "";
  const source = safeHttpsUrl(snapshot?.players.sourceUrl ?? osrConfig.playerUrl);
  const members = snapshot?.brigade?.members ?? null;
  const visibleCount = characters.length;
  const coverage = members && members > 0 ? Math.round((visibleCount / members) * 100) : null;
  const gearCounts = characters.reduce(
    (counts, character) => {
      counts[character.gear] += 1;
      return counts;
    },
    { A: 0, B: 0, I: 0, M: 0 },
  );
  let bestGain = 0;
  const bestNames: string[] = [];
  for (const [name, item] of Object.entries(progress)) {
    if (item.fameDeltaDay === null || item.fameDeltaDay <= 0) continue;
    if (item.fameDeltaDay > bestGain) {
      bestGain = item.fameDeltaDay;
      bestNames.splice(0, bestNames.length, name);
    } else if (item.fameDeltaDay === bestGain) {
      bestNames.push(name);
    }
  }
  const historyReady = showDay || showWeek || showRankDelta;

  const stats = snapshot?.brigade
    ? [
        { label: t("stats.rank"), value: snapshot.brigade.rank },
        { label: t("stats.members"), value: snapshot.brigade.members },
        { label: t("stats.fame"), value: snapshot.brigade.totalFame },
        { label: t("stats.nation"), value: null, text: nations.length === 1 ? nations[0] : nations.join(" · ") || "—" },
      ]
    : [];

  return (
    <article className="pt-[4.5rem] pb-16 md:pt-[5.5rem]">
      <Container>
        <header ref={hero}>
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div>
              <p className="font-ornament text-[0.64rem] tracking-[0.28em] text-gold uppercase">{t("eyebrow")}</p>
              <h1 className="mt-1 overflow-hidden font-display text-[clamp(2.15rem,4.2vw,3.5rem)] leading-[0.9] tracking-[-0.05em]">
                <span data-reveal className="block">{t("title")}</span>
              </h1>
              <p className="sr-only">{t("intro")}</p>
            </div>
            {snapshot?.brigade ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                {stats.map((item) => (
                  <div key={item.label} data-stat>
                    <dt className="text-[0.62rem] tracking-[0.14em] text-muted uppercase">{item.label}</dt>
                    <dd className="font-display text-[1.65rem] leading-none tracking-[-0.04em] tabular-nums">
                      {"text" in item && item.text ? item.text : <StatValue value={item.value} locale={locale} />}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          {snapshot?.brigade ? (
            <div className="mt-4 border-t border-line pt-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                <p>{fresh ? t("recorded", { date: recorded ?? "" }) : t("stale", { date: recorded ?? "" })}</p>
                {members !== null ? <p>{t("shortfall", { visible: visibleCount, members })}</p> : null}
                <details className="ml-auto">
                  <summary className="cursor-pointer text-[0.66rem] tracking-[0.14em] uppercase">{t("detail")}</summary>
                  <p className="mt-2 max-w-3xl text-sm leading-6">
                    {t(`coverage.${snapshot.players.reason}`, { visible: visibleCount, members: members ?? 0 })} {t("labels")}
                    {snapshot.players.sources.length > 0 ? ` ${t("boards", { count: snapshot.players.sources.length })}` : ""}
                  </p>
                </details>
              </div>
              {coverage !== null ? (
                <div className="mt-2 h-px bg-line" role="img" aria-label={t("shortfall", { visible: visibleCount, members: members ?? 0 })}>
                  <div className="h-px bg-gold" style={{ width: `${coverage}%` }} />
                </div>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <p className="text-[0.62rem] tracking-[0.14em] text-muted uppercase">{t("gearSplit")}</p>
                <div className="flex h-1 w-28 overflow-hidden bg-line sm:w-40" aria-hidden>
                  {(["I", "B", "A", "M"] as const).map((gear) => (
                    <span
                      key={gear}
                      className={cn(gear === "I" && "bg-gold", gear === "B" && "bg-foreground", gear === "A" && "bg-muted", gear === "M" && "bg-gold-light")}
                      style={{ width: visibleCount ? `${(gearCounts[gear] / visibleCount) * 100}%` : "0%" }}
                    />
                  ))}
                </div>
                {(["I", "B", "A", "M"] as const).map((gear) => (
                  <span key={gear} className="inline-flex items-center gap-1.5 text-[0.66rem] text-muted">
                    <GearMark gear={gear} />
                    <span className="tabular-nums">{gearCounts[gear]}</span>
                  </span>
                ))}
                <p className="text-[0.66rem] text-muted">{t("gearSplitNote")}</p>
              </div>
            </div>
          ) : (
            <p className="mt-6 max-w-2xl border border-line px-5 py-4 text-sm leading-6 text-muted">{t("unavailable")}</p>
          )}
        </header>

        {snapshot?.brigade ? (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {gears.map((gear) => (
                <button
                  key={gear}
                  type="button"
                  aria-pressed={query.gear === gear}
                  onClick={() => commit({ ...query, gear }, true)}
                  className={cn(
                    "inline-flex min-h-11 items-center border px-3 text-[0.68rem] tracking-[0.14em] uppercase transition-colors",
                    query.gear === gear ? "border-foreground bg-foreground text-background" : "border-line text-muted hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {gear === "all" ? t("gears.all") : <GearMark gear={gear} plain={query.gear === gear} className={query.gear === gear ? "text-background" : undefined} />}
                </button>
              ))}
              <span className="mx-1 hidden h-5 w-px bg-line md:block" aria-hidden />
              {sorts.map((sort) => (
                <button
                  key={sort}
                  type="button"
                  aria-pressed={query.sort === sort}
                  onClick={() => commit({ ...query, sort, order: query.sort === sort ? (query.order === "desc" ? "asc" : "desc") : "desc" }, true)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1 px-1 text-[0.68rem] tracking-[0.14em] uppercase",
                    query.sort === sort ? "text-foreground underline decoration-gold decoration-2 underline-offset-[6px]" : "text-muted hover:text-foreground",
                  )}
                >
                  {t(`sorts.${sort}`)}
                  {query.sort === sort ? <span className="text-gold">{query.order === "desc" ? "↓" : "↑"}</span> : null}
                </button>
              ))}
              <label className="ml-auto flex min-w-40 flex-1 sm:max-w-56">
                <span className="sr-only">{t("search")}</span>
                <input
                  value={query.q}
                  onChange={(event) => commit({ ...query, q: event.target.value.slice(0, 40) }, false)}
                  placeholder={t("search")}
                  className="min-h-11 w-full border border-line bg-transparent px-3 text-sm outline-none placeholder:text-muted"
                />
              </label>
              <p className="text-[0.66rem] tracking-[0.12em] text-muted uppercase">{t("results", { count: visible.length })}</p>
              {dirty ? (
                <button type="button" onClick={() => commit({ gear: "all", sort: "fame", order: "desc", q: "" }, true)} className="min-h-11 px-1 text-[0.66rem] tracking-[0.14em] text-muted uppercase hover:text-foreground">
                  {t("reset")}
                </button>
              ) : null}
            </div>

            <Podium
              groups={podium}
              metric={query.sort}
              format={format}
              note={snapshot.players.exhaustive ? null : t("podiumNote")}
            />

            {visible.length === 0 ? (
              <p className="mt-8 text-sm text-muted">{t("empty")}</p>
            ) : (
              <RankingTable
                rows={visible}
                metric={query.sort}
                order={query.order}
                max={max}
                progress={progress}
                showNation={nations.length > 1}
                showDay={showDay}
                showWeek={showWeek}
                showRankDelta={showRankDelta}
                format={format}
                onSort={(sort) =>
                  commit(
                    { ...query, sort, order: query.sort === sort && query.order === "desc" ? "asc" : "desc" },
                    true,
                  )
                }
              />
            )}

            {historyReady && bestNames.length > 0 ? (
              <p className="mt-6 text-sm text-muted">
                {t("bestDay")} · {bestNames.join(" · ")} · +{format(bestGain)}
              </p>
            ) : (
              <p className="mt-6 text-xs text-muted">{t("historyPending")}</p>
            )}

            {distinctions ? <Distinctions items={distinctions} format={format} /> : null}

            {source ? (
              <a href={source} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-11 items-center text-[0.68rem] tracking-[0.16em] text-gold uppercase">
                {t("source")}
              </a>
            ) : null}
          </>
        ) : null}
      </Container>
    </article>
  );
}
