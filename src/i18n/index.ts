export type Locale = 'en' | 'fr' | 'ar'

const STORAGE_KEY = 'scientia_language'
let currentLocale: Locale = loadSavedLocale()
const listeners: Set<(locale: Locale) => void> = new Set()

import { en } from './locales/en.ts'
import { fr } from './locales/fr.ts'
import { ar } from './locales/ar.ts'

const locales: Record<Locale, Record<string, string>> = { en, fr, ar }

function loadSavedLocale(): Locale {
  if (typeof localStorage === 'undefined') return 'en'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'fr' || saved === 'ar') return saved
  return 'en'
}

export function t(key: string, fallback?: string): string {
  return locales[currentLocale]?.[key] ?? fallback ?? key
}

export function setLanguage(locale: Locale): void {
  currentLocale = locale
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, locale)
  }
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  listeners.forEach(fn => fn(locale))
}

export function getLanguage(): Locale {
  return currentLocale
}

export function getLanguages(): { code: Locale; label: string }[] {
  return [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
  ]
}

export function onLanguageChange(fn: (locale: Locale) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function isRTL(): boolean {
  return currentLocale === 'ar'
}
