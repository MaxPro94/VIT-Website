"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { Wordmark } from "@/components/brand/Wordmark";

export function AboutWord() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ".about-word",
        { xPercent: -3 },
        {
          xPercent: 3,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="overflow-hidden px-1">
      <Wordmark
        as="p"
        aria-hidden
        tone="quiet"
        className="about-word text-[clamp(4.8rem,11vw,8rem)]"
      />
    </div>
  );
}
