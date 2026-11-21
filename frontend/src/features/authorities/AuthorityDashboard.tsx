import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  LogOut,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types/complaint';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Logo } from '../../components/common/Logo';
import { AssignOfficerModal } from './AssignOfficerModal';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

export const AuthorityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal State
  const [selectedComplaintForAssign, setSelectedComplaintForAssign] = useState<Complaint | null>(null);

  const fetchComplaints = () => {
    setIsLoading(true);
    complaintService
      .getPublicComplaints()
      .then((data) => {
        setComplaints(data);
      })
      .catch((err) => {
        console.error('Failed to load authority complaints', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const total = complaints.length;
  const submitted = complaints.filter((c) => c.current_status === 'SUBMITTED').length;
  const inField = complaints.filter((c) =>
    ['ASSIGNED', 'IN_PROGRESS', 'ACTION_TAKEN'].includes(c.current_status)
  ).length;
  const resolved = complaints.filter((c) => c.current_status === 'RESOLVED').length;

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.current_status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F0F7FA]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo height={38} />
            <div className="border-l border-slate-200 pl-3 hidden sm:block">
              <span className="font-bold text-sm text-blue-900 tracking-tight block">അധികാരി ട്രിയാജ് ഡെസ്ക്</span>
              <span className="text-[10px] text-slate-500 block">LSGD / PCB Authority Portal</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-slate-800">{user?.fullName}</div>
              <div className="text-[11px] text-blue-700 font-semibold">{user?.departmentNameMl || 'തദ്ദേശ സ്വയംഭരണ വകുപ്പ്'}</div>
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
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">ആകെ പരാതികൾ</span>
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</div>
              <div className="text-[11px] text-slate-500 mt-1">Total Reported</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-xs font-semibold">പുതിയവ / പരിശോധിപ്പുള്ളവ</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">{submitted}</div>
              <div className="text-[11px] text-amber-600 mt-1">Needs Triage / Verification</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <span className="text-xs font-semibold">ഫീൽഡ് നടപടിയിൽ</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">{inField}</div>
              <div className="text-[11px] text-blue-600 mt-1">Assigned to Field Teams</div>
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
        </div>

        {/* Search & Filter Toolbar */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="ട്രാക്കിംഗ് കോഡ്, വിഷയം അല്ലെങ്കിൽ ജില്ല നൽകി തിരയുക..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">എല്ലാ സ്റ്റാറ്റസുകളും</option>
                <option value="SUBMITTED">പുതിയവ (SUBMITTED)</option>
                <option value="VERIFIED">പരിശോധിച്ചവ (VERIFIED)</option>
                <option value="ASSIGNED">ചുമതലപ്പെടുത്തിയവ (ASSIGNED)</option>
                <option value="IN_PROGRESS">നടപടിയിൽ (IN_PROGRESS)</option>
                <option value="RESOLVED">പരിഹരിച്ചവ (RESOLVED)</option>
                <option value="REJECTED">നിരസിച്ചവ (REJECTED)</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">എല്ലാ വിഭാഗങ്ങളും</option>
                <option value="WASTE">മാലിന്യ നിക്ഷേപം</option>
                <option value="WATER_POLLUTION">ജല മലിനീകരണം</option>
                <option value="DRAINAGE">ഡ്രെയിനേജ് തടസ്സം</option>
                <option value="AIR_POLLUTION">വായു മലിനീകരണം</option>
                <option value="DEFORESTATION">വനനശീകരണം</option>
                <option value="ILLEGAL_MINING">അനധികൃത ഖനനം</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchComplaints}
                disabled={isLoading}
                className="text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                പുതുക്കുക
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Triage Table View */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="p-4 bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                പരാതികളുടെ പട്ടിക (Triage Queue)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                പരിശോധനയ്ക്കും ഫീൽഡ് അസൈൻമെന്റിനുമായി ലഭിച്ച പരാതികൾ
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              ലഭിച്ചവ: {filteredComplaints.length}
            </span>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">പരാതി വിവരങ്ങൾ ലഭ്യമാക്കുന്നു...</div>
            ) : filteredComplaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                തിരഞ്ഞെടുത്ത ഫിൽട്ടറുകൾക്ക് അനുയോജ്യമായ പരാതികൾ ലഭ്യമല്ല.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                      <th className="p-3">ട്രാക്കിംഗ് കോഡ്</th>
                      <th className="p-3">വിഷയം / വിഭാഗം</th>
                      <th className="p-3">സ്ഥലം</th>
                      <th className="p-3">സ്റ്റാറ്റസ്</th>
                      <th className="p-3">ചുമതലപ്പെടുത്തിയ ഓഫീസർ</th>
                      <th className="p-3 text-right">നടപടികൾ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredComplaints.map((comp) => {
                      const activeAssignment = comp.assignments?.find((a) => a.status === 'ACTIVE');
                      return (
                        <tr key={comp.id} className="hover:bg-slate-50/75 transition">
                          <td className="p-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                            <Link to={`/complaints/${comp.id}`} className="hover:underline">
                              {comp.tracking_code}
                            </Link>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900 line-clamp-1">{comp.title}</div>
                            <span className="text-[11px] text-slate-500">{comp.category_display_ml}</span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="text-slate-800 font-medium">{comp.location.district}</div>
                            <div className="text-[11px] text-slate-500">{comp.location.lsgd_name}</div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <StatusBadge status={comp.current_status} size="sm" />
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {activeAssignment ? (
                              <div className="flex items-center space-x-1.5 text-slate-800">
                                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                                <span className="font-semibold">{activeAssignment.assigned_to_name}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                                ചുമതലപ്പെടുത്തിയിട്ടില്ല
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedComplaintForAssign(comp)}
                              className="text-[11px] text-blue-700 border-blue-200 hover:bg-blue-50"
                            >
                              <UserCheck className="w-3 h-3 mr-1" />
                              {activeAssignment ? 'മാറ്റി ചുമതലപ്പെടുത്തുക' : 'ഓഫീസറെ ചുമതലപ്പെടുത്തുക'}
                            </Button>
                            <Link to={`/complaints/${comp.id}`}>
                              <Button variant="ghost" size="sm" className="text-[11px]">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                കാണുക
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Assignment Modal */}
      {selectedComplaintForAssign && (
        <AssignOfficerModal
          complaint={selectedComplaintForAssign}
          isOpen={!!selectedComplaintForAssign}
          onClose={() => setSelectedComplaintForAssign(null)}
          onSuccess={(updated) => {
            setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          }}
        />
      )}
    </div>
  );
};
