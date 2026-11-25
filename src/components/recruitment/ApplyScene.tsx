"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { branding } from "@/config/branding";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export function ApplyScene({
  hasLogo,
  filmId,
}: {
  hasLogo: boolean;
  filmId: string | null;
}) {
  const t = useTranslations("apply");
  const root = useRef<HTMLElement>(null);
  const [still, setStill] = useState(
    filmId ? `https://i.ytimg.com/vi/${filmId}/maxresdefault.jpg` : null,
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".apply-copy", {
        autoAlpha: 0,
        y: 18,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
      });
      gsap.fromTo(
        ".apply-still",
        { scale: 1.08 },
        { scale: 1, duration: 1.6, ease: "power2.out" },
      );
    },
    { scope: root },
  );

  return (
    <aside ref={root} className="relative min-h-[46vh] overflow-hidden lg:sticky lg:top-0 lg:h-dvh lg:min-h-0">
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={still}
          alt=""
          className="apply-still absolute inset-0 h-full w-full object-cover"
          onError={() => {
            if (!filmId) return;
            setStill((current) =>
              current?.includes("hqdefault") ? current : `https://i.ytimg.com/vi/${filmId}/hqdefault.jpg`,
            );
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-background-secondary" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />
      <div className="relative flex h-full flex-col justify-end px-6 pt-28 pb-10 md:px-10 lg:px-12 lg:pb-16">
        {hasLogo ? (
          <span className="apply-copy relative mb-6 block h-28 w-20">
            <Image src={branding.logoPath} alt="" fill quality={100} className="object-contain" sizes="160px" />
          </span>
        ) : null}
        <p className="apply-copy font-ornament text-xs tracking-[0.28em] text-gold uppercase">
          {t("aside.kicker")}
        </p>
        <p className="apply-copy mt-4 max-w-sm font-display text-3xl leading-none tracking-[-0.03em] md:text-4xl">
          {t("aside.line")}
        </p>
        <p className="apply-copy mt-4 max-w-sm text-sm leading-6 text-muted">{t("aside.text")}</p>
      </div>
    </aside>
  );
}
