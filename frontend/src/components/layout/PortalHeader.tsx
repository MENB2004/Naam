import { Link, useLocation } from 'react-router-dom';
import { LanguageSwitcher, Language } from '../common/LanguageSwitcher';
import { Shield } from 'lucide-react';

interface PortalHeaderProps {
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
  activeRole?: 'COMMUNITY' | 'AUTHORITY' | 'OFFICER' | 'ADMIN';
}

const ROLE_BADGES = {
  COMMUNITY: { ml: 'പൗരൻ', en: 'Citizen', color: 'bg-[#E8F5EE] text-[#087C63]' },
  AUTHORITY: { ml: 'അധികാരി', en: 'Authority', color: 'bg-amber-100 text-amber-800' },
  OFFICER: { ml: 'ഫീൽഡ് ഓഫീസർ', en: 'Field Officer', color: 'bg-purple-100 text-purple-800' },
  ADMIN: { ml: 'സിസ്റ്റം അഡ്മിൻ', en: 'Super Admin', color: 'bg-red-100 text-red-800' },
};

export function PortalHeader({
  currentLang = 'ml',
  onLanguageChange,
  activeRole = 'COMMUNITY',
}: PortalHeaderProps) {
  const location = useLocation();
  const roleInfo = ROLE_BADGES[activeRole];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#087C63] flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            നാം
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl text-[#087C63] tracking-tight">NAAM</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleInfo.color}`}>
                {currentLang === 'ml' ? roleInfo.ml : roleInfo.en}
              </span>
            </div>
            <span className="text-xs text-slate-500 block -mt-1 font-medium">
              {currentLang === 'ml' ? 'ജനകീയ പരിസ്ഥിതി വേദി' : "People's Environmental Platform"}
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-600">
          <Link
            to="/community/report"
            className={`hover:text-[#087C63] transition-colors ${
              location.pathname === '/community/report' ? 'text-[#087C63] font-bold' : ''
            }`}
          >
            {currentLang === 'ml' ? 'പരാതി നൽകുക' : 'Report Issue'}
          </Link>
          <Link
            to="/map"
            className={`hover:text-[#087C63] transition-colors ${
              location.pathname === '/map' ? 'text-[#087C63] font-bold' : ''
            }`}
          >
            {currentLang === 'ml' ? 'ലൈവ് മാപ്പ്' : 'Live Map'}
          </Link>
          <Link
            to="/design-system"
            className={`hover:text-[#087C63] transition-colors ${
              location.pathname === '/design-system' ? 'text-[#087C63] font-bold' : ''
            }`}
          >
            {currentLang === 'ml' ? 'ഡിസൈൻ സിസ്റ്റം' : 'Design System'}
          </Link>
        </nav>

        {/* Right Tools: Language Switcher & Quick Actions */}
        <div className="flex items-center space-x-3">
          <LanguageSwitcher currentLang={currentLang} onLanguageChange={onLanguageChange} />
          
          <Link
            to="/login/community"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-[#087C63] hover:bg-[#06614D] rounded-xl shadow-sm transition"
          >
            <Shield className="w-4 h-4 mr-1.5" />
            <span>{currentLang === 'ml' ? 'ലോഗിൻ' : 'Login'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
