import type { ComponentPropsWithoutRef } from "react";
import { branding } from "@/config/branding";
import { cn } from "@/lib/cn";

const tones = {
  solid: "text-foreground",
  quiet: "text-foreground/25",
} as const;

type WordmarkProps = {
  tone?: keyof typeof tones;
  as?: "span" | "p";
} & Omit<ComponentPropsWithoutRef<"span">, "children">;

export function Wordmark({ tone = "solid", as: Tag = "span", className, ...props }: WordmarkProps) {
  return (
    <Tag
      {...props}
      className={cn(
        "font-wordmark leading-[0.8] font-bold tracking-[-0.045em] uppercase",
        tones[tone],
        className,
      )}
    >
      {branding.acronym}
    </Tag>
  );
}
