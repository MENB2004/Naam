import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  Users,
  FileText,
  CheckCircle2,
  Sparkles,
  LogOut,
  Building2,
  HardHat,
  KeyRound,
} from 'lucide-react';
import { DesignShowcase } from '../features/showcase/DesignShowcase';
import { LoginForm } from '../features/auth/LoginForm';
import { RegisterForm } from '../features/auth/RegisterForm';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { CitizenDashboard } from '../features/community/CitizenDashboard';
import { ComplaintWizard } from '../features/community/ComplaintWizard';
import { MyReports } from '../features/community/MyReports';
import { ComplaintTracker } from '../features/complaints/ComplaintTracker';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

function LandingPage() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F7FA]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#087C63] flex items-center justify-center text-white font-bold text-xl shadow-md">
              നാം
            </div>
            <div>
              <span className="font-bold text-xl text-[#087C63] tracking-tight">NAAM</span>
              <span className="text-xs text-slate-500 block -mt-1 font-medium">ജനകീയ പരിസ്ഥിതി വേദി</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  {user.fullName} ({user.roleDisplayMl})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="text-xs text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  ലോഗ് ഔട്ട്
                </Button>
              </div>
            ) : (
              <>
                <Link
                  to="/login/community"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#087C63] transition"
                >
                  പ്രവേശിക്കുക
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#087C63] hover:bg-[#06614D] rounded-lg shadow-sm transition"
                >
                  രജിസ്റ്റർ ചെയ്യുക
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E8F5EE] text-[#087C63] text-xs font-semibold mb-6">
          <Shield className="w-4 h-4" />
          <span>കേരള സർക്കാരിന്റെ തദ്ദേശ സ്വയംഭരണ വകുപ്പുകളുമായി ബന്ധിപ്പിച്ചിരിക്കുന്നു</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1E293B] max-w-3xl leading-tight mb-4">
          നമ്മുടെ നാടിന്റെ പരിസ്ഥിതി സംരക്ഷണം, <br className="hidden sm:block" />
          <span className="text-[#087C63]">ഇനി നമ്മുടെ കൈകളിൽ.</span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mb-8 leading-relaxed">
          മാലിന്യനിക്ഷേപം, ജലമലിനീകരണം, ഡ്രെയിനേജ് പ്രശ്നങ്ങൾ എന്നിവ ഫോട്ടോയും ജി.പി.എസ് ലൊക്കേഷനും സഹിതം തദ്ദേശ സ്ഥാപനങ്ങളെ അറിയിക്കൂ. നടപടികൾ തത്സമയം നിരീക്ഷിക്കൂ.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-16">
          <Link
            to="/community"
            className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-[#087C63] hover:bg-[#06614D] rounded-xl shadow-md transition"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            പൗര പോർട്ടൽ (Community)
          </Link>
          <Link
            to="/authority"
            className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-[#1677C8] hover:bg-[#0F5EA3] rounded-xl shadow-md transition"
          >
            <Building2 className="w-5 h-5 mr-2" />
            അധികാരി പോർട്ടൽ (Authority)
          </Link>
          <Link
            to="/officer"
            className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-xl shadow-md transition"
          >
            <HardHat className="w-5 h-5 mr-2" />
            ഫീൽഡ് ഓഫീസർ (Officer)
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-[#7E22CE] hover:bg-[#6B21A8] rounded-xl shadow-md transition"
          >
            <KeyRound className="w-5 h-5 mr-2" />
            സിസ്റ്റം അഡ്മിൻ (Admin)
          </Link>
        </div>

        {/* Portal Access Links */}
        <div className="w-full max-w-4xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-12">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-center">
            <Sparkles className="w-4 h-4 mr-2 text-[#087C63]" />
            NAAM നാല് പോർട്ടലുകൾ (Role-Based Portals)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <Link
              to="/login/community"
              className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition block"
            >
              <div className="text-xs font-bold text-emerald-800">1. പൗരൻ (Citizen)</div>
              <div className="text-[11px] text-emerald-600 mt-1">പരാതി നൽകൽ & നിരീക്ഷണം</div>
            </Link>
            <Link
              to="/login/authority"
              className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition block"
            >
              <div className="text-xs font-bold text-blue-800">2. അധികാരി (LSGD/PCB)</div>
              <div className="text-[11px] text-blue-600 mt-1">അസൈൻമെന്റ് & അംഗീകാരം</div>
            </Link>
            <Link
              to="/login/officer"
              className="p-3 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition block"
            >
              <div className="text-xs font-bold text-amber-800">3. ഫീൽഡ് ഓഫീസർ</div>
              <div className="text-[11px] text-amber-600 mt-1">പരിശോധന & ഫോട്ടോ തെളിവ്</div>
            </Link>
            <Link
              to="/login/admin"
              className="p-3 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition block"
            >
              <div className="text-xs font-bold text-purple-800">4. സിസ്റ്റം അഡ്മിൻ</div>
              <div className="text-[11px] text-purple-600 mt-1">വകുപ്പ് & സുരക്ഷാ മാനേജ്‌മെന്റ്</div>
            </Link>
          </div>
          <div className="mt-4 text-center">
            <Link
              to="/design-system"
              className="inline-flex items-center text-xs font-semibold text-[#087C63] hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              ഡിസൈൻ സിസ്റ്റം ഘടകങ്ങൾ പരിശോധിക്കുക (Design Showcase)
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#087C63] mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">ലളിതമായ റിപ്പോർട്ടിംഗ്</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              ഫോട്ടോയും കൃത്യമായ ലൊക്കേഷനും നൽകി രണ്ടു മിനിറ്റിനുള്ളിൽ പരാതി തദ്ദേശ വാർഡ് ഡെസ്കിലെത്തിക്കാം.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] flex items-center justify-center text-[#1677C8] mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">സുതാര്യമായ പരിഹാരം</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              പരാതി പരിശോധിച്ച ഉദ്യോഗസ്ഥൻ, ഫീൽഡ് തല നടപടി, പരിഹാര തെളിവ് എന്നിവ ഓൺലൈനായി കാണാം.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] flex items-center justify-center text-[#7E22CE] mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">പങ്കാളിത്ത ഭരണം</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              ഹരിതകർമ്മസേന, മലിനീകരണ നിയന്ത്രണ ബോർഡ്, ഇറിഗേഷൻ വകുപ്പ് എന്നിവരുമായി നേരിട്ടുള്ള ഏകോപനം.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          © 2026 NAAM (നാം) — പീപ്പിൾസ് എൻവയോൺമെന്റൽ മോണിറ്ററിംഗ് സിസ്റ്റം | കേരളം
        </div>
      </footer>
    </div>
  );
}

// Protected Portal Layout Preview for Phase 04 Verification
function PortalDashboardView({
  titleMl,
  titleEn,
  roleLabel,
  color,
  nextPhaseText,
}: {
  titleMl: string;
  titleEn: string;
  roleLabel: string;
  color: string;
  nextPhaseText: string;
}) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F0F7FA]">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="w-10 h-10 rounded-xl bg-[#087C63] flex items-center justify-center text-white font-bold text-xl shadow-md">
              നാം
            </Link>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">{titleMl}</span>
              <span className="text-xs text-slate-500 block -mt-1">{titleEn}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800">{user?.fullName}</div>
              <div className="text-[11px] text-slate-500">{user?.email}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-xs text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              ലോഗ് ഔട്ട്
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5" style={{ color, borderColor: color }}>
                {roleLabel} ({user?.role})
              </Badge>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs">
                പരിശോധിച്ച അക്കൗണ്ട് (Authenticated)
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              സ്വാഗതം, {user?.fullName}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              {nextPhaseText}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/">
              <Button variant="outline" size="sm">
                ഹോം പേജ്
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-800">ഉപയോക്തൃ വിവരങ്ങൾ</CardTitle>
              <CardDescription className="text-xs text-slate-500">User Profile Details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ഐഡി:</span>
                <span className="font-mono text-[11px] text-slate-700">{user?.id?.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ഇമെയിൽ:</span>
                <span className="font-medium text-slate-800">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">റോൾ (മലയാളം):</span>
                <span className="font-semibold text-emerald-700">{user?.roleDisplayMl}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">റോൾ (ഇംഗ്ലീഷ്):</span>
                <span className="font-semibold text-slate-800">{user?.role}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-800">സുരക്ഷിത പ്രവേശന നില (Auth Security Status)</CardTitle>
              <CardDescription className="text-xs text-slate-500">RBAC Token & Session Guard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-xs text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-bold">റോൾ അടിസ്ഥാനമാക്കിയുള്ള പ്രവേശനം (RBAC) വിജയകരം:</span>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    രഹസ്യ പാസ്‌വേഡ് ഹാഷിംഗ് (PBKDF2-HMAC-SHA256) ഉം സെക്യൂർ JWT ടോക്കൺ പരിശോധനയും പൂർത്തിയായി.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                <div className="font-semibold text-slate-800 mb-1">അടുത്ത ഘട്ടങ്ങൾ (Upcoming Features):</div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>• ഫേസ് 05: പൗര പരാതി സമർപ്പണം (ഫോട്ടോ, GPS ലൊക്കേഷൻ, മലയാളം വോയ്സ് നോട്ടുകൾ)</div>
                  <div>• ഫേസ് 06 & 07: അധികാരി വർക്ക്‌ഫ്ലോ മാനേജ്‌മെന്റ് & ഫീൽഡ് ഇൻസ്പെക്ഷൻ മൊബൈൽ ഡെസ്ക്</div>
                  <div>• ഫേസ് 08: ഓപ്പൺസ്ട്രീറ്റ്മാപ്പ് ലൈവ് ജിയോ-സ്പേഷ്യൽ മാപ്പിംഗ്</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/design-system" element={<DesignShowcase />} />

        {/* Auth Routes */}
        <Route path="/login/community" element={<LoginForm portal="community" />} />
        <Route path="/login/authority" element={<LoginForm portal="authority" />} />
        <Route path="/login/officer" element={<LoginForm portal="officer" />} />
        <Route path="/login/admin" element={<LoginForm portal="admin" />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Tracking Routes */}
        <Route path="/track" element={<ComplaintTracker />} />
        <Route path="/track/:trackingCode" element={<ComplaintTracker />} />

        {/* Protected Community Portal */}
        <Route
          path="/community"
          element={
            <ProtectedRoute allowedRoles={['COMMUNITY']}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/report"
          element={
            <ProtectedRoute allowedRoles={['COMMUNITY']}>
              <ComplaintWizard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/my-reports"
          element={
            <ProtectedRoute allowedRoles={['COMMUNITY']}>
              <MyReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/authority"
          element={
            <ProtectedRoute allowedRoles={['AUTHORITY']} fallbackLoginRoute="/login/authority">
              <PortalDashboardView
                titleMl="അധികാരി പോർട്ടൽ"
                titleEn="Authority Portal"
                roleLabel="അധികാരി"
                color="#1677C8"
                nextPhaseText="ഫേസ് 07-ൽ പുതിയ പരാതികൾ അവലോകനം ചെയ്യാനും ഫീൽഡ് ഓഫീസർമാർക്ക് കൈമാറാനും കഴിയും."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer"
          element={
            <ProtectedRoute allowedRoles={['OFFICER']} fallbackLoginRoute="/login/officer">
              <PortalDashboardView
                titleMl="ഫീൽഡ് ഓഫീസർ ഡെസ്ക്"
                titleEn="Field Officer Desk"
                roleLabel="ഫീൽഡ് ഓഫീസർ"
                color="#D97706"
                nextPhaseText="ഫേസ് 07-ൽ പരിശോധന നടത്താനും സ്ഥലത്തുനിന്നുള്ള ഫോട്ടോ തെളിവുകൾ അപ്‌ലോഡ് ചെയ്യാനും കഴിയും."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']} fallbackLoginRoute="/login/admin">
              <PortalDashboardView
                titleMl="സിസ്റ്റം അഡ്മിൻ കൺസോൾ"
                titleEn="Super Admin Console"
                roleLabel="സിസ്റ്റം അഡ്മിൻ"
                color="#7E22CE"
                nextPhaseText="ഫേസ് 10-ൽ ഡിപ്പാർട്ട്‌മെന്റുകൾ, യൂസർ അക്കൗണ്ടുകൾ, സെക്യൂരിറ്റി ഓഡിറ്റ് ലോഗുകൾ എന്നിവ കൈകാര്യം ചെയ്യാം."
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
