'use client';
import { createContext, useContext, useState } from 'react';
import { translations, Locale } from './translation';

type TranslationContextType = {
  t: typeof translations['uz'];
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const TranslationContext = createContext<TranslationContextType>({
  t: translations.uz,
  locale: 'uz',
  setLocale: () => {},
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('uz');
  const t = translations[locale];

  return (
    <TranslationContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
} 