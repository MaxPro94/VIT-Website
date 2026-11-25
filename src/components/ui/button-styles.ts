import { cn } from "@/lib/cn";

export function buttonClass(variant: "gold" | "line" = "gold", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center px-7 text-[0.72rem] tracking-[0.22em] uppercase transition-colors duration-200",
    variant === "gold"
      ? "bg-gold text-background hover:bg-gold-light"
      : "border border-gold/80 text-foreground hover:border-gold-light hover:text-gold-light",
    className,
  );
}
