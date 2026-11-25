"use client";

import { useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export function ScrollProgress() {
  const ref = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const line = ref.current;
      if (!line || prefersReducedMotion()) return;
      gsap.set(line, { scaleY: 0 });
      gsap.to(line, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          start: 0,
          end: "max",
          scrub: 0.35,
        },
      });
    },
    { scope: ref, dependencies: [pathname] },
  );

  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 right-0 z-50 hidden h-dvh w-px origin-top scale-y-0 bg-gold/80 md:block"
    />
  );
}
