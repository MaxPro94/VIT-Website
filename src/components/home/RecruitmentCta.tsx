import { getTranslations } from "next-intl/server";
import { homeSectionIds } from "@/config/branding";
import { recruitmentOffer } from "@/config/recruitment";
import { Reveal } from "@/components/animations/Reveal";
import { Wordmark } from "@/components/brand/Wordmark";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

export async function RecruitmentCta() {
  const t = await getTranslations("cta");

  return (
    <section id={homeSectionIds.recruitment} className="scroll-mt-24 overflow-hidden py-16 md:py-24">
      <Container className="grid items-center gap-10 md:grid-cols-12">
        <Reveal className="md:col-span-7">
          <p className="font-ornament text-xs tracking-[0.28em] text-gold uppercase">
            {t("index")} — {t("eyebrow")}
          </p>
          <h2 className="mt-4 max-w-xl font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.94] tracking-[-0.045em]">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted">{t("text")}</p>
          <p className="mt-5 text-[0.72rem] tracking-[0.16em] text-gold uppercase">
            {t(recruitmentOffer.open ? "statusOpen" : "statusClosed")}
            {" · "}
            {t("priority", { gear: `${recruitmentOffer.priorityGearId}-Gear` })}
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">{t("criteria")}</p>
          {recruitmentOffer.submissionEnabled ? null : (
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">{t("notice")}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/apply" magnetic>
              {t("button")}
            </ButtonLink>
            <ButtonLink href="/before" variant="line">
              {t("before")}
            </ButtonLink>
          </div>
        </Reveal>
        <div className="hidden border-l border-line pl-10 md:col-span-5 md:block">
          <Wordmark aria-hidden tone="quiet" className="text-[clamp(5rem,9vw,8rem)]" />
        </div>
      </Container>
    </section>
  );
}
