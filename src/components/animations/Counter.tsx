"use client";

import { useRef } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, prefersSimpleMotion, useGSAP } from "@/lib/gsap";

export function Counter({
  value,
  prefix = "",
  className,
}: {
  value: number;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const locale = useLocale();

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;
      const formatter = new Intl.NumberFormat(locale);
      const render = (next: number) => {
        element.textContent = `${prefix}${formatter.format(Math.round(next))}`;
      };
      render(value);
      if (prefersReducedMotion()) return;
      const simple = prefersSimpleMotion();
      const state = { current: 0 };
      gsap.to(state, {
        current: value,
        duration: simple ? 0.7 : 1.35,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
        },
        onStart: () => {
          state.current = 0;
          render(0);
        },
        onUpdate: () => render(state.current),
      });
    },
    { scope: ref, dependencies: [locale, value, prefix] },
  );

  return (
    <p ref={ref} className={cn("font-display tracking-tight text-foreground", className)}>
      {prefix}
      {new Intl.NumberFormat(locale).format(value)}
    </p>
  );
}
