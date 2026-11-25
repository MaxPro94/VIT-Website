import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";

const pointIds = ["profile", "life", "trial", "code"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: { absolute: t("beforeTitle") },
    description: t("beforeDescription"),
    alternates: {
      languages: {
        en: "/en/before",
        fr: "/fr/before",
        "x-default": "/en/before",
      },
    },
  };
}

export default async function BeforePage() {
  const t = await getTranslations("before");

  return (
    <article className="pt-28 pb-24 md:pt-36 md:pb-32">
      <Container>
        <h1 className="max-w-4xl font-display text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.045em]">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-foreground/90">{t("intro")}</p>
        <ol className="mt-12 max-w-3xl">
          {pointIds.map((id, index) => (
            <li key={id} className="grid grid-cols-[2.25rem_1fr] gap-4 border-t border-line py-6">
              <span className="font-ornament text-xs tracking-[0.16em] text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <h2 className="font-display text-2xl tracking-tight">{t(`points.${id}.label`)}</h2>
                <p className="mt-2 max-w-xl text-base leading-7 text-muted">{t(`points.${id}.text`)}</p>
                {id === "life" ? (
                  <p className="mt-3 max-w-xl text-base leading-7 text-muted">{t("points.life.more")}</p>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href="/apply">{t("apply")}</ButtonLink>
          <ButtonLink href="/" variant="line">
            {t("back")}
          </ButtonLink>
        </div>
        <p className="mt-6 max-w-xl text-sm leading-6 text-muted">{t("access")}</p>
      </Container>
    </article>
  );
}
