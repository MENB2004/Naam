import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  MessageSquareQuote,
  RotateCcw,
} from 'lucide-react';
import { ComplaintUpdate, ComplaintStatus } from '../../types/complaint';
import { StatusBadge } from '../../components/common/StatusBadge';

interface ComplaintTimelineProps {
  updates: ComplaintUpdate[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ updates }) => {
  if (!updates || updates.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-500">
        നടപടിക്രമങ്ങളുടെ വിവരങ്ങൾ ലഭ്യമല്ല.
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {updates.map((update, idx) => {
        const isLatest = idx === updates.length - 1;
        const isRejected = update.new_status === 'REJECTED';
        const isResolved = update.new_status === 'RESOLVED';
        const isAppeal = update.new_status === 'APPEALED';

        return (
          <div key={update.id || idx} className="relative flex items-start space-x-3.5 group">
            {/* Timeline Circle Marker */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition shadow-sm ${
                isLatest
                  ? 'bg-[#087C63] text-white ring-4 ring-[#E8F5EE]'
                  : isResolved
                  ? 'bg-emerald-600 text-white'
                  : isRejected
                  ? 'bg-red-600 text-white'
                  : isAppeal
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-white'
              }`}
            >
              {isResolved ? (
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : isRejected ? (
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : isAppeal ? (
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </div>

            {/* Content Card */}
            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                <div className="flex items-center space-x-2">
                  <StatusBadge status={update.new_status as ComplaintStatus} size="sm" />
                  {update.previous_status && update.previous_status !== 'NONE' && (
                    <span className="text-[11px] text-slate-400 flex items-center">
                      (മുമ്പ്: <span className="font-semibold ml-1">{update.previous_status}</span>)
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>
                    {new Date(update.created_at).toLocaleString('ml-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>

              {/* Remarks Box */}
              {update.remarks && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed flex items-start space-x-2">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="italic">{update.remarks}</span>
                </div>
              )}

              {/* Officer / Author Attribution */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>രേഖപ്പെടുത്തിയത്: <strong className="text-slate-700">{update.author_name || 'സിസ്റ്റം അഡ്മിൻ'}</strong></span>
                </span>
                {isLatest && (
                  <span className="text-[10px] font-semibold text-[#087C63] bg-[#E8F5EE] px-2 py-0.5 rounded">
                    ഏറ്റവും പുതിയ നടപടി
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
