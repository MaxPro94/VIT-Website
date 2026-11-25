import { getLocale, getTranslations } from "next-intl/server";
import { homeSectionIds } from "@/config/branding";
import type { BrigadeStatistic, BrigadeStatisticsView } from "@/features/statistics/provider";
import { osrConfig } from "@/features/osr/config";
import { Link } from "@/i18n/navigation";
import { safeHttpsUrl } from "@/lib/external";
import { Counter } from "@/components/animations/Counter";
import { Stagger } from "@/components/animations/Stagger";
import { Container } from "@/components/ui/Container";

const secondaryIds = ["members", "totalFame", "monthlyFame"] as const;

export async function Statistics({ view }: { view: BrigadeStatisticsView }) {
  const t = await getTranslations("stats");
  const locale = await getLocale();
  const recordedOn = view.recordedOn
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "long",
        timeZone: osrConfig.timeZone,
      }).format(new Date(view.recordedOn))
    : null;
  const sourceUrl = safeHttpsUrl(view.sourceUrl);
  const ranking = view.items.find((item) => item.id === "ranking");
  const rest = secondaryIds
    .map((id) => view.items.find((item) => item.id === id))
    .filter((item): item is BrigadeStatistic => Boolean(item));

  return (
    <section id={homeSectionIds.statistics} className="scroll-mt-24 border-y border-line">
      <Container className="py-14 md:py-20">
        <p className="font-ornament text-xs tracking-[0.28em] text-gold uppercase">
          {t("index")} — {t("label")}
        </p>
        <div className="mt-8 grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-[0.72rem] tracking-[0.18em] text-muted uppercase">{t("ranking")}</p>
            <div className="mt-2">
              {ranking?.available && ranking.value !== null ? (
                <Counter
                  value={ranking.value}
                  prefix="#"
                  className="text-[clamp(4.6rem,11vw,8.4rem)] leading-[0.82]"
                />
              ) : (
                <p className="font-display text-[clamp(4.6rem,11vw,8.4rem)] leading-[0.82] text-line">
                  —<span className="sr-only">{t("unavailable")}</span>
                </p>
              )}
            </div>
          </div>
          <Stagger className="grid grid-cols-3 gap-4 border-t border-line pt-6 lg:col-span-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            {rest.map((item) => (
              <div key={item.id}>
                <p className="text-[0.68rem] tracking-[0.16em] text-muted uppercase">{t(item.id)}</p>
                <div className="mt-3">
                  {item.available && item.value !== null ? (
                    <Counter value={item.value} className="text-[clamp(1.6rem,2.4vw,2.4rem)]" />
                  ) : (
                    <p className="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] text-line">
                      —<span className="sr-only">{t("unavailable")}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </Stagger>
        </div>
        <p className="mt-8 max-w-2xl text-xs leading-5 text-muted">
          {recordedOn ? t("sourceNote", { date: recordedOn }) : t("unavailableNote")}
          {view.stale && recordedOn ? ` ${t("stale")}` : ""}
        </p>
        {view.nation ? (
          <p className="mt-2 text-xs text-muted">{t("nation", { nation: view.nation })}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/leaderboard" className="text-[0.68rem] tracking-[0.16em] text-gold uppercase">
            {t("leaderboardLink")}
          </Link>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.68rem] tracking-[0.16em] text-gold uppercase"
            >
              {t("rankingLink")}
            </a>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
