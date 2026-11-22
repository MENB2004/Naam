import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [locality, setLocality] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('പാസ്‌വേഡുകൾ പരസ്പരം പൊരുത്തപ്പെടുന്നില്ല (Passwords do not match).');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('പാസ്‌വേഡിൽ കുറഞ്ഞത് 8 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം (Minimum 8 characters).');
      return;
    }
    if (!privacyConsent) {
      setErrorMessage('തുടരാൻ സ്വകാര്യതാ അറിയിപ്പിനുള്ള സമ്മതം ആവശ്യമാണ് (Privacy policy consent is required).');
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        locality: locality.trim() || undefined,
        privacy_consent: privacyConsent,
      });

      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/community/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു. വിവരങ്ങൾ ശരിയാണോ എന്ന് പരിശോധിക്കുക.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo height={56} className="mx-auto mb-2" />
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                പൗര രജിസ്ട്രേഷൻ
              </span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              പുതിയ അക്കൗണ്ട് സൃഷ്ടിക്കുക
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 mt-1">
              നാടിന്റെ പരിസ്ഥിതി സംരക്ഷണത്തിൽ പങ്കാളിയാകൂ
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  പ്രദേശം / പൊതുവായ വിലാസം (Locality - optional)
                </label>
                <Input type="text" maxLength={255} placeholder="നഗരം / പഞ്ചായത്ത് / പ്രദേശം" value={locality} onChange={(e) => setLocality(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  പൂർണ്ണ നാമം (Full Name)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    type="text"
                    required
                    placeholder="നിങ്ങളുടെ പേര്"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                <input type="checkbox" required checked={privacyConsent} onChange={(e) => setPrivacyConsent(e.target.checked)} className="mt-0.5 accent-[#087C63]" />
                <span>എന്റെ അക്കൗണ്ടും റിപ്പോർട്ടുകളും കൈകാര്യം ചെയ്യുന്നതിനായി നൽകിയ വിവരങ്ങൾ ഉപയോഗിക്കുന്നതിനെക്കുറിച്ചുള്ള <Link to="/privacy" target="_blank" className="font-semibold text-[#087C63] underline">സ്വകാര്യതാ അറിയിപ്പ്</Link> ഞാൻ വായിച്ച് സമ്മതിക്കുന്നു.</span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ഇമെയിൽ വിലാസം (Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ഫോൺ നമ്പർ (Phone - ഓപ്ഷണൽ)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="+91 98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  രഹസ്യവാക്ക് (Password - മിനിമം 8 അക്ഷരങ്ങൾ)
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  പാസ്‌വേഡ് വീണ്ടും നൽകുക (Confirm Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#087C63] hover:bg-[#06614D] text-white font-semibold py-2.5 rounded-xl shadow-sm transition"
              >
                {isLoading ? 'രജിസ്റ്റർ ചെയ്യുന്നു...' : 'രജിസ്റ്റർ ചെയ്യുക'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

          </CardContent>

          <CardFooter className="flex justify-center py-3 text-xs text-slate-500 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?{' '}
            <Link to="/login/community" className="font-semibold text-[#087C63] ml-1 hover:underline">
              ഇവിടെ പ്രവേശിക്കാം
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
