import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { branding, homeSectionIds } from "@/config/branding";
import { socialConfig } from "@/config/social";
import { Link } from "@/i18n/navigation";
import { safeHttpsUrl } from "@/lib/external";
import { Container } from "@/components/ui/Container";
import { Wordmark } from "@/components/brand/Wordmark";
import { LanguageSwitcher } from "./LanguageSwitcher";

const links = [
  { key: "home", href: "/" },
  { key: "about", href: `/#${homeSectionIds.about}` },
  { key: "values", href: `/#${homeSectionIds.values}` },
  { key: "media", href: `/#${homeSectionIds.media}` },
  { key: "leaderboard", href: "/leaderboard" },
  { key: "before", href: "/before" },
  { key: "join", href: "/apply" },
] as const;

export async function Footer({ hasLogo }: { hasLogo: boolean }) {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const year = new Date().getFullYear();
  const discord = safeHttpsUrl(socialConfig.discordUrl);
  const youtube = safeHttpsUrl(socialConfig.youtubeChannelUrl);
  const server = safeHttpsUrl(branding.serverUrl);

  return (
    <footer className="border-t border-line">
      <Container className="grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            {hasLogo ? (
              <span className="relative block h-12 w-12">
                <Image src={branding.logoPath} alt="" fill quality={100} className="object-contain" sizes="48px" />
              </span>
            ) : null}
            <Wordmark as="p" className="text-[0.95rem]" />
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted">{branding.fullName}</p>
        </div>
        <nav aria-label={t("navigate")} className="flex flex-col gap-3 md:col-span-3">
          <p className="text-[0.72rem] tracking-[0.18em] text-gold uppercase">{t("navigate")}</p>
          {links.map((link) => (
            <Link key={link.key} href={link.href} className="text-sm text-muted hover:text-foreground">
              {nav(link.key)}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-3 md:col-span-4">
          <p className="text-[0.72rem] tracking-[0.18em] text-gold uppercase">{t("presence")}</p>
          {server ? (
            <a href={server} className="text-sm text-muted hover:text-foreground" rel="noopener noreferrer">
              {t("game")}
            </a>
          ) : null}
          {discord ? (
            <a href={discord} className="text-sm text-muted hover:text-foreground" target="_blank" rel="noopener noreferrer">
              {t("discord")}
            </a>
          ) : null}
          {youtube ? (
            <a href={youtube} className="text-sm text-muted hover:text-foreground" target="_blank" rel="noopener noreferrer">
              {t("youtube")}
            </a>
          ) : null}
          <LanguageSwitcher className="mt-4" />
        </div>
        <div className="border-t border-line pt-8 md:col-span-12">
          <p className="max-w-3xl text-sm leading-6 text-muted">{t("disclaimer")}</p>
          <p className="mt-4 text-xs tracking-[0.14em] text-muted uppercase">
            {t("rights", { year, name: branding.acronym })}
          </p>
        </div>
      </Container>
    </footer>
  );
}
