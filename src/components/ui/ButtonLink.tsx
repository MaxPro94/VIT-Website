"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { buttonClass } from "./button-styles";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "line";
  className?: string;
  magnetic?: boolean;
};

export function ButtonLink({
  href,
  children,
  variant = "gold",
  className,
  magnetic = false,
}: ButtonLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !magnetic) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const context = gsap.context(() => {
      const onMove = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) * 0.22;
        const y = (event.clientY - (rect.top + rect.height / 2)) * 0.28;
        gsap.to(element, { x, y, duration: 0.35, ease: "power3.out" });
      };
      const onLeave = () => {
        gsap.to(element, { x: 0, y: 0, duration: 0.45, ease: "power3.out" });
      };
      element.addEventListener("pointermove", onMove);
      element.addEventListener("pointerleave", onLeave);
      return () => {
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerleave", onLeave);
      };
    }, element);

    return () => context.revert();
  }, [magnetic]);

  return (
    <Link ref={ref} href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
