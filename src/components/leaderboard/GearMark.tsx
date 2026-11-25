import { cn } from "@/lib/cn";

const tone: Record<string, string> = {
  I: "text-gold",
  B: "text-foreground",
  A: "text-muted",
  M: "text-gold-light",
};

/** Site marks, not official AceOnline icons. The letter stays visible. */
export function GearMark({
  gear,
  className,
  plain = false,
}: {
  gear: string;
  className?: string;
  plain?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", plain ? className : cn(tone[gear] ?? "text-muted", className))}>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden className="shrink-0">
        {gear === "I" ? <path d="M8 1.2 14.2 8 8 14.8 1.8 8 Z" fill="currentColor" /> : null}
        {gear === "B" ? <rect x="1.5" y="4.5" width="13" height="7" fill="currentColor" /> : null}
        {gear === "A" ? <path d="M8 1.5 15 14.5 H1 Z" fill="currentColor" /> : null}
        {gear === "M" ? (
          <path d="M8 1.5v13 M1.5 8h13" fill="none" stroke="currentColor" strokeWidth="2.2" />
        ) : null}
      </svg>
      <span className="text-[0.66rem] tracking-[0.14em] uppercase">{gear}-Gear</span>
    </span>
  );
}
