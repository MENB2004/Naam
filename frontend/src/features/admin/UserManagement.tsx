import React, { useEffect, useState } from 'react';
import {
  Search,
  Shield,
  Building,
  RefreshCw,
  Power,
  X,
  Edit2,
  AlertTriangle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { UserAdmin, DepartmentAdmin } from '../../types/admin';
import { Button } from '../../components/ui/button';

interface UserManagementProps {
  departments: DepartmentAdmin[];
}

const ROLE_COLORS: Record<string, string> = {
  COMMUNITY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  AUTHORITY: 'bg-blue-50 text-blue-700 border-blue-200',
  OFFICER: 'bg-amber-50 text-amber-700 border-amber-200',
  SUPER_ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const UserManagement: React.FC<UserManagementProps> = ({ departments }) => {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Edit Role Modal State
  const [editingUser, setEditingUser] = useState<UserAdmin | null>(null);
  const [newRole, setNewRole] = useState<string>('COMMUNITY');
  const [newDeptId, setNewDeptId] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers(search, roleFilter);
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const openEditModal = (user: UserAdmin) => {
    setEditingUser(user);
    setNewRole(user.role);
    setNewDeptId(user.department_id || '');
    setModalError(null);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsUpdating(true);
    setModalError(null);
    try {
      const updated = await adminService.updateUserRole(
        editingUser.id,
        newRole,
        newDeptId || null
      );
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditingUser(null);
    } catch (err: any) {
      setModalError(err.message || 'റോൾ മാറ്റുന്നതിൽ പിശക് സംഭവിച്ചു.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (user: UserAdmin) => {
    try {
      const updated = await adminService.toggleUserStatus(user.id, !user.is_active);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err: any) {
      alert(err.message || 'സ്റ്റാറ്റസ് മാറ്റാൻ കഴിഞ്ഞില്ല.');
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="പേര്, ഇമെയിൽ, അല്ലെങ്കിൽ ഫോൺ നമ്പർ..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 focus:bg-white"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-semibold"
          >
            <option value="ALL">എല്ലാ റോളുകളും (All Roles)</option>
            <option value="COMMUNITY">പൗരൻ (Citizen)</option>
            <option value="AUTHORITY">അധികാരി (Authority)</option>
            <option value="OFFICER">ഫീൽഡ് ഓഫീസർ (Officer)</option>
            <option value="SUPER_ADMIN">സിസ്റ്റം അഡ്മിൻ (Admin)</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={isLoading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            റിഫ്രഷ്
          </Button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">ഉപയോക്താവ് (Name & Contact)</th>
                <th className="py-3.5 px-4">റോൾ (Role)</th>
                <th className="py-3.5 px-4">വകുപ്പ് (Department)</th>
                <th className="py-3.5 px-4">അക്കൗണ്ട് നില (Status)</th>
                <th className="py-3.5 px-4">രജിസ്റ്റർ ചെയ്ത തീയതി</th>
                <th className="py-3.5 px-4 text-right">നടപടികൾ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    ഉപയോക്താക്കൾ ഒന്നും കണ്ടെത്തിയില്ല.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const roleStyle = ROLE_COLORS[u.role] || 'bg-slate-50 text-slate-700';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs">{u.full_name}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                        {u.phone && <div className="text-[10px] text-slate-400">{u.phone}</div>}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleStyle}`}>
                          {u.role_display_ml} ({u.role})
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {u.department_name_ml ? (
                          <div className="flex items-center space-x-1 font-medium">
                            <Building className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span className="truncate max-w-[160px]">{u.department_name_ml}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.is_active ? 'സജീവം (Active)' : 'നിർജ്ജീവം (Inactive)'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString('ml-IN')}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(u)}
                          className="h-7 px-2 text-[11px] text-purple-700 hover:bg-purple-50 border-purple-200"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          റോൾ മാറ്റുക
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(u)}
                          className={`h-7 px-2 text-[11px] ${
                            u.is_active
                              ? 'text-red-600 hover:bg-red-50 border-red-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                          }`}
                          title={u.is_active ? 'അക്കൗണ്ട് നിർജ്ജീവമാക്കുക' : 'അക്കൗണ്ട് സജീവമാക്കുക'}
                        >
                          <Power className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-700" />
                <h3 className="font-bold text-sm text-slate-900">
                  ഉപയോക്തൃ റോൾ മാറ്റുക (Change Role)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-5 space-y-4">
              {modalError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                  ഉപയോക്താവ്
                </label>
                <div className="font-bold text-xs text-slate-800">{editingUser.full_name}</div>
                <div className="text-[11px] text-slate-500">{editingUser.email}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  പുതിയ റോൾ (New Role) *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold"
                >
                  <option value="COMMUNITY">പൗരൻ (Citizen / COMMUNITY)</option>
                  <option value="AUTHORITY">അധികാരി (Department Authority)</option>
                  <option value="OFFICER">ഫീൽഡ് ഓഫീസർ (Field Officer)</option>
                  <option value="SUPER_ADMIN">സിസ്റ്റം അഡ്മിൻ (Super Admin)</option>
                </select>
              </div>

              {['AUTHORITY', 'OFFICER'].includes(newRole) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    വകുപ്പ് അനുവദിക്കുക (Assign Department)
                  </label>
                  <select
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-medium"
                  >
                    <option value="">വകുപ്പ് തിരഞ്ഞെടുക്കുക...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name_ml} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingUser(null)}
                  disabled={isUpdating}
                >
                  റദ്ദാക്കുക
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdating}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
                >
                  {isUpdating ? 'സേവ് ചെയ്യുന്നു...' : 'മാറ്റങ്ങൾ സൂക്ഷിക്കുക'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
