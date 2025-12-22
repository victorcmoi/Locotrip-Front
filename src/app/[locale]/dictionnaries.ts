import 'server-only'
 
const dictionaries = {
  en: () => import('../../../messages/en.json').then((module) => module.default),
  fr: () => import('../../../messages/fr.json').then((module) => module.default),
  de: () => import('../../../messages/de.json').then((module) => module.default),
  sp: () => import('../../../messages/sp.json').then((module) => module.default),
}
 
export type Locale = keyof typeof dictionaries
 
export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries
 
export const getDictionary = async (locale: Locale) => dictionaries[locale]()