"use client";
import { useTranslation } from '@/lib/translation-context';

const locales = [
  { code: 'uz', label: 'Oʻzbekcha' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' }
];

export default function LocaleSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex gap-1">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code as 'uz' | 'ru' | 'en')}
          className={`px-2 py-1 rounded border bg-background hover:bg-primary/10 text-xs ${locale === l.code ? 'font-bold border-primary' : ''}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
} 