import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, Check, FileText, RefreshCw } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { usePublicSummary } from './PublicSummaryContext';

const CATEGORY_NAMES: Record<string, { en: string; ml: string }> = {
  WASTE: { en: 'Waste management', ml: 'മാലിന്യ നിയന്ത്രണം' },
  WATER_POLLUTION: { en: 'Water pollution', ml: 'ജല മലിനീകരണം' },
  DRAINAGE: { en: 'Drainage and sewage', ml: 'ഓടയും മലിനജലവും' },
  FLOODING: { en: 'Flooding', ml: 'വെള്ളപ്പൊക്കം / വെള്ളക്കെട്ട്' },
  AIR_POLLUTION: { en: 'Air pollution', ml: 'വായു മലിനീകരണം' },
  DEFORESTATION: { en: 'Forest and wetland loss', ml: 'വന-തണ്ണീർത്തട നാശം' },
  ILLEGAL_MINING: { en: 'Illegal mining', ml: 'അനധികൃത ഖനനം' },
  OTHER: { en: 'Other issues', ml: 'മറ്റ് പ്രശ്നങ്ങൾ' },
};

const STATUS_NAMES: Record<string, { en: string; ml: string }> = {
  SUBMITTED: { en: 'Submitted', ml: 'സമർപ്പിച്ചു' },
  VERIFIED: { en: 'Verified', ml: 'പരിശോധിച്ചു' },
  ASSIGNED: { en: 'Assigned', ml: 'ചുമതലപ്പെടുത്തി' },
  IN_PROGRESS: { en: 'In progress', ml: 'നടപടിയിൽ' },
  ACTION_TAKEN: { en: 'Action taken', ml: 'നടപടി സ്വീകരിച്ചു' },
  RESOLVED: { en: 'Resolved', ml: 'പരിഹരിച്ചു' },
  REJECTED: { en: 'Closed', ml: 'അടച്ചു' },
  APPEALED: { en: 'Appealed', ml: 'അപ്പീൽ നൽകി' },
};

