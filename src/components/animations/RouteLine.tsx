"use client";

import { useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export function RouteLine() {
  const ref = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const tween = gsap.timeline();
      tween.fromTo(
        ref.current,
        { scaleX: 0, autoAlpha: 1 },
        { scaleX: 1, duration: 0.55, ease: "power2.out" },
      );
      tween.to(ref.current, { autoAlpha: 0, duration: 0.35 }, "+=0.05");
      return () => tween.kill();
    },
    { scope: ref, dependencies: [pathname] },
  );

  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-50 h-px w-full origin-left bg-gold opacity-0"
    />
  );
}
