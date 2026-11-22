import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Plus,
  ArrowRight,
  PhoneCall,
  Search,
  Shield,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types/complaint';
import { Logo } from '../../components/common/Logo';
import { StatusBadge } from '../../components/common/StatusBadge';
import { NotificationDropdown } from '../../components/layout/NotificationDropdown';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

export const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackInput, setTrackInput] = useState('');

  useEffect(() => {
    let isMounted = true;
    complaintService
      .getMyComplaints()
      .then((data) => {
        if (isMounted) setComplaints(data);
      })
      .catch((err) => {
        console.error('Failed to load citizen complaints', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const total = complaints.length;
  const inProgress = complaints.filter((c) =>
    ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'ACTION_TAKEN'].includes(c.current_status)
  ).length;
  const resolved = complaints.filter((c) => c.current_status === 'RESOLVED').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackInput.trim()) {
      navigate(`/track/${trackInput.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-background text-foreground border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo height={38} />
            <div className="border-l border-slate-200 pl-3 hidden sm:block">
              <span className="font-bold text-sm text-slate-900 tracking-tight block">പൗര പോർട്ടൽ</span>
              <span className="text-[10px] text-slate-500 block">Community Environmental Desk</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationDropdown />
            <Link to="/community/profile" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary">പ്രൊഫൈൽ</Link>
            <Link to="/community/report">
              <Button variant="primary" size="sm" className="hidden sm:inline-flex bg-[#087C63]">
                <Plus className="w-4 h-4 mr-1.5" />
                പരാതി നൽകുക
              </Button>
            </Link>
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-slate-800">{user?.fullName}</div>
              <div className="text-[11px] text-emerald-700 font-semibold">{user?.roleDisplayMl}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              ലോഗ് ഔട്ട്
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome & Quick Action Banner */}
        <div className="bg-gradient-to-r from-[#087C63] to-[#0D9488] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>സുതാര്യമായ പരിസ്ഥിതി നിരീക്ഷണ സംവിധാനം</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              സ്വാഗതം, {user?.fullName}!
            </h1>
            <p className="text-sm text-emerald-50 mt-2 leading-relaxed">
              നിങ്ങളുടെ പ്രദേശത്തെ മാലിന്യ നിക്ഷേപം, ജലമലിനീകരണം, ഓടകളുടെ തടസ്സം എന്നിവ ഫോട്ടോയും ജി.പി.എസ് ലൊക്കേഷനും സഹിതം തദ്ദേശ സ്ഥാപനങ്ങളെ അറിയിക്കൂ.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link to="/community/report">
                <Button className="bg-white text-[#087C63] hover:bg-emerald-50 font-bold px-5 py-2.5 rounded-xl shadow transition">
                  <AlertTriangle className="w-4 h-4 mr-2 text-[#087C63]" />
                  പുതിയ പരാതി രജിസ്റ്റർ ചെയ്യുക
                </Button>
              </Link>
              <Link to="/community/my-reports">
                <Button variant="outline" className="text-white border-white/40 hover:bg-white/10 font-semibold px-4 py-2.5 rounded-xl">
                  <FileText className="w-4 h-4 mr-2" />
                  എന്റെ മുൻ പരാതികൾ ({total})
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Tracking Search Bar */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="ട്രാക്കിംഗ് കോഡ് നൽകുക (ഉദാ: NAAM-2026-78421)..."
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#087C63]"
                />
              </div>
              <Button type="submit" variant="primary" className="bg-[#087C63] px-6">
                ട്രാക്ക് ചെയ്യുക
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">ആകെ പരാതികൾ</span>
                <FileText className="w-4 h-4 text-[#087C63]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</div>
              <div className="text-[11px] text-slate-500 mt-1">Total Reported</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-xs font-semibold">നടപടിയിൽ</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">{inProgress}</div>
              <div className="text-[11px] text-amber-600 mt-1">In Verification / Action</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-semibold">പരിഹരിച്ചവ</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{resolved}</div>
              <div className="text-[11px] text-emerald-600 mt-1">Resolved Successfully</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <span className="text-xs font-semibold">പരിഹാര നിരക്ക്</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">{resolutionRate}%</div>
              <div className="text-[11px] text-blue-600 mt-1">Resolution Efficiency</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Complaints Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-[#087C63]" />
                എന്റെ സമീപകാല പരാതികൾ (Recent Reports)
              </h2>
              <Link to="/community/my-reports" className="text-xs font-semibold text-[#087C63] hover:underline">
                എല്ലാം കാണുക ({total})
              </Link>
            </div>

            {isLoading ? (
              <Card className="p-8 text-center text-xs text-slate-500">
                വിവരങ്ങൾ ലഭ്യമാക്കുന്നു...
              </Card>
            ) : complaints.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-2 border-slate-200">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">നിങ്ങൾ ഇതുവരെ പരാതികൾ രജിസ്റ്റർ ചെയ്തിട്ടില്ല</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  നിങ്ങളുടെ പ്രദേശത്തെ മാലിന്യ നിക്ഷേപമോ മറ്റ് പാരിസ്ഥിതിക പ്രശ്നങ്ങളോ ശ്രദ്ധയിൽപ്പെട്ടാൽ ഉടൻ പരാതി നൽകാം.
                </p>
                <Link to="/community/report">
                  <Button variant="primary" size="sm" className="bg-[#087C63]">
                    <Plus className="w-4 h-4 mr-1" />
                    ആദ്യ പരാതി നൽകുക
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {complaints.slice(0, 5).map((comp) => (
                  <Card key={comp.id} className="border-slate-200 shadow-sm hover:border-[#087C63]/50 transition">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[11px] font-bold text-[#087C63] bg-[#E8F5EE] px-2 py-0.5 rounded">
                            {comp.tracking_code}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">
                            {new Date(comp.created_at).toLocaleDateString('ml-IN')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{comp.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{comp.location.district}, {comp.location.lsgd_name}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <StatusBadge status={comp.current_status} size="sm" />
                        <Link to={`/track/${comp.tracking_code}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            ട്രാക്ക്
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Environmental Helplines & Tips */}
          <div className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center">
                  <PhoneCall className="w-4 h-4 mr-2 text-[#087C63]" />
                  അടിയന്തിര പരിസ്ഥിതി ഹെൽപ്പ്‌ലൈനുകൾ
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">Kerala State Emergency Desks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800">ഹരിത കർമ്മസേന ഹെൽപ്പ്‌ലൈൻ</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">തദ്ദേശ സ്വയംഭരണ മാലിന്യ സംസ്കരണ സഹായം</div>
                  <div className="font-mono font-bold text-[#087C63] mt-1">1800-425-1070</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800">മലിനീകരണ നിയന്ത്രണ ബോർഡ് (KSPCB)</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">24x7 അടിയന്തര മലിനീകരണ പരാതികൾ</div>
                  <div className="font-mono font-bold text-blue-700 mt-1">0471-2318153</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800">സംസ്ഥാന ദുരന്തനിവാരണ അതോറിറ്റി</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">വെള്ളപ്പൊക്കം, മണ്ണിടിച്ചിൽ മുന്നറിയിപ്പുകൾ</div>
                  <div className="font-mono font-bold text-amber-700 mt-1">1077 (ടോൾ ഫ്രീ)</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-[#087C63] flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900">
                    <span className="font-bold block mb-1">റിപ്പോർട്ടിംഗ് നിർദ്ദേശം:</span>
                    പരാതി നൽകുമ്പോൾ വ്യക്തമായ ഫോട്ടോയും ലാൻഡ്മാർക്കും നൽകുന്നത് വാർഡ് തല ഉദ്യോഗസ്ഥർക്ക് സ്ഥലത്തെത്തി വേഗത്തിൽ നടപടിയെടുക്കാൻ സഹായിക്കും.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
