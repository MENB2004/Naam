import React, { useEffect, useState } from 'react';
import {
  X,
  UserCheck,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Complaint } from '../../types/complaint';
import { Officer } from '../../types/assignment';
import { complaintService } from '../../services/complaintService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface AssignOfficerModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Complaint) => void;
}

export const AssignOfficerModal: React.FC<AssignOfficerModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('2');
  const [customDeadline, setCustomDeadline] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      complaintService
        .getAvailableOfficers()
        .then((data) => {
          setOfficers(data);
          if (data.length > 0 && !selectedOfficerId) {
            setSelectedOfficerId(data[0].id);
          }
        })
        .catch((err) => {
          console.error('Failed to load officers', err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficerId) {
      setError('ദയവായി ഒരു ഫീൽഡ് ഓഫീസറെ തിരഞ്ഞെടുക്കുക.');
      return;
    }

    setIsLoading(true);
    setError(null);

    let calculatedDeadline: string | undefined = undefined;
    if (customDeadline) {
      calculatedDeadline = new Date(customDeadline).toISOString();
    } else {
      const days = parseInt(deadlineDays, 10) || 2;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      calculatedDeadline = targetDate.toISOString();
    }

    try {
      const updated = await complaintService.assignOfficer(complaint.id, {
        assigned_to_id: selectedOfficerId,
        deadline: calculatedDeadline,
        instructions: instructions.trim() || undefined,
      });
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'ഓഫീസറെ ചുമതലപ്പെടുത്തുന്നതിൽ പിശക് സംഭവിച്ചു.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">ഫീൽഡ് ഓഫീസറെ ചുമതലപ്പെടുത്തുക</h3>
              <span className="font-mono text-[11px] text-[#087C63] font-semibold">{complaint.tracking_code}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-[#F0F7FA] rounded-xl text-xs space-y-1">
            <span className="text-slate-500 font-medium">പരാതി വിഷയം:</span>
            <div className="font-bold text-slate-900 line-clamp-1">{complaint.title}</div>
            <div className="text-[11px] text-slate-500">
              സ്ഥലം: {complaint.location.district}, {complaint.location.lsgd_name}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ഫീൽഡ് ഓഫീസറെ തിരഞ്ഞെടുക്കുക (Select Field Officer) *
            </label>
            <select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white focus:ring-2 focus:ring-blue-600"
              required
            >
              {officers.map((off) => (
                <option key={off.id} value={off.id}>
                  {off.full_name} — {off.department_name_ml || 'ഹെൽത്ത് / എൻജിനീയറിംഗ് വിങ്'}
                </option>
              ))}
              {officers.length === 0 && (
                <option value="">ഓഫീസർമാരെ കണ്ടെത്താനായില്ല</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              പരിഹാര സമയപരിധി (SLA Resolution Deadline)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { value: '1', label: '24 മണിക്കൂർ' },
                { value: '2', label: '48 മണിക്കൂർ' },
                { value: '7', label: '7 ദിവസം' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setDeadlineDays(opt.value);
                    setCustomDeadline('');
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    deadlineDays === opt.value && !customDeadline
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <Input
              type="datetime-local"
              placeholder="മറ്റൊരു തീയതി തിരഞ്ഞെടുക്കുക"
              value={customDeadline}
              onChange={(e) => setCustomDeadline(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ഫീൽഡ് ഉദ്യോഗസ്ഥനുള്ള നിർദ്ദേശങ്ങൾ (Special Instructions)
            </label>
            <textarea
              rows={3}
              placeholder="ഉദാ: സ്ഥലത്തെത്തി സാമ്പിൾ ശേഖരിക്കുക, ഹരിതകർമ്മസേനയെ നിയോഗിക്കുക..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              റദ്ദാക്കുക
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || !selectedOfficerId}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {isLoading ? 'ചുമതലപ്പെടുത്തുന്നു...' : 'ഓഫീസറെ ചുമതലപ്പെടുത്തുക'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
