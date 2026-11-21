import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Users,
  Building2,
  HardHat,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { UserRole } from '../../types/auth';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';

export type PortalType = 'community' | 'authority' | 'officer' | 'admin';

interface PortalConfig {
  expectedRole: UserRole;
  titleMl: string;
  titleEn: string;
  subtitleMl: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ElementType;
  redirectUrl: string;
  demoUser: {
    identifier: string;
    labelMl: string;
  };
}

const PORTAL_CONFIGS: Record<PortalType, PortalConfig> = {
  community: {
    expectedRole: 'COMMUNITY',
    titleMl: 'പൗര പ്രവേശനം',
    titleEn: 'Community Portal',
    subtitleMl: 'പരിസ്ഥിതി പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യാനും നടപടികൾ നിരീക്ഷിക്കാനും പ്രവേശിക്കുക',
    accentColor: '#087C63',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700 border-emerald-200',
    icon: Users,
    redirectUrl: '/community',
    demoUser: {
      identifier: 'anjali.nair@example.com',
      labelMl: 'ഡെമോ പൗരൻ (Anjali Nair)',
    },
  },
  authority: {
    expectedRole: 'AUTHORITY',
    titleMl: 'അധികാരി പ്രവേശനം',
    titleEn: 'Authority Portal',
    subtitleMl: 'തദ്ദേശ സ്വയംഭരണ, മലിനീകരണ നിയന്ത്രണ ബോർഡ്, ഇറിഗേഷൻ വകുപ്പ് ഉദ്യോഗസ്ഥർക്കായി',
    accentColor: '#1677C8',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700 border-blue-200',
    icon: Building2,
    redirectUrl: '/authority',
    demoUser: {
      identifier: 'officer.lsgd@kerala.gov.in',
      labelMl: 'ഡെമോ അധികാരി (LSGD Executive Engineer)',
    },
  },
  officer: {
    expectedRole: 'OFFICER',
    titleMl: 'ഫീൽഡ് ഓഫീസർ പ്രവേശനം',
    titleEn: 'Field Officer Desk',
    subtitleMl: 'ഫീൽഡ് പരിശോധന, തത്സമയ ഫോട്ടോ അപ്‌ലോഡ്, തെളിവ് ശേഖരണം',
    accentColor: '#D97706',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700 border-amber-200',
    icon: HardHat,
    redirectUrl: '/officer',
    demoUser: {
      identifier: 'field.kochi@kerala.gov.in',
      labelMl: 'ഡെമോ ഫീൽഡ് ഇൻസ്പെക്ടർ (Kochi Field Inspector)',
    },
  },
  admin: {
    expectedRole: 'SUPER_ADMIN',
    titleMl: 'സിസ്റ്റം അഡ്മിൻ പ്രവേശനം',
    titleEn: 'Super Admin Console',
    subtitleMl: 'വകുപ്പ് മാനേജ്‌മെന്റ്, ആഡിറ്റ് ലോഗുകൾ, സിസ്റ്റം നിയന്ത്രണം',
    accentColor: '#7E22CE',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700 border-purple-200',
    icon: KeyRound,
    redirectUrl: '/admin',
    demoUser: {
      identifier: 'admin@naam.kerala.gov.in',
      labelMl: 'ഡെമോ സിസ്റ്റം അഡ്മിൻ (State Super Admin)',
    },
  },
};

interface LoginFormProps {
  portal: PortalType;
}

export const LoginForm: React.FC<LoginFormProps> = ({ portal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const config = PORTAL_CONFIGS[portal];
  const { setAuth } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMessage('ഇമെയിൽ / ഫോൺ നമ്പറും പാസ്‌വേഡും നൽകുക.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await authService.login({
        identifier: identifier.trim(),
        password,
        expected_role: config.expectedRole,
      });

      setAuth(data.user, data.accessToken, data.refreshToken);
      const routeState = location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null;
      const intendedPath = routeState?.from?.pathname;
      const destination = intendedPath?.startsWith('/') && !intendedPath.startsWith('//')
        ? `${intendedPath}${routeState?.from?.search ?? ''}${routeState?.from?.hash ?? ''}`
        : config.redirectUrl;
      navigate(destination, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'ലോഗിൻ പരാജയപ്പെട്ടു. വിവരങ്ങൾ ശരിയാണോ എന്ന് പരിശോധിക്കുക.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyDemoCredentials = () => {
    setIdentifier(config.demoUser.identifier);
    // Provide a sample test password
    if (portal === 'community') setPassword('StrongPassword123!');
    else if (portal === 'authority') setPassword('AuthorityPass2026!');
    else if (portal === 'officer') setPassword('OfficerPass2026!');
    else if (portal === 'admin') setPassword('AdminPass2026!');
    setErrorMessage(null);
  };

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-[#F0F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo height={56} className="mx-auto mb-2" />
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.badgeBg} ${config.badgeText}`}>
                <IconComponent className="w-3.5 h-3.5 mr-1.5" />
                {config.titleEn}
              </span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {config.titleMl}
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 mt-1">
              {config.subtitleMl}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ഇമെയിൽ അല്ലെങ്കിൽ ഫോൺ നമ്പർ
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="text"
                    required
                    placeholder="name@example.com / +91..."
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  രഹസ്യവാക്ക് (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-semibold py-2.5 rounded-xl shadow-sm transition"
                style={{ backgroundColor: config.accentColor }}
              >
                {isLoading ? 'പരിശോധിക്കുന്നു...' : 'പ്രവേശിക്കുക'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Quick Demo Pre-fill for Ease of Evaluation */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleApplyDemoCredentials}
                className="w-full text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between transition"
              >
                <span className="flex items-center text-left">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                  <span>{config.demoUser.labelMl}</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  ഡെമോ വിവരങ്ങൾ
                </span>
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2 text-center text-xs text-slate-500 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            {portal === 'community' ? (
              <div>
                അക്കൗണ്ട് ഇല്ലേ?{' '}
                <Link to="/register" className="font-semibold text-[#087C63] hover:underline">
                  ഇവിടെ സൗജന്യമായി രജിസ്റ്റർ ചെയ്യാം
                </Link>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
              <span>മറ്റ് പോർട്ടലുകൾ:</span>
              {portal !== 'community' && (
                <Link to="/login/community" className="text-emerald-700 hover:underline">
                  പൗരൻ
                </Link>
              )}
              {portal !== 'authority' && (
                <Link to="/login/authority" className="text-blue-700 hover:underline">
                  അധികാരി
                </Link>
              )}
              {portal !== 'officer' && (
                <Link to="/login/officer" className="text-amber-700 hover:underline">
                  ഫീൽഡ് ഓഫീസർ
                </Link>
              )}
              {portal !== 'admin' && (
                <Link to="/login/admin" className="text-purple-700 hover:underline">
                  സിസ്റ്റം അഡ്മിൻ
                </Link>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
