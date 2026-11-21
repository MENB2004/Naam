import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { AuditLog } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/ui/button';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAuditLogs(actionFilter);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const getActionBadge = (action: string) => {
    if (action.includes('ROLE')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (action.includes('STATUS')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (action.includes('CREATE')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              സുരക്ഷാ ഓഡിറ്റ് ലോഗുകൾ (Security Audit Logs)
            </h3>
            <p className="text-[10px] text-slate-500">
              അഡ്മിനിസ്ട്രേറ്റീവ് നടപടികളുടെ അനിഷേധ്യമായ ഓഡിറ്റ് റെക്കോർഡുകൾ
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 font-semibold"
          >
            <option value="ALL">എല്ലാ നടപടികളും (All Actions)</option>
            <option value="ADMIN_ROLE_CHANGE">റോൾ മാറ്റം (Role Changes)</option>
            <option value="ADMIN_USER_STATUS_TOGGLE">അക്കൗണ്ട് സ്റ്റാറ്റസ് (Status Toggles)</option>
            <option value="ADMIN_CREATE_DEPARTMENT">വകുപ്പ് സൃഷ്ടിക്കൽ (Dept Creation)</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            disabled={isLoading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            റിഫ്രഷ്
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">സമയം (Timestamp)</th>
                <th className="py-3 px-4">നടപടി (Action)</th>
                <th className="py-3 px-4">ഉപയോക്താവ് (Actor)</th>
                <th className="py-3 px-4">ലക്ഷ്യം (Entity)</th>
                <th className="py-3 px-4">IP വിലാസം</th>
                <th className="py-3 px-4">വിശദാംശങ്ങൾ (Details)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    ഓഡിറ്റ് ലോഗുകൾ ഒന്നും കണ്ടെത്തിയില്ല.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('ml-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 text-xs">{log.user_name || 'System'}</div>
                      <div className="text-[10px] text-slate-500">{log.user_email || 'automated'}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 text-xs">
                      <span className="font-semibold">{log.entity_name}</span>
                      {log.entity_id && (
                        <div className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                          {log.entity_id}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {log.ip_address || '127.0.0.1'}
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-slate-600 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
