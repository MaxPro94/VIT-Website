import { getTranslations } from "next-intl/server";
import { branding, homeSectionIds } from "@/config/branding";
import { Reveal } from "@/components/animations/Reveal";
import { Container } from "@/components/ui/Container";
import { AboutWord } from "./AboutWord";

export async function Brotherhood() {
  const t = await getTranslations("brotherhood");
  const values = {
    name: branding.fullName,
    nation: branding.nation,
    server: branding.server,
    game: branding.game,
  };

  return (
    <section id={homeSectionIds.about} className="scroll-mt-24 py-16 md:py-24">
      <Container className="grid items-start gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-4">
          <AboutWord />
        </div>
        <div className="md:col-span-8">
          <Reveal>
            <p className="font-ornament text-xs tracking-[0.28em] text-gold uppercase">
              {t("index")} — {t("eyebrow")}
            </p>
            <h2 className="mt-4 max-w-xl font-display text-[clamp(2rem,4vw,3.6rem)] leading-[0.96] tracking-[-0.04em]">
              {t("title")}
            </h2>
            <div className="mt-6 max-w-xl space-y-4 text-base leading-7 text-muted">
              <p>{t("origin", values)}</p>
              <p>{t("name", values)}</p>
              <p>{t("ambition")}</p>
            </div>
            <h3 className="mt-10 font-display text-2xl tracking-tight">{t("warsTitle")}</h3>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">{t("wars")}</p>
            <h3 className="mt-10 font-display text-2xl tracking-tight">{t("commitmentTitle")}</h3>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">{t("commitment", values)}</p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
