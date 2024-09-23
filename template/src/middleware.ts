import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "@/i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const locales = [...i18n.locales];
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  const locale = matchLocale(languages, locales, i18n.defaultLocale);
  return locale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host') || '';
  const isProd = process.env.NODE_ENV === 'production';
  
  const isAppSubdomain = isProd 
    ? host.startsWith('app.') 
    : host === 'localhost:3000' && pathname.startsWith('/app');

  // Handle root path for both main domain and app subdomain
  if (pathname === "/" || (isAppSubdomain && (pathname === "/app" || pathname === "/"))) {
    const locale = getLocale(request);
    const newPath = isAppSubdomain ? `/app/${locale}` : `/${locale}`;
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Check if the pathname is missing a locale
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}` &&
                (!isAppSubdomain || (!pathname.startsWith(`/app/${locale}/`) && pathname !== `/app/${locale}`))
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    let newPathname = pathname;
    
    if (isAppSubdomain) {
      newPathname = pathname.startsWith('/app') ? pathname : `/app${pathname}`;
    }
    
    return NextResponse.redirect(
      new URL(
        `${newPathname.startsWith('/') ? '' : '/'}${isAppSubdomain ? 'app/' : ''}${locale}${newPathname}`,
        request.url
      )
    );
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|service-worker.js|icon-192x192.png|icon-512x512.png|.*\..*).*)",
  ],
};
