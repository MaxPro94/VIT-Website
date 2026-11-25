import { getTranslations } from "next-intl/server";
import { officers } from "@/config/officers";
import { Container } from "@/components/ui/Container";

export async function Officers() {
  const t = await getTranslations("officers");

  return (
    <section id="officers" className="scroll-mt-24 border-t border-line py-16 md:py-24">
      <Container>
        <p className="font-ornament text-xs tracking-[0.28em] text-gold uppercase">
          {t("index")} — {t("eyebrow")}
        </p>
        <h2 className="mt-4 max-w-xl font-display text-[clamp(2rem,4vw,3.2rem)] leading-[0.96] tracking-[-0.04em]">
          {t("title")}
        </h2>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {officers.map((officer) => (
            <li key={officer.id} className="border-t border-line pt-5">
              <p className="font-display text-3xl tracking-tight">{officer.name}</p>
              <p className="mt-2 text-sm text-muted">{t(`roles.${officer.role}`)}</p>
              <p className="mt-3 text-[0.72rem] tracking-[0.18em] text-gold uppercase whitespace-nowrap">
                {officer.gear}-Gear
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
