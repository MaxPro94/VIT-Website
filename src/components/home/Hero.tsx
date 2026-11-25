"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { branding, brigadeDisplayName, homeSectionIds } from "@/config/branding";
import { gsap, prefersReducedMotion, prefersSimpleMotion, useGSAP } from "@/lib/gsap";
import { Wordmark } from "@/components/brand/Wordmark";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function Hero({ hasLogo }: { hasLogo: boolean }) {
  const t = useTranslations("hero");
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const simple = prefersSimpleMotion();
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .from(".hero-light", { autoAlpha: 0, duration: simple ? 0.6 : 1.2 }, 0)
        .from(".hero-emblem", { autoAlpha: 0, scale: 0.985, duration: simple ? 0.7 : 1.25 }, 0.08)
        .from(".hero-line", { yPercent: 110, duration: simple ? 0.45 : 0.8, stagger: 0.08 }, 0.16)
        .from(".hero-kicker", { autoAlpha: 0, y: 10, duration: 0.45 }, "-=0.35")
        .from(".hero-cta", { autoAlpha: 0, y: 12, duration: 0.45 }, "-=0.2");

      timeline.fromTo(
        ".hero-sweep",
        { xPercent: -130 },
        { xPercent: 140, duration: simple ? 1.15 : 1.6, ease: "power2.inOut" },
        0.45,
      );
      gsap.to(".hero-field", {
        yPercent: simple ? 6 : 10,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-emblem", {
        scale: simple ? 0.97 : 0.94,
        yPercent: simple ? -3 : -6,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative min-h-dvh overflow-hidden bg-background">
      <div className="hero-field pointer-events-none absolute inset-0">
        <div className="hero-grain absolute inset-0" />
        <div className="hero-lines" />
        <div className="hero-vignette absolute inset-0" />
      </div>
      <div className="relative mx-auto grid min-h-dvh w-full max-w-[1440px] items-center gap-8 px-6 pt-24 pb-20 md:px-10 lg:grid-cols-12 lg:px-16">
        <div className="lg:col-span-6">
          <p className="hero-kicker text-[0.72rem] tracking-[0.22em] text-muted uppercase">
            {t("context", { game: branding.game, server: branding.server })}
          </p>
          <h1 className="mt-5">
            <span className="block overflow-hidden">
              <Wordmark className="hero-line block text-[clamp(4.6rem,7.6vw,6.5rem)]" />
            </span>
            <span className="mt-4 block overflow-hidden">
              <span className="hero-line block max-w-lg text-[0.72rem] leading-5 tracking-[0.22em] text-muted">
                {brigadeDisplayName}
              </span>
            </span>
          </h1>
          <p className="hero-kicker mt-6 font-ornament text-sm tracking-[0.22em] text-gold uppercase">
            {t("kicker")}
          </p>
          <p className="hero-kicker mt-4 max-w-md text-base leading-7 text-muted">{t("line")}</p>
          <div className="hero-cta mt-8">
            <ButtonLink href="/apply" magnetic>
              {t("cta")}
            </ButtonLink>
          </div>
        </div>
        <div className="hero-emblem relative lg:col-span-6 lg:justify-self-end">
          <div className="relative mx-auto aspect-[352/486] h-[min(36dvh,16rem)] w-auto lg:h-[min(62dvh,34rem)]">
            <div aria-hidden className="hero-light pointer-events-none absolute top-1/2 left-1/2" />
            {hasLogo ? (
              <>
                <Image
                  src={branding.logoPath}
                  alt={t("emblemAlt")}
                  fill
                  priority
                  quality={100}
                  className="object-contain"
                  sizes="(max-width: 1024px) 72vw, 560px"
                />
                <div
                  aria-hidden
                  className="hero-reflect pointer-events-none absolute inset-0 overflow-hidden"
                  style={{
                    maskImage: `url("${branding.logoPath}")`,
                    WebkitMaskImage: `url("${branding.logoPath}")`,
                  }}
                >
                  <div className="hero-sweep absolute inset-0" />
                </div>
              </>
            ) : (
              <Wordmark className="flex h-full items-center justify-center text-5xl" />
            )}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
      <a
        href={`#${homeSectionIds.about}`}
        className="absolute bottom-6 left-6 z-[1] flex items-center gap-4 text-[0.72rem] tracking-[0.22em] text-muted uppercase md:left-10 lg:left-16"
      >
        <span className="scroll-line" />
        {t("scroll")}
      </a>
    </section>
  );
}
