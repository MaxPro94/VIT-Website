"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, prefersSimpleMotion, useGSAP } from "@/lib/gsap";

export function DrawLine({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (prefersReducedMotion() || prefersSimpleMotion()) {
        gsap.set(ref.current, { scaleX: 1 });
        return;
      }
      gsap.fromTo(
        ref.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 90%",
            end: "top 62%",
            scrub: 0.6,
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
      className={cn("block h-px origin-left bg-gold", className)}
    />
  );
}
