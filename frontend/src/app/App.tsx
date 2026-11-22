import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import {
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { DesignShowcase } from '../features/showcase/DesignShowcase';
import { LoginForm } from '../features/auth/LoginForm';
import { RegisterForm } from '../features/auth/RegisterForm';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { CitizenDashboard } from '../features/community/CitizenDashboard';
import { ComplaintWizard } from '../features/community/ComplaintWizard';
import { MyReports } from '../features/community/MyReports';
import { ComplaintTracker } from '../features/complaints/ComplaintTracker';
import { ComplaintDetail } from '../features/complaints/ComplaintDetail';
import { AuthorityDashboard } from '../features/authorities/AuthorityDashboard';
import { OfficerTaskList } from '../features/field-officer/OfficerTaskList';
import { IssueMap } from '../features/maps/IssueMap';
import { AlertBanner } from '../features/alerts/AlertBanner';
import { AdminDashboard } from '../features/admin/AdminDashboard';
import { AnalyticsDashboard } from '../features/analytics/AnalyticsDashboard';
import { SkipToContent } from '../components/common/SkipToContent';
import { useAuthStore } from '../store/authStore';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { HeroSection, LandingSections } from '../features/landing/HeroSection';

function LandingPage() {
  return (
    <>
      <HeroSection />
      <LandingSections />
    </>
  );
}

function OfficialDashboardEntry() {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  const destinationByRole = {
    AUTHORITY: '/authority',
    OFFICER: '/officer',
    SUPER_ADMIN: '/admin',
  } as const;
  return <Navigate to={destinationByRole[user.role as keyof typeof destinationByRole] ?? '/login'} replace />;
}

function PublicRoutes() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/about" element={<Navigate to="/#about" replace />} />
    <Route path="/how-it-works" element={<Navigate to="/#how" replace />} />
    <Route path="/environmental-issues" element={<Navigate to="/#issues" replace />} />
    <Route path="/contact" element={<Navigate to="/#contact" replace />} />
    <Route path="/map" element={<IssueMap />} />
    <Route path="/public-map" element={<Navigate to="/map" replace />} />
    <Route path="/design-system" element={<DesignShowcase />} />
    <Route path="/login" element={<LoginForm portal="community" />} />
    <Route path="/login/community" element={<LoginForm portal="community" />} />
    <Route path="/register" element={<RegisterForm />} />
    <Route path="/track" element={<ComplaintTracker />} />
    <Route path="/track/:trackingCode" element={<ComplaintTracker />} />
    <Route path="/track-complaint" element={<Navigate to="/track" replace />} />
    <Route path="/complaints/:id" element={<ComplaintDetail />} />
    <Route path="/community" element={<ProtectedRoute allowedRoles={['COMMUNITY']}><CitizenDashboard /></ProtectedRoute>} />
    <Route path="/community/dashboard" element={<ProtectedRoute allowedRoles={['COMMUNITY']}><CitizenDashboard /></ProtectedRoute>} />
    <Route path="/community/report" element={<ProtectedRoute allowedRoles={['COMMUNITY']}><ComplaintWizard /></ProtectedRoute>} />
    <Route path="/community/my-reports" element={<ProtectedRoute allowedRoles={['COMMUNITY']}><MyReports /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

function OfficialRoutes() {
  return <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<OfficialDashboardEntry />} />
    <Route path="/login" element={<LoginForm portal="official" />} />
    <Route path="/login/*" element={<Navigate to="/login" replace />} />
    <Route path="/register" element={<Navigate to="/login" replace />} />
    <Route path="/authority" element={<ProtectedRoute allowedRoles={['AUTHORITY', 'SUPER_ADMIN']} fallbackLoginRoute="/login"><AuthorityDashboard /></ProtectedRoute>} />
    <Route path="/officer" element={<ProtectedRoute allowedRoles={['OFFICER', 'SUPER_ADMIN']} fallbackLoginRoute="/login"><OfficerTaskList /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} fallbackLoginRoute="/login"><AdminDashboard /></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute allowedRoles={['AUTHORITY', 'SUPER_ADMIN']} fallbackLoginRoute="/login"><AnalyticsDashboard /></ProtectedRoute>} />
    <Route path="/map" element={<ProtectedRoute allowedRoles={['AUTHORITY', 'OFFICER', 'SUPER_ADMIN']} fallbackLoginRoute="/login"><IssueMap /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>;
}
// Protected Portal Layout Preview for Phase 04 Verification
export function PortalDashboardView({
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo height={40} />
            <div className="border-l border-slate-200 pl-3">
              <span className="font-bold text-sm text-slate-900 tracking-tight block">{titleMl}</span>
              <span className="text-[10px] text-slate-500 block">{titleEn}</span>
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
  const envSurface = (import.meta as any).env?.VITE_APP_SURFACE?.toLowerCase();
  const host = window.location.hostname.toLowerCase();
  const officialRootSurface = envSurface === 'official' || host.startsWith('portal.');
  const localOfficialPrefix = !officialRootSurface && (window.location.pathname === '/official' || window.location.pathname.startsWith('/official/'));
  const officialSurface = officialRootSurface || localOfficialPrefix;
  const routerBase = localOfficialPrefix ? '/official' : undefined;

  return (
    <BrowserRouter basename={routerBase}>
      <SkipToContent />
      <AlertBanner />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {officialSurface ? <OfficialRoutes /> : <PublicRoutes />}
      </main>
    </BrowserRouter>
  );
}
