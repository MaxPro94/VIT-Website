"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, prefersSimpleMotion, useGSAP } from "@/lib/gsap";

export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const simple = prefersSimpleMotion();
      gsap.from(ref.current, {
        y: simple ? 14 : 28,
        autoAlpha: 0,
        duration: simple ? 0.5 : 0.85,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
