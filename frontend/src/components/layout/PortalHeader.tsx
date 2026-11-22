import { Link, useLocation } from 'react-router-dom';
import { LanguageSwitcher, Language } from '../common/LanguageSwitcher';
import { Logo } from '../common/Logo';
import { Shield } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

interface PortalHeaderProps {
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
  activeRole?: 'COMMUNITY' | 'AUTHORITY' | 'OFFICER' | 'ADMIN';
}

const ROLE_BADGES = {
  COMMUNITY: { ml: 'പൗരൻ', en: 'Citizen', color: 'bg-primary/10 text-primary' },
  AUTHORITY: { ml: 'അധികാരി', en: 'Authority', color: 'bg-accent/10 text-accent' },
  OFFICER: { ml: 'ഫീൽഡ് ഓഫീസർ', en: 'Field Officer', color: 'bg-warning/10 text-warning' },
  ADMIN: { ml: 'സിസ്റ്റം അഡ്മിൻ', en: 'Super Admin', color: 'bg-violet-100 text-violet-800' },
};

export function PortalHeader({
  currentLang = 'ml',
  onLanguageChange,
  activeRole = 'COMMUNITY',
}: PortalHeaderProps) {
  const location = useLocation();
  const roleInfo = ROLE_BADGES[activeRole];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Logo height={36} />
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleInfo.color}`}>
            {currentLang === 'ml' ? roleInfo.ml : roleInfo.en}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex lg:gap-6">
          <Link
            to="/community/report"
            className={`transition-colors hover:text-primary ${
              location.pathname === '/community/report' ? 'text-primary font-semibold' : ''
            }`}
          >
            {currentLang === 'ml' ? 'പരാതി നൽകുക' : 'Report Issue'}
          </Link>
          <Link
            to="/map"
            className={`transition-colors hover:text-primary ${
              location.pathname === '/map' ? 'text-primary font-semibold' : ''
            }`}
          >
            {currentLang === 'ml' ? 'ലൈവ് മാപ്പ്' : 'Live Map'}
          </Link>
          {(activeRole === 'AUTHORITY' || activeRole === 'ADMIN') && <Link
            to="/analytics"
            className={`transition-colors hover:text-primary ${
              location.pathname === '/analytics' ? 'text-primary font-semibold' : ''
            }`}
          >
            {currentLang === 'ml' ? 'അനലിറ്റിക്സ്' : 'Analytics'}
          </Link>}
        </nav>

        {/* Right Tools: Language Switcher, Notifications & Quick Actions */}
        <div className="flex items-center space-x-3">
          <NotificationDropdown />
          <LanguageSwitcher currentLang={currentLang} onLanguageChange={onLanguageChange} />
          
          <Link
            to="/login/community"
            className="hidden min-h-10 items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline-flex"
          >
            <Shield className="w-4 h-4 mr-1.5" />
            <span>{currentLang === 'ml' ? 'ലോഗിൻ' : 'Login'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
