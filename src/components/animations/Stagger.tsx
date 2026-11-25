"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, prefersSimpleMotion, useGSAP } from "@/lib/gsap";

export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const simple = prefersSimpleMotion();
      const items = root.querySelectorAll(":scope > *");
      if (items.length === 0) return;
      gsap.from(items, {
        y: simple ? 16 : 36,
        autoAlpha: 0,
        duration: simple ? 0.45 : 0.8,
        stagger: simple ? 0.06 : 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root,
          start: "top 86%",
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
