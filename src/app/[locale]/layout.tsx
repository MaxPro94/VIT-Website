import type { Metadata } from "next";
import { Cinzel, Inter, Space_Grotesk, Unbounded } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { branding } from "@/config/branding";
import { routing } from "@/i18n/routing";
import { brandLogoExists } from "@/lib/brand-logo";
import { RouteLine } from "@/components/animations/RouteLine";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "../../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-cinzel",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-unbounded",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: {
      default: t("homeTitle"),
      template: `%s · ${branding.acronym}`,
    },
    description: t("homeDescription"),
    applicationName: branding.acronym,
    openGraph: {
      type: "website",
      siteName: branding.acronym,
      locale: locale === "fr" ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
    },
    icons: { icon: "/icon.svg" },
    alternates: {
      languages: {
        en: "/en",
        fr: "/fr",
        "x-default": "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations("nav");
  const hasLogo = await brandLogoExists();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${spaceGrotesk.variable} ${cinzel.variable} ${unbounded.variable} h-full`}
    >
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RouteLine />
          <ScrollProgress />
          <a
            href="#content"
            className="absolute top-0 left-4 z-[60] -translate-y-full bg-gold px-4 py-3 text-sm text-background focus:translate-y-4"
          >
            {t("skip")}
          </a>
          <Header hasLogo={hasLogo} />
          <main id="content">{children}</main>
          <Footer hasLogo={hasLogo} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
