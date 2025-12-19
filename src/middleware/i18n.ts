import { routing } from '@/i18n/routing';
import createMiddleware from 'next-intl/middleware';

export const i18nMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localeDetection: true,
  localePrefix: 'as-needed'
});

export const i18nConfig = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};
