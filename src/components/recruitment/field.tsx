import { cn } from "@/lib/cn";

export const fieldClass =
  "mt-3 w-full border border-line bg-surface/50 px-4 py-3 text-base text-foreground outline-none transition-colors duration-200 focus-visible:border-gold aria-[invalid=true]:border-danger";

export function Choice({
  children,
  className,
  ...props
}: React.ComponentProps<"input"> & { children: React.ReactNode }) {
  return (
    <label className={cn("group relative block", className)}>
      <input {...props} className="peer sr-only" />
      <span
        className={cn(
          "flex min-h-14 cursor-pointer items-center justify-center border px-3 text-center text-sm tracking-wide transition-colors duration-200",
          "border-line bg-surface/40 text-muted",
          "peer-checked:border-gold peer-checked:bg-gold/15 peer-checked:text-foreground",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-light",
          "group-hover:border-gold/70 group-hover:text-foreground",
        )}
      >
        {children}
      </span>
    </label>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm text-danger">
      {message}
    </p>
  );
}
