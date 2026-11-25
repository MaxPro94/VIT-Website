"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, prefersSimpleMotion, useGSAP } from "@/lib/gsap";

export function DriftMark({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion() || prefersSimpleMotion()) return;
      gsap.to(ref.current, {
        yPercent: 16,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: ref },
  );

  return (
    <p ref={ref} aria-hidden className={cn(className)}>
      {text}
    </p>
  );
}
