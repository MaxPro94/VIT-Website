import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);
const LOCALE_COOKIE = "NEXT_LOCALE";

function localeFromPath(pathname: string) {
  return routing.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const activeLocale = localeFromPath(pathname);

  if (!activeLocale) {
    const stored = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = stored === "fr" ? "fr" : routing.defaultLocale;
    const url = request.nextUrl.clone();
    const suffix = pathname === "/" ? "" : pathname;
    url.pathname = `/${locale}${suffix}`;
    return NextResponse.redirect(url);
  }

  const response = handleI18nRouting(request);
  response.cookies.set(LOCALE_COOKIE, activeLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
