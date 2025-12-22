import { NextResponse } from "next/server";
import { match } from '@formatjs/intl-localematcher'
import Negotiator from "negotiator";
 
let locales = ['fr-FR', 'en-US', 'de-DE', 'sp-SP']

function getLocale() { 
  let headers = { 'accept-language': 'fr-FR,fr;q=0.5' }
  let languages = new Negotiator({ headers }).languages()
  let defaultLocale = 'fr-FR'   
  return match(languages, locales, defaultLocale)
}


export function proxy(request) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
 
  if (pathnameHasLocale) return
 
  // Redirect if there is no locale
  const locale = getLocale()
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}
 
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
  ],
}