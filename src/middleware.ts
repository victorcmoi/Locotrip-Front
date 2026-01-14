import { NextRequest, NextResponse } from "next/server";
import { match } from '@formatjs/intl-localematcher'
import Negotiator from "negotiator";

let locales = ['fr', 'en', 'de', 'sp']

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || 'en,en-US;q=0.9'
  let headers = { 'accept-language': acceptLanguage }
  let languages = new Negotiator({ headers }).languages()
  let defaultLocale = 'en'

  try {
    const normalizedLanguages = languages.map(lang => {
      if (lang.startsWith('fr')) return 'fr'
      if (lang.startsWith('en')) return 'en'
      if (lang.startsWith('de')) return 'de'
      if (lang.startsWith('es') || lang.startsWith('sp')) return 'sp'
      return lang
    })
    return match(normalizedLanguages, locales, defaultLocale)
  } catch (error) {
    return defaultLocale
  }
}


export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Redirect if there is no locale
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next), API routes, and static files
    '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
  ],
}