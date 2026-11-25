"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { branding, brigadeDisplayName, homeSectionIds } from "@/config/branding";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button-styles";
import { Wordmark } from "@/components/brand/Wordmark";
import { LanguageSwitcher } from "./LanguageSwitcher";

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
  const open = menuPath === pathname;
  const closeMenu = () => setMenuPath(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const menuButton = menuButtonRef.current;
    const content = document.getElementById("content");
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    content?.setAttribute("inert", "");

    const panel = panelRef.current;
    const focusable = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>("a, button"))
      : [];
    focusable[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuPath(null);
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      content?.removeAttribute("inert");
      menuButton?.focus();
    };
  }, [open]);

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
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-6 md:h-20 md:px-10 lg:px-16">
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
          {open ? <X aria-hidden size={22} strokeWidth={1.25} /> : <Menu aria-hidden size={22} strokeWidth={1.25} />}
          <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
        </button>
      </div>
      {open ? (
        <div
          ref={panelRef}
          id={titleId}
          role="dialog"
          aria-modal="true"
          aria-label={t("primary")}
          className="fixed inset-0 z-40 flex flex-col bg-background px-6 pt-6 lg:hidden"
        >
          <div className="flex items-center justify-between">
            {mark}
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center"
              onClick={closeMenu}
            >
              <X aria-hidden size={22} strokeWidth={1.25} />
              <span className="sr-only">{t("closeMenu")}</span>
            </button>
          </div>
          <nav aria-label={t("primary")} className="mt-16 flex flex-col gap-6">
            <Link href="/" className="font-display text-4xl tracking-tight">
              {t("home")}
            </Link>
            {sections.map((section) => (
              <Link key={section.id} href={`/#${section.hash}`} className="font-display text-4xl tracking-tight">
                {t(section.id)}
              </Link>
            ))}
            <Link href="/leaderboard" className="font-display text-4xl tracking-tight" onClick={closeMenu}>
              {t("leaderboard")}
            </Link>
            <Link href="/before" className="font-display text-4xl tracking-tight" onClick={closeMenu}>
              {t("before")}
            </Link>
            <Link href="/apply" className="font-display text-4xl tracking-tight text-gold" onClick={closeMenu}>
              {t("join")}
            </Link>
          </nav>
          <LanguageSwitcher className="mt-auto pb-10" />
        </div>
      ) : null}
    </header>
  );
}
