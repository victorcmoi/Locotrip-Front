'use client';
import { createContext, useContext } from 'react';
import type { Locale } from '@/app/[locale]/dictionnaries';

type Dictionary = {
  common: Record<string, string>;
  navigation: Record<string, string>;
  home: Record<string, string>;
  auth: Record<string, string>;
  [key: string]: Record<string, string>;
};

interface I18nContextType {
  locale: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
  locale,
  dict,
}: {
  children: React.ReactNode;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <I18nContext.Provider value={{ locale, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslations must be used within I18nProvider');
  }
  return context.dict;
}

export function useLocale() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLocale must be used within I18nProvider');
  }
  return context.locale;
}

export function useLocalizedPath() {
  const locale = useLocale();
  
  return (path: string) => {
    if (!path) return `/${locale}`;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${locale}${cleanPath}`;
  };
}
