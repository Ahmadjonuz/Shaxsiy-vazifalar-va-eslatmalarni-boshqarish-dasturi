"use client";
import { useTranslation } from '@/lib/translation-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

const locales = [
  { code: 'uz', label: 'Oʻzbekcha' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' }
];

export default function LocaleSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as 'uz' | 'ru' | 'en')}>
      <SelectTrigger className="w-[160px] focus-visible:ring-primary">
        <Globe className="h-4 w-4" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 