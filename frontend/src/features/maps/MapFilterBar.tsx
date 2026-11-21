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
    <div className="max-w-full rounded-2xl border border-border/80 bg-background/95 p-4 shadow-md backdrop-blur-md transition-colors">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">മാപ്പ് ഫിൽട്ടറുകൾ (Filter Map)</h3>
            <p className="text-[10px] text-muted-foreground">കണ്ടെത്തിയ പരാതികൾ: {totalPoints}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="min-h-9 px-2 text-xs text-muted-foreground hover:text-primary"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            റിഫ്രഷ്
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="min-h-9 px-2 text-xs text-critical hover:bg-critical/10"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            റീസെറ്റ്
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div>
          <label htmlFor="map-search" className="mb-1 block text-[11px] font-semibold text-muted-foreground">
            തിരയുക (Search Title / ID)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="map-search"
              type="text"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="കീവേഡ് ടൈപ്പ് ചെയ്യുക..."
              className="min-h-11 w-full rounded-lg border border-border bg-muted py-2 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/75 focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div>
          <label htmlFor="map-category" className="mb-1 block text-[11px] font-semibold text-muted-foreground">
            വിഭാഗം (Category)
          </label>
          <select
            id="map-category"
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="min-h-11 w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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
          <label htmlFor="map-status" className="mb-1 block text-[11px] font-semibold text-muted-foreground">
            പരാതി നില (Status)
          </label>
          <select
            id="map-status"
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="min-h-11 w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ACTIVE">സജീവം (Active / In Progress)</option>
            <option value="RESOLVED">പരിഹരിച്ചവ (Resolved)</option>
            <option value="ALL">എല്ലാം കാണിക്കുക (All Statuses)</option>
          </select>
        </div>

        {/* District Dropdown */}
        <div>
          <label htmlFor="map-district" className="mb-1 block text-[11px] font-semibold text-muted-foreground">
            ജില്ല (District)
          </label>
          <select
            id="map-district"
            value={filters.district}
            onChange={(e) => onChange({ ...filters, district: e.target.value })}
            className="min-h-11 w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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
