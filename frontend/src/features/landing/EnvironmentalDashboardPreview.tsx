import {
  Activity, AlertTriangle, Bell, Building2, Check, ChevronDown, CircleHelp,
  Droplets, FileText, LayoutDashboard, Map, Search, ShieldCheck,
  Sprout, Waves, Wind, UserRound, Users, Recycle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const stats = [
  { label: 'Reported issues', value: '128', icon: FileText, tone: 'text-primary bg-primary/10' },
  { label: 'Resolved issues', value: '86', icon: Check, tone: 'text-secondary bg-secondary/10' },
  { label: 'Pending complaints', value: '42', icon: AlertTriangle, tone: 'text-brand-amber bg-brand-amber/10' },
  { label: 'Active departments', value: '6', icon: Building2, tone: 'text-accent bg-accent/10' },
];

const records = [
  ['Nov 18', 'Waste accumulation', 'Sample Location A', 'Municipality', 'Pending', 'bg-brand-amber/10 text-brand-amber'],
  ['Nov 16', 'Water pollution', 'Sample Location B', 'Water Authority', 'Under review', 'bg-accent/10 text-accent'],
  ['Nov 14', 'Blocked drainage', 'Sample Location C', 'Municipality', 'In progress', 'bg-secondary/10 text-secondary'],
  ['Nov 12', 'Flooding report', 'Sample Location D', 'Disaster Management', 'Resolved', 'bg-primary/10 text-primary'],
];

const workspaceItems: Array<[LucideIcon, string]> = [
  [LayoutDashboard, 'Overview'], [FileText, 'Complaints'], [Map, 'Environmental map'],
  [Waves, 'Water monitoring'], [Recycle, 'Waste management'], [Building2, 'Departments'],
];
const monitoringItems: Array<[LucideIcon, string]> = [
  [Droplets, 'Water quality'], [Activity, 'Pollution reports'], [Users, 'Field inspections'], [AlertTriangle, 'Alerts'],
];

function TrendChart() {
  return <svg viewBox="0 0 520 110" className="h-24 w-full" role="img" aria-label="Illustrative thirty-day environmental report trends">
    <defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="hsl(var(--primary))" stopOpacity=".22"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0"/></linearGradient></defs>
    {[25, 55, 85].map(y => <path key={y} d={`M0 ${y}H520`} stroke="hsl(var(--border))" strokeDasharray="3 5"/>)}
    <path d="M0 79 C38 65 43 74 80 60 S124 66 160 48 S213 58 250 41 S300 48 338 34 S391 46 425 27 S479 37 520 15 V110 H0Z" fill="url(#area)"/>
    <path d="M0 79 C38 65 43 74 80 60 S124 66 160 48 S213 58 250 41 S300 48 338 34 S391 46 425 27 S479 37 520 15" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M0 94 C38 89 45 94 80 82 S126 87 160 75 S215 82 250 65 S300 72 338 62 S391 71 425 56 S478 64 520 48" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}

export function EnvironmentalDashboardPreview() {
  return <div aria-label="Illustrative NAAM monitoring dashboard preview" className="dashboard-preview select-none">
    <div className="flex h-12 items-center justify-between border-b border-border/70 px-4 md:px-5">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground"><span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-white"><Sprout size={15}/></span><span>NAAM <span className="ml-1 font-malayalam text-muted-foreground">നാം</span></span><ChevronDown size={13} className="text-muted-foreground"/></div>
      <div className="hidden w-[42%] items-center gap-2 rounded-lg border border-border bg-white/70 px-3 py-1.5 text-[10px] text-muted-foreground sm:flex"><Search size={13}/>Search complaints, locations...<span className="ml-auto rounded border border-border px-1.5">⌘K</span></div>
      <div className="flex items-center gap-2"><span className="hidden rounded-full bg-primary px-3 py-1.5 text-[10px] font-medium text-white sm:inline-flex">Report issue</span><Bell size={15} className="text-muted-foreground"/><span className="grid h-7 w-7 place-items-center rounded-full bg-secondary/15 text-secondary"><UserRound size={14}/></span></div>
    </div>
    <div className="flex">
      <aside className="hidden w-40 shrink-0 border-r border-border/70 bg-secondary/10 p-3 md:block">
        <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Workspace</p>
        {workspaceItems.map(([Icon,label],i) => <div key={label} className={`mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] ${i===0?'bg-white font-semibold text-primary shadow-sm':'text-muted-foreground'}`}><Icon size={12}/>{label}{i===1&&<span className="ml-auto rounded-full bg-primary/10 px-1.5 text-[9px] text-primary">10</span>}</div>)}
        <p className="mb-2 mt-5 px-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Monitoring</p>
        {monitoringItems.map(([Icon,label])=><div key={label} className="mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-muted-foreground"><Icon size={12}/>{label}</div>)}
      </aside>
      <main className="min-w-0 flex-1 p-3 md:p-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><p className="text-[9px] uppercase tracking-wider text-muted-foreground">Demonstration data · not live</p><h3 className="text-sm font-semibold text-foreground md:text-base">Welcome to NAAM</h3><p className="text-[10px] text-muted-foreground">Environmental monitoring overview</p></div><div className="flex gap-1.5"><span className="rounded-md bg-primary px-2.5 py-1.5 text-[9px] font-medium text-white">Report issue</span><span className="hidden rounded-md border border-border bg-white px-2.5 py-1.5 text-[9px] text-foreground sm:inline-flex">View map</span><span className="hidden rounded-md border border-border bg-white px-2.5 py-1.5 text-[9px] text-foreground lg:inline-flex">Water quality</span></div></div>
        <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">{stats.map(({label,value,icon:Icon,tone})=><div key={label} className="rounded-lg border border-border/80 bg-white/85 p-2.5 md:p-3"><div className="flex items-center justify-between"><span className="text-[9px] text-muted-foreground">{label}</span><span className={`grid h-6 w-6 place-items-center rounded-md ${tone}`}><Icon size={12}/></span></div><p className="mt-1 text-base font-semibold text-foreground">{value}</p></div>)}</div>
        <div className="mb-3 grid gap-2 lg:grid-cols-[1.05fr_1fr]"><section className="rounded-lg border border-border/80 bg-white/85 p-3"><div className="mb-2 flex items-start justify-between"><div><h4 className="text-[11px] font-semibold text-foreground">Water quality monitoring</h4><p className="text-[9px] text-muted-foreground">Sample values · illustrative only</p></div><Droplets size={15} className="text-accent"/></div><div className="grid grid-cols-4 gap-1 text-center"><div><b className="text-xs text-primary">78</b><p className="text-[8px] text-muted-foreground">Quality index</p></div><div><b className="text-xs text-foreground">7.2</b><p className="text-[8px] text-muted-foreground">pH</p></div><div><b className="text-xs text-foreground">2.1</b><p className="text-[8px] text-muted-foreground">Turbidity</p></div><div><b className="text-xs text-foreground">6.8</b><p className="text-[8px] text-muted-foreground">Dissolved oxygen</p></div></div><div className="mt-1"><TrendChart/></div><p className="text-right text-[8px] text-muted-foreground">Demo readings · last updated just now</p></section>
          <section className="rounded-lg border border-border/80 bg-white/85 p-3"><div className="mb-2 flex items-center justify-between"><div><h4 className="text-[11px] font-semibold text-foreground">Environmental reports</h4><p className="text-[9px] text-muted-foreground">Illustrative 30-day trend</p></div><Wind size={15} className="text-secondary"/></div><TrendChart/><div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[8px] text-muted-foreground"><span>● Waste management</span><span className="text-accent">● Water pollution</span><span className="text-brand-amber">● Drainage</span><span className="text-secondary">● Flood reports</span></div></section></div>
        <section className="overflow-hidden rounded-lg border border-border/80 bg-white/90"><div className="flex items-center justify-between border-b border-border/70 px-3 py-2"><div><h4 className="text-[11px] font-semibold text-foreground">Recent environmental reports</h4><p className="text-[8px] text-muted-foreground">Fictional sample records</p></div><ShieldCheck size={14} className="text-primary"/></div><div className="grid grid-cols-[1.2fr_1.1fr_auto] gap-2 bg-muted/70 px-3 py-1.5 text-[8px] font-medium text-muted-foreground sm:grid-cols-[.7fr_1.3fr_1.2fr_1fr_auto]"><span className="hidden sm:block">Date</span><span>Issue</span><span>Location</span><span className="hidden sm:block">Department</span><span>Status</span></div>{records.map(([date,issue,location,department,status,tone])=><div key={issue} className="grid grid-cols-[1.2fr_1.1fr_auto] gap-2 border-t border-border/50 px-3 py-1.5 text-[8px] text-foreground sm:grid-cols-[.7fr_1.3fr_1.2fr_1fr_auto]"><span className="hidden text-muted-foreground sm:block">{date}</span><span className="truncate">{issue}</span><span className="truncate text-muted-foreground">{location}</span><span className="hidden truncate text-muted-foreground sm:block">{department}</span><span className={`rounded-full px-1.5 py-0.5 ${tone}`}>{status}</span></div>)}</section>
      </main>
    </div>
    <div className="flex items-center gap-3 border-t border-border/70 px-4 py-2 text-[9px] text-muted-foreground md:hidden"><CircleHelp size={12}/> Demo preview · monitoring tools</div>
  </div>;
}
