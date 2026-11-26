"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { branding, brigadeDisplayName, homeSectionIds } from "@/config/branding";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button-styles";
import { Wordmark } from "@/components/brand/Wordmark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MenuMark, MobileMenu } from "./MobileMenu";

const sections = [
  { id: "about", hash: homeSectionIds.about },
  { id: "values", hash: homeSectionIds.values },
  { id: "media", hash: homeSectionIds.media },
] as const;

export function Header({ hasLogo }: { hasLogo: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  if (menuPath !== null && menuPath !== pathname) {
    setMenuPath(null);
  }
  const open = menuPath === pathname;
  const closeMenu = useCallback(() => setMenuPath(null), []);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mark = (
    <Link href="/" aria-label={brigadeDisplayName} className="flex items-center">
      {hasLogo ? (
        <span className="relative block h-11 w-11">
          <Image src={branding.logoPath} alt="" fill quality={100} className="object-contain" sizes="88px" />
        </span>
      ) : (
        <Wordmark className="text-[0.95rem]" />
      )}
    </Link>
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300",
        scrolled || open
          ? "border-line bg-background"
          : "border-transparent bg-transparent",
      )}
    >
      <div
        inert={open ? true : undefined}
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-6 md:h-20 md:px-10 lg:px-16"
      >
        {mark}
        <nav aria-label={t("primary")} className="hidden items-center gap-8 lg:flex">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className="text-[0.72rem] tracking-[0.18em] text-muted uppercase hover:text-foreground"
          >
            {t("home")}
          </Link>
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/#${section.hash}`}
              className="text-[0.72rem] tracking-[0.18em] text-muted uppercase hover:text-foreground"
            >
              {t(section.id)}
            </Link>
          ))}
          <Link
            href="/leaderboard"
            aria-current={pathname === "/leaderboard" ? "page" : undefined}
            className="text-[0.72rem] tracking-[0.18em] text-muted uppercase hover:text-foreground"
          >
            {t("leaderboard")}
          </Link>
        </nav>
        <div className="hidden items-center gap-6 lg:flex">
          <LanguageSwitcher />
          <Link
            href="/apply"
            aria-current={pathname === "/apply" ? "page" : undefined}
            className={buttonClass("line", "px-5")}
          >
            {t("join")}
          </Link>
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center text-foreground lg:hidden"
          aria-expanded={open}
          aria-controls={titleId}
          onClick={() => setMenuPath(open ? null : pathname)}
        >
          <MenuMark open={open} />
          <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
        </button>
      </div>
      <MobileMenu
        open={open}
        hasLogo={hasLogo}
        titleId={titleId}
        openerRef={menuButtonRef}
        onClose={closeMenu}
      />
    </header>
  );
}
