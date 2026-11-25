import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { parseLeaderboardQuery } from "@/features/leaderboard/query";
import { readLatestSnapshot } from "@/features/osr/storage";
import { routing } from "@/i18n/routing";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { absolute: t("leaderboardTitle") },
    description: t("leaderboardDescription"),
    alternates: {
      languages: {
        en: "/en/leaderboard",
        fr: "/fr/leaderboard",
        "x-default": "/en/leaderboard",
      },
    },
  };
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [snapshot, raw] = await Promise.all([readLatestSnapshot(), searchParams]);
  return <Leaderboard snapshot={snapshot} query={parseLeaderboardQuery(raw)} />;
}
