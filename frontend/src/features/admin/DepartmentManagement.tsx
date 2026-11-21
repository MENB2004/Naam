import React, { useState } from 'react';
import { Building2, Plus, Phone, Mail, Users, FileText, X, AlertTriangle } from 'lucide-react';
import { DepartmentAdmin } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/ui/button';

interface DepartmentManagementProps {
  departments: DepartmentAdmin[];
  onRefresh: () => void;
}

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({
  departments,
  onRefresh,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [nameMl, setNameMl] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !nameMl.trim() || !nameEn.trim()) {
      setError('കോഡ്, മലയാളം പേര്, ഇംഗ്ലീഷ് പേര് എന്നിവ നിർബന്ധമാണ്.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await adminService.createDepartment({
        code: code.trim().toUpperCase(),
        name_ml: nameMl.trim(),
        name_en: nameEn.trim(),
        contact_email: contactEmail.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
      });
      setIsAddModalOpen(false);
      setCode('');
      setNameMl('');
      setNameEn('');
      setContactEmail('');
      setContactPhone('');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'വകുപ്പ് ചേർക്കുന്നതിൽ പിശക് സംഭവിച്ചു.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-800">രജിസ്റ്റർ ചെയ്ത വകുപ്പുകൾ (Departments)</h3>
          <p className="text-xs text-slate-500">
            തദ്ദേശ സ്വയംഭരണം, മലിനീകരണ നിയന്ത്രണ ബോർഡ്, ജലസേചനം തുടങ്ങിയ വകുപ്പുകളുടെ കോൺഫിഗറേഷൻ
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          പുതിയ വകുപ്പ് ചേർക്കുക
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((d) => (
          <div
            key={d.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-purple-200 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm border border-purple-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{d.name_ml}</h4>
                  <div className="text-xs text-slate-500 font-medium">{d.name_en}</div>
                </div>
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {d.code}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              {d.contact_phone && (
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{d.contact_phone}</span>
                </div>
              )}
              {d.contact_email && (
                <div className="flex items-center space-x-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{d.contact_email}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>ഉദ്യോഗസ്ഥർ: </span>
                <span className="font-bold text-slate-800">{d.user_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>പരാതികൾ: </span>
                <span className="font-bold text-slate-800">{d.complaint_count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-700" />
                <h3 className="font-bold text-sm text-slate-900">പുതിയ വകുപ്പ് ചേർക്കുക</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3 text-xs">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">വകുപ്പ് കോഡ് (Code) *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ഉദാ: FOREST, DISASTER_MGMT"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">പേര് മലയാളത്തിൽ *</label>
                <input
                  type="text"
                  value={nameMl}
                  onChange={(e) => setNameMl(e.target.value)}
                  placeholder="ഉദാ: വനം വന്യജീവി വകുപ്പ്"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Name in English *</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Forest & Wildlife Department"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ഇമെയിൽ</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="dept@kerala.gov.in"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ഹെൽപ്പ്‌ലൈൻ</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="0471-2300000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  റദ്ദാക്കുക
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
                >
                  {isSubmitting ? 'ചേർക്കുന്നു...' : 'വകുപ്പ് ചേർക്കുക'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
