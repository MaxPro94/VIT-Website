"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import type { MetricId } from "@/features/osr/config";
import type { RankedRow } from "@/features/leaderboard/rank";
import { gsap, prefersReducedMotion, prefersSimpleMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { GearMark } from "@/components/leaderboard/GearMark";

const metal = ["", "#C9A227", "#C6C6C2", "#8C6239"] as const;

export function Podium({
  groups,
  metric,
  format,
  note,
}: {
  groups: RankedRow[][];
  metric: MetricId;
  format: (value: number | null) => string;
  note: string | null;
}) {
  const t = useTranslations("leaderboard");
  const root = useRef<HTMLElement>(null);
  const entered = useRef(false);
  const signature = `${metric}:${groups.map((group) => group.map((row) => row.character.nickname).join(",")).join("|")}`;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const simple = prefersSimpleMotion();
      if (!entered.current) {
        entered.current = true;
        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline
          .from("[data-place]", {
            y: simple ? 16 : 40,
            autoAlpha: 0,
            stagger: 0.1,
            duration: simple ? 0.32 : 0.48,
          })
          .from("[data-podium-rank]", { y: 8, autoAlpha: 0, stagger: 0.05, duration: 0.24 }, "-=0.22")
          .from("[data-podium-name]", { yPercent: 70, autoAlpha: 0, stagger: 0.06, duration: 0.32 }, "<");
      } else {
        gsap.from("[data-podium-name]", { y: 12, autoAlpha: 0, duration: 0.28, stagger: 0.04, ease: "power2.out" });
      }
      root.current?.querySelectorAll<HTMLElement>("[data-podium-value]").forEach((element) => {
        const target = Number(element.dataset.value);
        if (!Number.isFinite(target)) return;
        const state = { current: 0 };
        gsap.to(state, {
          current: target,
          duration: simple ? 0.4 : 0.65,
          ease: "power2.out",
          onUpdate: () => {
            element.textContent = format(Math.round(state.current));
          },
        });
      });
    },
    { scope: root, dependencies: [signature] },
  );

  if (metric === "lose") {
    return <p className="mt-4 text-sm text-muted">{t("losePodium")}</p>;
  }
  if (groups.length === 0) {
    return <p className="mt-4 text-sm text-muted">{t("podiumEmpty")}</p>;
  }

  const slots = groups.map((group, index) => ({ index, group })).filter((slot) => slot.group[0]);

  return (
    <section ref={root} aria-labelledby="podium-title" className="mt-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="podium-title" className="font-display text-xl tracking-[-0.04em] md:text-2xl">
          {t("podiumTitle")}
        </h2>
        <p className="text-[0.66rem] tracking-[0.16em] text-gold uppercase">{t("podiumBy", { metric: t(`sorts.${metric}`) })}</p>
      </div>
      <ol className="mt-3 grid grid-cols-2 items-end gap-2 md:flex md:gap-3">
        {slots.map(({ index, group }) => {
          const place = index + 1;
          const lead = group[0];
          return (
            <li
              key={place}
              data-place
              className={cn(
                "relative flex flex-col border border-line px-4 py-4 md:px-5",
                place === 1 && "order-1 col-span-2 min-h-44 border-gold/40 bg-surface md:order-2 md:min-h-[17.5rem] md:flex-[1.2] md:py-5",
                place === 2 && "order-2 min-h-36 bg-background-secondary md:order-1 md:min-h-[14rem] md:flex-1",
                place === 3 && "order-3 min-h-32 bg-background-secondary md:min-h-[12rem] md:flex-1",
              )}
            >
              <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: metal[place] ?? metal[3] }} />
              {place === 1 ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-28"
                  style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.2), transparent 70%)" }}
                />
              ) : null}
              <p data-podium-rank className="relative font-display text-sm tracking-[0.22em] tabular-nums" style={{ color: metal[place] }}>
                {String(lead.rank ?? place).padStart(2, "0")}
              </p>
              <div className="relative mt-3 space-y-3">
                {group.map((row) => (
                  <div key={row.character.nickname} data-podium-pilot={row.character.nickname}>
                    {/* Reserved for a future transparent gear capture. Empty until a real asset exists. */}
                    <span data-gear-art={row.character.gear} className="hidden" />
                    <div className="overflow-hidden">
                      <p
                        data-podium-name
                        className={cn(
                          "font-display leading-[0.92] tracking-[-0.045em]",
                          place === 1 ? "text-[2rem] md:text-[2.7rem]" : "text-[1.45rem] md:text-[1.7rem]",
                        )}
                      >
                        {row.character.nickname}
                      </p>
                    </div>
                    <GearMark gear={row.character.gear} className="mt-2" />
                  </div>
                ))}
              </div>
              <p
                data-podium-value
                data-value={lead.value ?? undefined}
                className={cn(
                  "relative mt-auto pt-5 font-display text-gold tabular-nums",
                  place === 1 ? "text-3xl md:text-4xl" : "text-2xl",
                )}
              >
                {format(lead.value)}
              </p>
            </li>
          );
        })}
      </ol>
      {note ? <p className="mt-2 text-xs leading-5 text-muted">{note}</p> : null}
    </section>
  );
}
