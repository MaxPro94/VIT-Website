"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, prefersSimpleMotion, useGSAP } from "@/lib/gsap";

export function ScrollRail({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const simple = prefersSimpleMotion();
      gsap.fromTo(
        ref.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current.parentElement,
            start: "top 75%",
            end: "bottom 65%",
            scrub: simple ? false : 0.45,
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <span
      ref={ref}
      aria-hidden
      className={cn("absolute top-0 bottom-0 left-0 hidden w-px origin-top bg-gold md:block", className)}
    />
  );
}
