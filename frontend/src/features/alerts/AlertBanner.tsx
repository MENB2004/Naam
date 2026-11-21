import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  X,
  ChevronRight,
  ChevronLeft,
  Volume2,
} from 'lucide-react';
import { alertService } from '../../services/alertService';
import { Alert } from '../../types/alert';

export const AlertBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadAlerts = async () => {
      try {
        const data = await alertService.getAlerts();
        if (isMounted && data && data.length > 0) {
          setAlerts(data);
        }
      } catch {
        // Silent fail for public alerts banner
      }
    };

    loadAlerts();
    const interval = setInterval(loadAlerts, 60000); // Check for new emergency alerts every 60s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (dismissed || alerts.length === 0) {
    return null;
  }

  const currentAlert = alerts[currentIndex] || alerts[0];

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'OFFICIAL_WARNING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
            <ShieldAlert className="w-3 h-3 mr-1" />
            ഔദ്യോഗിക മുന്നറിയിപ്പ് (Official Warning)
          </span>
        );
      case 'COMMUNITY_REPORT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            കമ്മ്യൂണിറ്റി മുന്നറിയിപ്പ് (Community Alert)
          </span>
        );
      case 'SIMULATED_DEMO_ALERT':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <Info className="w-3 h-3 mr-1" />
            ഡെമോ മുന്നറിയിപ്പ് (Simulated Alert)
          </span>
        );
    }
  };

  const isCritical = currentAlert.alert_level === 'CRITICAL';

  return (
    <div
      className={`relative z-40 transition-colors ${
        isCritical
          ? 'bg-red-600 text-white shadow-md'
          : currentAlert.alert_level === 'WARNING'
          ? 'bg-amber-500 text-slate-900 shadow-sm'
          : 'bg-emerald-700 text-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 animate-pulse">
            <Volume2 className="w-5 h-5 text-white" />
          </div>

          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {getSourceBadge(currentAlert.alert_source)}

            {currentAlert.affected_district && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded">
                ജില്ല: {currentAlert.affected_district}
              </span>
            )}

            <span className="text-xs sm:text-sm font-bold truncate">
              {currentAlert.title_ml} ({currentAlert.title_en})
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 text-xs">
          {alerts.length > 1 && (
            <div className="flex items-center space-x-1 mr-2 bg-black/15 px-1.5 py-0.5 rounded-full text-[11px]">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : alerts.length - 1))}
                className="hover:opacity-80 p-0.5 cursor-pointer"
                title="മുൻപത്തെ മുന്നറിയിപ്പ്"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] font-semibold">
                {currentIndex + 1}/{alerts.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev < alerts.length - 1 ? prev + 1 : 0))}
                className="hover:opacity-80 p-0.5 cursor-pointer"
                title="അടുത്ത മുന്നറിയിപ്പ്"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] underline font-semibold hover:opacity-80 cursor-pointer"
          >
            {expanded ? 'ചുരുക്കുക (Collapse)' : 'വിശദാംശങ്ങൾ (Details)'}
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-black/15 transition cursor-pointer"
            title="മുന്നറിയിപ്പ് മറയ്ക്കുക (Dismiss)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="border-t border-black/15 bg-black/10 px-4 sm:px-6 lg:px-8 py-3 text-xs leading-relaxed max-w-7xl mx-auto animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="font-bold block text-white/90">മലയാളം സന്ദേശം:</span>
              <p className="bg-white/10 p-2.5 rounded-lg">{currentAlert.message_ml}</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold block text-white/90">English Message:</span>
              <p className="bg-white/10 p-2.5 rounded-lg">{currentAlert.message_en}</p>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-white/80 flex justify-between items-center">
            <span>പുറപ്പെടുവിച്ച തീയതി: {new Date(currentAlert.created_at).toLocaleString('ml-IN')}</span>
            {currentAlert.creator_name && <span>ഉദ്യോഗസ്ഥൻ: {currentAlert.creator_name}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
