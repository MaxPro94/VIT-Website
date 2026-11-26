"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import type { Distinction } from "@/features/leaderboard/distinctions";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

export function Distinctions({
  items,
  format,
}: {
  items: Distinction[];
  format: (value: number | null) => string;
}) {
  const t = useTranslations("leaderboard");
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-award]", {
        autoAlpha: 0,
        y: 18,
        stagger: 0.08,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: root.current, start: "top 82%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="mt-16 border-t border-line pt-10" aria-labelledby="distinctions-title">
      <p className="font-ornament text-[0.68rem] tracking-[0.22em] text-gold uppercase">{t("distinctions.eyebrow")}</p>
      <h2 id="distinctions-title" className="mt-3 font-display text-3xl tracking-[-0.04em] md:text-4xl">
        {t("distinctions.title")}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{t("distinctions.lead")}</p>
      <ol className="mt-6 grid gap-px bg-line md:grid-cols-3">
        {items.map((item) => {
          const awarded = item.status === "provisional" && item.names.length > 0;
          return (
            <li key={item.id} data-award className="bg-background px-5 py-5">
              <p className={cn("text-[0.66rem] tracking-[0.16em] uppercase", awarded ? "text-gold" : "text-muted")}>
                {t(`distinctions.items.${item.id}`)}
              </p>
              {item.id === "rising" ? (
                <p className="mt-2 text-xs leading-5 text-muted">{t("distinctions.hints.rising")}</p>
              ) : null}
              <p className="mt-4 min-h-8 font-display text-2xl tracking-[-0.04em]">
                {awarded ? item.names.join(" · ") : t("distinctions.unawarded")}
              </p>
              <p className="mt-3 text-sm text-muted">
                {awarded ? format(item.value) : t(`distinctions.reasons.${item.reason}`)}
              </p>
              <p className="mt-4 text-[0.66rem] tracking-[0.14em] text-muted uppercase">
                {t(`distinctions.status.${item.status}`)}
              </p>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs leading-5 text-muted">{t("distinctions.archive")}</p>
    </section>
  );
}
