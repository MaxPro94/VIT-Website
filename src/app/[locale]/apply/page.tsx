import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { recruitmentOffer } from "@/config/recruitment";
import { socialConfig } from "@/config/social";
import { routing } from "@/i18n/routing";
import { publishedVideos } from "@/lib/external";
import { brandLogoExists } from "@/lib/brand-logo";
import { Link } from "@/i18n/navigation";
import { ApplyScene } from "@/components/recruitment/ApplyScene";
import { ApplicationForm } from "@/components/recruitment/ApplicationForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: { absolute: t("applyTitle") },
    description: t("applyDescription"),
    alternates: {
      languages: {
        en: "/en/apply",
        fr: "/fr/apply",
        "x-default": "/en/apply",
      },
    },
  };
}

export default async function ApplyPage() {
  const t = await getTranslations("apply");
  const hasLogo = await brandLogoExists();
  const film = publishedVideos(socialConfig.youtubeVideos)[0];

  return (
    <article className="lg:grid lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
      <ApplyScene hasLogo={hasLogo} filmId={film?.id ?? null} />
      <div className="px-6 pt-12 pb-24 md:px-10 md:pt-16 lg:px-16 lg:pt-32 lg:pb-28">
        <p className="font-ornament text-xs tracking-[0.28em] text-gold uppercase">{t("index")}</p>
        <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.045em]">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-foreground/90">{t("intro")}</p>
        <p className="mt-6">
          <Link href="/before" className="text-sm text-gold hover:text-gold-light">
            {t("beforeLink")}
          </Link>
        </p>
        {recruitmentOffer.submissionEnabled ? null : (
          <p className="mt-6 max-w-xl text-sm leading-6 text-muted">{t("notice")}</p>
        )}
        <ApplicationForm />
        <p className="mt-10 max-w-xl text-sm leading-6 text-muted">{t("access")}</p>
      </div>
    </article>
  );
}
