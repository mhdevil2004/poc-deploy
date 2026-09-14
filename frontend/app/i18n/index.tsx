'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import en, { type TranslationKeys } from './en';
import id from './id';

// ─── Types ──────────────────────────────────────────────────────────────────

export type Language = 'en' | 'id';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationFunction;
}

// Deeply nested key accessor — e.g. t('nav.dashboard')
type DeepKeys<T, P extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? P extends ''
          ? DeepKeys<T[K], K>
          : DeepKeys<T[K], `${P}.${K}`>
        : never;
    }[keyof T]
  : P;

export type TranslationKey = DeepKeys<TranslationKeys>;

type TranslationFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

// ─── Translation Dictionary Map ──────────────────────────────────────────────

const translations: Record<Language, typeof en> = { en, id: id as unknown as typeof en };

// ─── Storage Key ─────────────────────────────────────────────────────────────

const LANG_KEY = 'fintilla_language';

// ─── Context ─────────────────────────────────────────────────────────────────

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY) as Language | null;
      if (stored === 'en' || stored === 'id') {
        setLanguageState(stored);
      }
    } catch {
      // localStorage not available (SSR)
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  // Translation function: supports deep key paths like 'nav.dashboard'
  const t = useCallback<TranslationFunction>(
    (key, params) => {
      const dict = translations[language];
      const parts = (key as string).split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = dict;
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          // Fallback to English if key not found in current language
          let fallback: any = translations.en;
          for (const p of parts) {
            if (fallback && typeof fallback === 'object' && p in fallback) {
              fallback = fallback[p];
            } else {
              return key as string;
            }
          }
          value = fallback;
          break;
        }
      }

      if (typeof value !== 'string') return key as string;

      // Replace {param} placeholders
      if (params) {
        return value.replace(/\{(\w+)\}/g, (_, k: string) =>
          params[k] !== undefined ? String(params[k]) : `{${k}}`
        );
      }

      return value;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Return safe defaults so components don't crash outside provider
    return {
      language: 'id' as Language,
      setLanguage: (_lang: Language) => {},
      t: (key: TranslationKey) => key as string,
    };
  }
  return ctx;
}

// ─── Language Toggle Button ──────────────────────────────────────────────────

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
      className={className}
      title={language === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
      aria-label="Toggle language"
    >
      <span className={`transition-all duration-200 ${language === 'id' ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
        ID
      </span>
      <span className="text-slate-300 mx-0.5">|</span>
      <span className={`transition-all duration-200 ${language === 'en' ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
        EN
      </span>
    </button>
  );
}
