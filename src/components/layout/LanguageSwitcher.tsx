"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [suffix, setSuffix] = useState("");

  useEffect(() => {
    const read = () => setSuffix(window.location.search + window.location.hash);
    read();
    window.addEventListener("hashchange", read);
    window.addEventListener("popstate", read);
    return () => {
      window.removeEventListener("hashchange", read);
      window.removeEventListener("popstate", read);
    };
  }, [pathname]);

  return (
    <div role="group" aria-label={t("label")} className={cn("flex items-center gap-3", className)}>
      {routing.locales.map((item) => {
        const active = item === locale;
        return (
          <Link
            key={item}
            href={`${pathname}${suffix}`}
            locale={item}
            hrefLang={item}
            lang={item}
            aria-current={active ? "true" : undefined}
            onClick={(event) => {
              const search = window.location.search + window.location.hash;
              if (!search) return;
              event.preventDefault();
              router.replace(`${pathname}${search}`, { locale: item });
            }}
            className={cn(
              "text-[0.72rem] tracking-[0.18em] uppercase",
              active ? "text-gold" : "text-muted hover:text-foreground",
            )}
          >
            {item === "fr" ? t("shortFr") : t("shortEn")}
          </Link>
        );
      })}
    </div>
  );
}
