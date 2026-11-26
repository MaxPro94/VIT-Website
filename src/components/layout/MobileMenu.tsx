"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { branding, brigadeDisplayName, homeSectionIds } from "@/config/branding";
import { recruitmentOffer } from "@/config/recruitment";
import { socialConfig } from "@/config/social";
import { Link, usePathname } from "@/i18n/navigation";
import { safeHttpsUrl } from "@/lib/external";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { Wordmark } from "@/components/brand/Wordmark";
import { LanguageSwitcher } from "./LanguageSwitcher";

const sections = [
  { id: "about", hash: homeSectionIds.about },
  { id: "values", hash: homeSectionIds.values },
  { id: "media", hash: homeSectionIds.media },
] as const;

const links = [
  { id: "home", href: "/" },
  { id: "about", href: `/#${homeSectionIds.about}` },
  { id: "values", href: `/#${homeSectionIds.values}` },
  { id: "media", href: `/#${homeSectionIds.media}` },
  { id: "leaderboard", href: "/leaderboard" },
  { id: "before", href: "/before" },
] as const;

export function MenuMark({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative block h-3.5 w-5">
      <span
        className={cn(
          "absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300 ease-out motion-reduce:transition-none",
          open && "top-[6px] rotate-45",
        )}
      />
      <span
        className={cn(
          "absolute top-[6px] left-0 h-px w-full bg-current transition-opacity duration-200 motion-reduce:transition-none",
          open && "opacity-0",
        )}
      />
      <span
        className={cn(
          "absolute top-3 left-0 h-px w-full bg-current transition-transform duration-300 ease-out motion-reduce:transition-none",
          open && "top-[6px] -rotate-45",
        )}
      />
    </span>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
      <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function MobileMenu({
  open,
  hasLogo,
  titleId,
  openerRef,
  onClose,
}: {
  open: boolean;
  hasLogo: boolean;
  titleId: string;
  openerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const t = useTranslations("nav");
  const cta = useTranslations("cta");
  const hero = useTranslations("hero");
  const footer = useTranslations("footer");
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [present, setPresent] = useState(false);
  if (open && !present) setPresent(true);
  const [morph, setMorph] = useState(false);
  const [hash, setHash] = useState("");
  const year = new Date().getFullYear();
  const youtube = safeHttpsUrl(socialConfig.youtubeChannelUrl);
  const discord = safeHttpsUrl(socialConfig.discordUrl);

  useEffect(() => {
    const read = () => setHash(window.location.hash);
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (media.matches) onClose();
    };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, [onClose]);

  useEffect(() => {
    if (!present) return;
    const y = window.scrollY;
    const previous = document.body.style.overflow;
    const content = document.getElementById("content");
    const opener = openerRef.current;
    document.body.style.overflow = "hidden";
    content?.setAttribute("inert", "");
    return () => {
      document.body.style.overflow = previous;
      content?.removeAttribute("inert");
      window.scrollTo(0, y);
      opener?.focus();
    };
  }, [present, openerRef]);

  useEffect(() => {
    if (!present || !open) return;
    const frame = requestAnimationFrame(() => setMorph(true));
    const panel = panelRef.current;
    const closeButton = panel?.querySelector<HTMLElement>("[data-menu-close]");
    closeButton?.focus();
    const focusable = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>("a, button"))
      : [];
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
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
      cancelAnimationFrame(frame);
      setMorph(false);
      document.removeEventListener("keydown", onKey);
    };
  }, [present, open, onClose]);

  useLayoutEffect(() => {
    if (!present || !panelRef.current) return;
    const panel = panelRef.current;
    const query = gsap.utils.selector(panel);
    timeline.current?.kill();
    if (!open) {
      if (prefersReducedMotion()) {
        queueMicrotask(() => setPresent(false));
        return;
      }
      timeline.current = gsap.timeline({ onComplete: () => setPresent(false) });
      timeline.current.to(panel, { clipPath: "inset(0 0 100% 0)", duration: 0.28, ease: "power2.in" });
      return;
    }
    if (prefersReducedMotion()) {
      gsap.set(panel, { clipPath: "none" });
      gsap.set(query("[data-menu-reveal]"), { autoAlpha: 1, y: 0, x: 0, yPercent: 0, scaleX: 1 });
      return;
    }
    gsap.set(query("[data-menu-reveal]"), { autoAlpha: 1, x: 0, y: 0, yPercent: 0, scaleX: 1 });
    const reveal = gsap.timeline({ defaults: { ease: "power3.out", overwrite: "auto" } });
    reveal
      .fromTo(panel, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.3 })
      .fromTo(query("[data-menu-header]"), { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.18 }, 0.08)
      .fromTo(query("[data-menu-link]"), { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.04, duration: 0.28 }, 0.14)
      .fromTo(query("[data-menu-index]"), { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, stagger: 0.04, duration: 0.22 }, 0.16)
      .fromTo(query("[data-menu-rule]"), { scaleX: 0 }, { scaleX: 1, stagger: 0.04, duration: 0.26 }, 0.18)
      .fromTo(query("[data-menu-brand]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.32)
      .fromTo(query("[data-menu-cta]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.38)
      .fromTo(query("[data-menu-foot]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.16 }, 0.44);
    timeline.current = reveal;
  }, [present, open]);

  useEffect(() => {
    return () => {
      timeline.current?.kill();
    };
  }, []);

  if (!present) return null;

  const current = (id: (typeof links)[number]["id"]) => {
    if (id === "home") return pathname === "/" && hash === "";
    if (id === "leaderboard") return pathname === "/leaderboard";
    if (id === "before") return pathname === "/before";
    const section = sections.find((item) => item.id === id);
    return pathname === "/" && section !== undefined && hash === `#${section.hash}`;
  };

  return (
    <div
      ref={panelRef}
      id={titleId}
      role="dialog"
      aria-modal="true"
      aria-label={t("primary")}
      className="vit-menu fixed inset-0 z-50 flex h-dvh flex-col overflow-y-auto bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div
        className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line px-6 md:h-20 md:px-10"
      >
        <Link
          href="/"
          data-menu-header
          data-menu-reveal
          aria-label={brigadeDisplayName}
          onClick={onClose}
          className="flex items-center gap-3"
        >
          {hasLogo ? (
            <span className="relative block h-11 w-11">
              <Image src={branding.logoPath} alt="" fill quality={100} className="object-contain" sizes="44px" />
            </span>
          ) : null}
          <Wordmark className="text-[0.95rem]" />
        </Link>
        <button
          data-menu-close
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center"
          onClick={onClose}
        >
          <MenuMark open={morph} />
          <span className="sr-only">{t("closeMenu")}</span>
        </button>
      </div>

      <div className="grid flex-1 content-start gap-8 px-6 py-4 md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] md:content-stretch md:gap-12 md:px-10 md:py-8">
        <nav aria-label={t("primary")}>
          <ol>
            {links.map((link, index) => {
              const active = current(link.id);
              return (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    aria-current={active ? (link.id === "home" || link.id === "leaderboard" || link.id === "before" ? "page" : "location") : undefined}
                    onClick={onClose}
                    className="group flex items-center gap-3 py-2.5 md:gap-4 md:py-3"
                  >
                    <span
                      data-menu-index
                      data-menu-reveal
                      className={cn(
                        "w-7 shrink-0 font-display text-[0.72rem] tracking-[0.16em] tabular-nums",
                        active ? "text-gold" : "text-muted",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="block min-w-0 flex-1 overflow-hidden py-[0.08em]">
                      <span
                        data-menu-link
                        data-menu-reveal
                        className={cn(
                          "block font-display text-[clamp(1.45rem,4.8vh,2.15rem)] leading-[1.08] tracking-[-0.04em] md:text-[clamp(1.7rem,3.4vh,2.5rem)]",
                          active ? "text-gold" : "text-foreground group-hover:text-gold-light",
                        )}
                      >
                        {t(link.id)}
                      </span>
                    </span>
                    <span className={cn(active ? "text-gold" : "text-muted group-hover:text-foreground")}>
                      <Arrow />
                    </span>
                  </Link>
                  <span
                    data-menu-rule
                    data-menu-reveal
                    className={cn("block h-px origin-left", active ? "bg-gold/70" : "bg-line")}
                  />
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex flex-col justify-end gap-8 md:justify-between md:border-l md:border-line md:pl-10">
          <div data-menu-brand data-menu-reveal className="hidden md:block">
            {hasLogo ? (
              <span className="relative block h-28 w-20">
                <Image src={branding.logoPath} alt="" fill quality={100} className="object-contain object-left" sizes="80px" />
              </span>
            ) : null}
            <Wordmark aria-hidden className="mt-6 block text-[clamp(3rem,6vw,4.5rem)]" />
            <p className="mt-3 max-w-[14rem] text-[0.66rem] leading-5 tracking-[0.16em] text-muted uppercase">
              {brigadeDisplayName}
            </p>
          </div>
          <Link
            href="/apply"
            data-menu-cta
            data-menu-reveal
            aria-current={pathname === "/apply" ? "page" : undefined}
            onClick={onClose}
            className="group flex items-end justify-between gap-4 border-t border-gold/50 pt-5"
          >
            <span>
              <span className="text-[0.66rem] tracking-[0.18em] text-gold uppercase">
                {cta(recruitmentOffer.open ? "statusOpen" : "statusClosed")}
              </span>
              <span className="mt-2 block font-display text-[clamp(1.7rem,4vh,2.4rem)] leading-none tracking-[-0.04em]">
                {t("join")}
              </span>
              {recruitmentOffer.priorityGearId ? (
                <span className="mt-3 block text-[0.66rem] tracking-[0.16em] text-muted uppercase">
                  {cta("priority", { gear: `${recruitmentOffer.priorityGearId}-Gear` })}
                </span>
              ) : null}
            </span>
            <span className={cn("mb-1", pathname === "/apply" ? "text-gold" : "text-foreground")}>
              <Arrow />
            </span>
          </Link>
        </div>
      </div>

      <footer
        data-menu-foot
        data-menu-reveal
        className="mt-auto shrink-0 border-t border-line px-6 py-3 md:px-10 md:py-4"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) onClose();
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p className="font-ornament text-[0.62rem] tracking-[0.22em] text-gold uppercase">{hero("kicker")}</p>
          <LanguageSwitcher />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[0.66rem] tracking-[0.12em] text-muted uppercase">
          <p>{footer("rights", { year, name: branding.acronym })}</p>
          <p className="flex gap-4">
            {discord ? (
              <a href={discord} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                {footer("discord")}
              </a>
            ) : null}
            {youtube ? (
              <a href={youtube} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                {footer("youtube")}
              </a>
            ) : null}
          </p>
        </div>
      </footer>
    </div>
  );
}
