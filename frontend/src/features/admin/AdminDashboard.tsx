import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Activity,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/adminService';
import { SystemStats, DepartmentAdmin } from '../../types/admin';
import { Logo } from '../../components/common/Logo';
import { NotificationDropdown } from '../../components/layout/NotificationDropdown';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { UserManagement } from './UserManagement';
import { DepartmentManagement } from './DepartmentManagement';
import { AuditLogViewer } from './AuditLogViewer';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'audit'>('users');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [departments, setDepartments] = useState<DepartmentAdmin[]>([]);
  const loadData = async () => {
    try {
      const [s, d] = await Promise.all([
        adminService.getStats(),
        adminService.getDepartments(),
      ]);
      setStats(s);
      setDepartments(d);
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F7FA] font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo height={38} />
            <div className="border-l border-slate-200 pl-3 hidden sm:block">
              <span className="font-bold text-sm text-purple-900 tracking-tight block">
                സിസ്റ്റം അഡ്മിൻ കൺസോൾ
              </span>
              <span className="text-[10px] text-slate-500 block">
                Super Admin Security & System Control
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationDropdown />

            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-slate-800">{user?.fullName}</div>
              <div className="text-[11px] text-purple-700 font-bold uppercase tracking-wider">
                {user?.role}
              </div>
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
        {/* Top Telemetry KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">ഉപയോക്താക്കൾ</span>
                <Users className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {stats?.total_users ?? '—'}
              </div>
              <div className="text-[10px] text-slate-500">Total Users</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">സജീവം</span>
                <Activity className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-700">
                {stats?.active_complaints ?? '—'}
              </div>
              <div className="text-[10px] text-slate-500">Active Issues</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">പരിഹരിച്ചത്</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                {stats?.resolved_complaints ?? '—'}
              </div>
              <div className="text-[10px] text-slate-500">Resolved</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">വകുപ്പുകൾ</span>
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-blue-800">
                {stats?.total_departments ?? '—'}
              </div>
              <div className="text-[10px] text-slate-500">Departments</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">മുന്നറിയിപ്പുകൾ</span>
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-red-700">
                {stats?.active_alerts ?? '—'}
              </div>
              <div className="text-[10px] text-slate-500">Active Alerts</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">ഓഡിറ്റ് ലോഗുകൾ</span>
                <Lock className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-800">
                {stats?.total_audit_logs ?? '—'}
              </div>
              <div className="text-[10px] text-slate-500">Security Logs</div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ഉപയോക്താക്കൾ (User Management)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'departments'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>വകുപ്പുകൾ (Departments)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>സുരക്ഷാ ലോഗുകൾ (Security Audit)</span>
          </button>
        </div>

        {/* Active Tab View */}
        <div className="mt-4">
          {activeTab === 'users' && <UserManagement departments={departments} />}
          {activeTab === 'departments' && (
            <DepartmentManagement departments={departments} onRefresh={loadData} />
          )}
          {activeTab === 'audit' && <AuditLogViewer />}
        </div>
      </main>
    </div>
  );
};
