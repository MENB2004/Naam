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
  const [lang, setLang] = useState<Language>(() => localStorage.getItem('naam_language') === 'en' ? 'en' : 'ml');

  const activeLang = controlledLang || lang;

  const toggleLanguage = () => {
    const nextLang: Language = activeLang === 'ml' ? 'en' : 'ml';
    setLang(nextLang);
    localStorage.setItem('naam_language', nextLang);
    document.documentElement.lang = nextLang;
    if (onLanguageChange) {
      onLanguageChange(nextLang);
    }
  };

  useEffect(() => {
    document.documentElement.lang = activeLang;
  }, [activeLang]);

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={activeLang === 'ml' ? 'ഭാഷ മാറ്റുക: English' : 'Switch language to Malayalam'}
      className={cn(
        'inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      title={activeLang === 'ml' ? 'ഭാഷ മാറ്റുക / Switch language' : 'Switch language / ഭാഷ മാറ്റുക'}
    >
      <Languages className="h-3.5 w-3.5 text-primary" />
      <span>{activeLang === 'ml' ? 'മലയാളം' : 'English'}</span>
    </button>
  );
}