export function EnvironmentalDashboardPreview() {
  const { i18n } = useTranslation();
  const isMalayalam = i18n.resolvedLanguage?.startsWith('ml') ?? true;
  const { summary, isLoading, hasError, updatedAt, refresh: loadSummary } = usePublicSummary();

  const number = new Intl.NumberFormat(isMalayalam ? 'ml-IN' : 'en-IN');
  const dateTime = updatedAt ? new Intl.DateTimeFormat(isMalayalam ? 'ml-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit' }).format(updatedAt) : '';
  const cards = [
    { label: isMalayalam ? 'ആകെ പൊതുപരാതികൾ' : 'Public reports', value: summary?.total_complaints, icon: FileText, tone: 'text-primary bg-primary/10' },
    { label: isMalayalam ? 'പരിഹരിച്ചത്' : 'Resolved', value: summary?.resolved_complaints, icon: Check, tone: 'text-secondary bg-secondary/10' },
    { label: isMalayalam ? 'നടപടി പുരോഗമിക്കുന്നത്' : 'Active cases', value: summary?.active_complaints, icon: AlertTriangle, tone: 'text-warning bg-warning/10' },
    { label: isMalayalam ? 'സജീവ വിഭാഗങ്ങൾ' : 'Active categories', value: summary?.active_categories, icon: Activity, tone: 'text-accent bg-accent/10' },
  ];
  const maxCategoryCount = Math.max(1, ...(summary?.categories.map((category) => category.count) ?? []));

  return (
    <section aria-label={isMalayalam ? 'NAAM തത്സമയ പൊതുഡാഷ്ബോർഡ്' : 'NAAM live public dashboard'} className="dashboard-preview overflow-hidden rounded-xl bg-background text-foreground">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-3 py-3 md:px-5">
        <Logo height={30} showLink={false} className="shrink-0" />
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${hasError ? 'bg-warning' : summary ? 'bg-primary' : 'bg-muted-foreground'}`} />
          <span>{hasError ? (isMalayalam ? 'അപ്‌ഡേറ്റ് ലഭ്യമല്ല' : 'Update unavailable') : (isMalayalam ? 'തത്സമയ പൊതുവിവരങ്ങൾ' : 'Live public data')}</span>
          <button type="button" onClick={() => void loadSummary()} aria-label={isMalayalam ? 'വിവരങ്ങൾ പുതുക്കുക' : 'Refresh data'} className="ml-1 rounded-md p-1.5 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><RefreshCw size={13} className={isLoading ? 'animate-spin' : ''}/></button>
        </div>
      </div>

      <div className="p-3 md:p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div><p className="text-[10px] font-medium text-primary">{isMalayalam ? 'പൊതുവായി പങ്കിട്ട പരാതികളുടെ സംഗ്രഹം' : 'Summary of publicly shared reports'}</p><h3 className="ml-display mt-1 text-base font-bold md:text-lg">{isMalayalam ? 'കേരള പരിസ്ഥിതി റിപ്പോർട്ടുകൾ' : 'Kerala environmental reports'}</h3></div>
          <span className="text-[9px] text-muted-foreground">{dateTime ? `${isMalayalam ? 'അപ്‌ഡേറ്റ്' : 'Updated'} ${dateTime}` : isMalayalam ? 'വിവരം ലോഡ് ചെയ്യുന്നു' : 'Loading data'}</span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-lg border border-border/80 bg-background p-2.5 md:p-3">
              <div className="flex items-start justify-between gap-1"><span className="text-[10px] leading-relaxed text-muted-foreground">{label}</span><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${tone}`}><Icon size={12}/></span></div>
              <p className="mt-1 text-lg font-semibold tabular-nums">{value === undefined ? isLoading ? <span className="inline-block h-5 w-10 animate-pulse rounded bg-muted align-middle" aria-label="Loading"/> : '—' : number.format(value)}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[.8fr_1.2fr]">
          <section className="rounded-lg border border-border/80 bg-background p-3" aria-labelledby="category-summary-title">
            <h4 id="category-summary-title" className="text-xs font-semibold">{isMalayalam ? 'വിഭാഗം തിരിച്ചുള്ള പരാതികൾ' : 'Reports by category'}</h4>
            <p className="mb-3 mt-0.5 text-[9px] text-muted-foreground">{isMalayalam ? 'പൊതുവായി പങ്കിട്ട പരാതികൾ മാത്രം' : 'Public reports only'}</p>
            {isLoading && !summary ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-5 animate-pulse rounded bg-muted"/>)}</div> : summary?.categories.length ? <ul className="space-y-2">
              {[...summary.categories].sort((a, b) => b.count - a.count).map(({ category, count }) => <li key={category} className="text-[10px]">
                <div className="mb-1 flex items-center justify-between gap-2"><span className="truncate">{CATEGORY_NAMES[category]?.[isMalayalam ? 'ml' : 'en'] ?? category}</span><span className="tabular-nums text-muted-foreground">{number.format(count)}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(3, count / maxCategoryCount * 100)}%` }}/></div>
              </li>)}
            </ul> : <p className="rounded-lg bg-muted/50 p-3 text-[10px] leading-relaxed text-muted-foreground">{hasError ? (isMalayalam ? 'സംഗ്രഹം ലഭ്യമല്ല. വീണ്ടും ശ്രമിക്കുക.' : 'Summary unavailable. Please try again.') : (isMalayalam ? 'ഇതുവരെ പൊതുപരാതികളൊന്നുമില്ല.' : 'No public reports yet.')}</p>}
          </section>

          <section className="overflow-hidden rounded-lg border border-border/80 bg-background" aria-labelledby="recent-reports-title">
            <div className="flex items-center justify-between border-b border-border/70 px-3 py-2"><div><h4 id="recent-reports-title" className="text-xs font-semibold">{isMalayalam ? 'പുതിയ റിപ്പോർട്ടുകൾ' : 'Recent reports'}</h4><p className="text-[9px] text-muted-foreground">{isMalayalam ? 'പേര് അല്ലെങ്കിൽ ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ കാണിക്കില്ല' : 'Names and contact details are not shown'}</p></div><FileText size={14} className="text-primary"/></div>
            {isLoading && !summary ? <div className="space-y-2 p-3">{[1, 2, 3].map((item) => <div key={item} className="h-8 animate-pulse rounded bg-muted"/>)}</div> : summary?.recent_reports.length ? <ul className="divide-y divide-border/70">
              {summary.recent_reports.map((report) => <li key={`${report.category}-${report.district}-${report.created_at}`} className="flex min-w-0 items-center justify-between gap-3 px-3 py-2 text-[10px]">
                <div className="min-w-0"><p className="truncate font-medium">{CATEGORY_NAMES[report.category]?.[isMalayalam ? 'ml' : 'en'] ?? report.category}</p><p className="mt-0.5 truncate text-muted-foreground">{report.district} · {new Intl.DateTimeFormat(isMalayalam ? 'ml-IN' : 'en-IN').format(new Date(report.created_at))}</p></div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[9px] text-muted-foreground">{STATUS_NAMES[report.current_status]?.[isMalayalam ? 'ml' : 'en'] ?? report.current_status}</span>
              </li>)}
            </ul> : <p className="p-4 text-[10px] text-muted-foreground">{hasError ? (isMalayalam ? 'റിപ്പോർട്ടുകൾ ലോഡ് ചെയ്യാനായില്ല.' : 'Could not load reports.') : (isMalayalam ? 'പുതിയ പൊതുറിപ്പോർട്ടുകളില്ല.' : 'No recent public reports.')}</p>}
          </section>
        </div>
        {hasError && summary && <p role="status" className="mt-3 text-right text-[9px] text-warning">{isMalayalam ? 'പുതിയ വിവരം ലഭ്യമല്ല; അവസാനമായി ലഭിച്ച വിവരം കാണിക്കുന്നു.' : 'Latest update unavailable; showing the last available data.'}</p>}
      </div>
    </section>
  );
}
