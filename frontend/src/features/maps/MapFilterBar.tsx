import React from 'react';
import { Filter, X, Search, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { MapFilters } from '../../types/map';

interface MapFilterBarProps {
  filters: MapFilters;
  onChange: (newFilters: MapFilters) => void;
  onReset: () => void;
  totalPoints: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export const KERALA_DISTRICTS = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod',
];

const DISTRICT_ML_MAP: Record<string, string> = {
  Thiruvananthapuram: 'തിരുവനന്തപുരം',
  Kollam: 'കൊല്ലം',
  Pathanamthitta: 'പത്തനംതിട്ട',
  Alappuzha: 'ആലപ്പുഴ',
  Kottayam: 'കോട്ടയം',
  Idukki: 'ഇടുക്കി',
  Ernakulam: 'എറണാകുളം',
  Thrissur: 'തൃശ്ശൂർ',
  Palakkad: 'പാലക്കാട്',
  Malappuram: 'മലപ്പുറം',
  Kozhikode: 'കോഴിക്കോട്',
  Wayanad: 'വയനാട്',
  Kannur: 'കണ്ണൂർ',
  Kasaragod: 'കാസർഗോഡ്',
};

const CATEGORIES = [
  { value: 'ALL', labelMl: 'എല്ലാ വിഭാഗങ്ങളും', labelEn: 'All Categories' },
  { value: 'WASTE', labelMl: 'മാലിന്യ നിക്ഷേപം', labelEn: 'Waste' },
  { value: 'WATER_POLLUTION', labelMl: 'ജല മലിനീകരണം', labelEn: 'Water' },
  { value: 'DRAINAGE', labelMl: 'ഡ്രെയിനേജ് തടസ്സം', labelEn: 'Drainage' },
  { value: 'AIR_POLLUTION', labelMl: 'വായു മലിനീകരണം', labelEn: 'Air' },
  { value: 'DEFORESTATION', labelMl: 'വനനശീകരണം / കണ്ടൽ', labelEn: 'Deforestation' },
  { value: 'ILLEGAL_MINING', labelMl: 'അനധികൃത ഖനനം', labelEn: 'Mining' },
  { value: 'OTHER', labelMl: 'മറ്റുള്ളവ', labelEn: 'Other' },
];

export const MapFilterBar: React.FC<MapFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  totalPoints,
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-4 transition-all max-w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">മാപ്പ് ഫിൽട്ടറുകൾ (Filter Map)</h3>
            <p className="text-[10px] text-slate-500">കണ്ടെത്തിയ പരാതികൾ: {totalPoints}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 px-2 text-xs text-slate-600 hover:text-emerald-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            റിഫ്രഷ്
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-xs text-red-600 hover:bg-red-50"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            റീസെറ്റ്
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            തിരയുക (Search Title / ID)
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="കീവേഡ് ടൈപ്പ് ചെയ്യുക..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            വിഭാഗം (Category)
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white font-medium"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.labelMl} ({c.labelEn})
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            പരാതി നില (Status)
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white font-medium"
          >
            <option value="ACTIVE">സജീവം (Active / In Progress)</option>
            <option value="RESOLVED">പരിഹരിച്ചവ (Resolved)</option>
            <option value="ALL">എല്ലാം കാണിക്കുക (All Statuses)</option>
          </select>
        </div>

        {/* District Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            ജില്ല (District)
          </label>
          <select
            value={filters.district}
            onChange={(e) => onChange({ ...filters, district: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white font-medium"
          >
            <option value="ALL">എല്ലാ ജില്ലകളും (All Kerala)</option>
            {KERALA_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {DISTRICT_ML_MAP[d] || d} ({d})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
