import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { alertService } from '../../services/alertService';
import { AlertLevel, AlertSource } from '../../types/alert';
import { KERALA_DISTRICTS } from '../maps/MapFilterBar';

interface BroadcastAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BroadcastAlertModal: React.FC<BroadcastAlertModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [titleMl, setTitleMl] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [messageMl, setMessageMl] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [alertLevel, setAlertLevel] = useState<AlertLevel>('WARNING');
  const [alertSource, setAlertSource] = useState<AlertSource>('OFFICIAL_WARNING');
  const [affectedDistrict, setAffectedDistrict] = useState<string>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleMl.trim() || !titleEn.trim() || !messageMl.trim() || !messageEn.trim()) {
      setError('ദയവായി എല്ലാ വിവരങ്ങളും പൂരിപ്പിക്കുക (Please fill in all required fields)');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await alertService.broadcastAlert({
        title_ml: titleMl.trim(),
        title_en: titleEn.trim(),
        message_ml: messageMl.trim(),
        message_en: messageEn.trim(),
        alert_level: alertLevel,
        alert_source: alertSource,
        affected_district: affectedDistrict === 'ALL' ? undefined : affectedDistrict,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'മുന്നറിയിപ്പ് നൽകുന്നതിൽ പിശക് സംഭവിച്ചു.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-amber-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                അടിയന്തര മുന്നറിയിപ്പ് നൽകുക (Broadcast Alert)
              </h2>
              <p className="text-xs text-slate-500">
                ഔദ്യോഗിക പരിസ്ഥിതി ജാഗ്രതാ നിർദ്ദേശം പൊതുജനങ്ങളിലേക്ക് എത്തിക്കുക
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Level and Source Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                തീവ്രത (Alert Level)
              </label>
              <select
                value={alertLevel}
                onChange={(e) => setAlertLevel(e.target.value as AlertLevel)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-red-500 font-semibold"
              >
                <option value="CRITICAL">അടിയന്തിരം (CRITICAL)</option>
                <option value="WARNING">ജാഗ്രത (WARNING)</option>
                <option value="INFO">വിവരം (INFO)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                സ്രോതസ്സ് (Alert Source)
              </label>
              <select
                value={alertSource}
                onChange={(e) => setAlertSource(e.target.value as AlertSource)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-red-500 font-semibold"
              >
                <option value="OFFICIAL_WARNING">ഔദ്യോഗികം (OFFICIAL_WARNING)</option>
                <option value="COMMUNITY_REPORT">കമ്മ്യൂണിറ്റി (COMMUNITY_REPORT)</option>
                <option value="SIMULATED_DEMO_ALERT">ഡെമോ (SIMULATED_DEMO_ALERT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ബാധിച്ച ജില്ല (District)
              </label>
              <select
                value={affectedDistrict}
                onChange={(e) => setAffectedDistrict(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-red-500 font-semibold"
              >
                <option value="ALL">സംസ്ഥാന വ്യാപകം (All Kerala)</option>
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ശീർഷകം മലയാളത്തിൽ (Title in Malayalam) *
              </label>
              <input
                type="text"
                value={titleMl}
                onChange={(e) => setTitleMl(e.target.value)}
                placeholder="ഉദാ: പെരിയാർ തീരത്ത് കനത്ത ജാഗ്രതാ നിർദ്ദേശം..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Title in English *
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Flash Flood Alert along Periyar River Basin..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-red-500"
                required
              />
            </div>
          </div>

          {/* Message Textareas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                സന്ദേശം (Malayalam Message) *
              </label>
              <textarea
                value={messageMl}
                onChange={(e) => setMessageMl(e.target.value)}
                rows={3}
                placeholder="മുന്നറിയിപ്പ് വിശദാംശങ്ങളും സുരക്ഷാ നിർദ്ദേശങ്ങളും..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                English Message *
              </label>
              <textarea
                value={messageEn}
                onChange={(e) => setMessageEn(e.target.value)}
                rows={3}
                placeholder="Detailed warning and citizen safety directives..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-red-500"
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              റദ്ദാക്കുക (Cancel)
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  പ്രക്ഷേപണം ചെയ്യുന്നു...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  പ്രക്ഷേപണം ചെയ്യുക (Broadcast)
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
