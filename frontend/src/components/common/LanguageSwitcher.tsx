import { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { cn } from '../../lib/utils';

export type Language = 'ml' | 'en';

interface LanguageSwitcherProps {
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
  className?: string;
}

export function LanguageSwitcher({
  currentLang: controlledLang,
  onLanguageChange,
  className,
}: LanguageSwitcherProps) {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('naam_language') as Language) || 'ml';
  });

  const activeLang = controlledLang || lang;

  const toggleLanguage = () => {
    const nextLang: Language = activeLang === 'ml' ? 'en' : 'ml';
    setLang(nextLang);
    localStorage.setItem('naam_language', nextLang);
    if (onLanguageChange) {
      onLanguageChange(nextLang);
    }
  };

  useEffect(() => {
    if (controlledLang) {
      setLang(controlledLang);
    }
  }, [controlledLang]);

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        'inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#087C63]',
        className
      )}
      title="ഭാഷ മാറ്റുക / Switch Language"
    >
      <Languages className="w-3.5 h-3.5 text-[#087C63]" />
      <span>{activeLang === 'ml' ? 'മലയാളം' : 'English'}</span>
    </button>
  );
}
