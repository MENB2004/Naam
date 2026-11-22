import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowRight, Leaf, LogOut, Menu, X, MapPin, Recycle, Droplets, Waves, CloudRain, CircleHelp } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { LanguageSwitcher, Language } from '../../components/common/LanguageSwitcher';
import { useAuthStore } from '../../store/authStore';
import { EnvironmentalDashboardPreview } from './EnvironmentalDashboardPreview';
import { usePublicSummary } from './PublicSummaryContext';
import { alertService } from '../../services/alertService';
import type { PublicAlert } from '../../types/alert';

function LandscapeBackdrop() {
  return <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-background">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_14%,hsl(var(--accent)/.17),transparent_35%),radial-gradient(ellipse_at_16%_28%,hsl(var(--secondary)/.15),transparent_38%),linear-gradient(180deg,hsl(var(--background)/.55),hsl(var(--background)/.94))]"/>
    <svg className="absolute inset-x-0 bottom-0 h-[54%] w-full opacity-50" preserveAspectRatio="xMidYMax slice" viewBox="0 0 1440 520">
      <defs><linearGradient id="hills" x1="0" x2="0" y1="0" y2="1"><stop stopColor="hsl(var(--secondary))" stopOpacity=".23"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity=".03"/></linearGradient></defs>
      <path d="M0 280 C180 220 240 300 400 220 C560 135 650 210 790 165 C980 105 1080 218 1200 150 C1300 95 1370 125 1440 86 V520 H0Z" fill="url(#hills)"/>
      <path d="M0 345 C170 275 270 352 420 292 C590 225 660 315 830 240 C1000 160 1120 270 1260 210 C1340 178 1400 205 1440 180 V520 H0Z" fill="hsl(var(--primary)/.09)"/>
      <path d="M0 415 C230 345 300 410 520 355 C720 305 870 400 1040 330 C1210 260 1330 330 1440 285 V520 H0Z" fill="hsl(var(--accent)/.08)"/>
    </svg>
    <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/25 to-background/75"/>
  </div>;
}

export function HeroSection() {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('naam_language') === 'en' ? 'en' : 'ml');
  const { t: translate, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const reducedMotion = useReducedMotion();
  const t = {
    nav: translate('hero.nav', { returnObjects: true }) as string[],
    badge: translate('hero.badge'), headingA: translate('hero.headingA'), headingB: translate('hero.headingB'),
    body: translate('hero.body'), report: translate('hero.report'), how: translate('hero.how'),
  };
  const transition = (delay: number) => reducedMotion ? { duration: 0 } : { duration: 0.6, delay, ease: 'easeOut' as const };
  const links = ['#home', '#about', '#how', '#issues', '/map', '#contact'];
  const officialPortalUrl = (import.meta as any).env?.VITE_OFFICIAL_PORTAL_URL || '/official/login';
  const changeLanguage = (next: Language) => { setLanguage(next); void i18n.changeLanguage(next); };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <section id="home" className="relative flex min-h-screen min-h-[100svh] flex-col overflow-hidden bg-background">
    <LandscapeBackdrop />
    <header className="relative z-30 flex shrink-0 items-center justify-between px-5 py-4 md:px-12 md:py-5 lg:px-20">
      <Logo height={40} className="h-9 md:h-11" />
      <nav lang={language} aria-label="Main navigation" className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex xl:gap-7">
        {t.nav.map((label, i) => i === 4
          ? <Link key={label} to="/map" className="whitespace-nowrap transition-colors hover:text-primary">{label}</Link>
          : <a key={label} href={links[i]} className="whitespace-nowrap transition-colors hover:text-primary">{label}</a>)}
      </nav>
      <div className="flex items-center gap-2 md:gap-3">
        {isAuthenticated && user && <div className="hidden items-center gap-2 md:flex"><span className="max-w-36 truncate text-xs text-muted-foreground">{user.fullName}</span><button type="button" onClick={() => logout()} aria-label={translate('hero.logout')} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white/60 text-muted-foreground hover:text-primary"><LogOut size={15}/></button></div>}
        <div className="hidden sm:block"><LanguageSwitcher currentLang={language} onLanguageChange={changeLanguage} className="border-border/80 bg-background/80 text-foreground shadow-none"/></div>
        <Link to="/login" className="hidden rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted sm:inline-flex">{translate('hero.signIn')}</Link>
        <button type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background/80 text-foreground lg:hidden">{menuOpen ? <X size={18}/> : <Menu size={18}/>}</button>
        <button type="button" onClick={() => navigate('/community/report')} className="hidden rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 sm:inline-flex md:px-5 md:text-sm">{language === 'ml' ? 'റിപ്പോർട്ട് ചെയ്യുക' : 'Report an Issue'}</button>
      </div>
      <AnimatePresence>{menuOpen && <motion.div initial={reducedMotion ? false : {opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={reducedMotion ? undefined : {opacity:0,y:-8}} transition={{duration:reducedMotion ? 0 : .18}} className="absolute left-4 right-4 top-[calc(100%-4px)] z-40 rounded-2xl border border-border bg-background/95 p-3 shadow-xl backdrop-blur-xl lg:hidden">
        <nav lang={language} className="flex flex-col">{t.nav.map((label,i)=>i===4?<Link key={label} to="/map" onClick={()=>setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted">{label}</Link>:<a key={label} href={links[i]} onClick={()=>setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted">{label}</a>)}</nav>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3"><LanguageSwitcher currentLang={language} onLanguageChange={changeLanguage}/><div className="flex flex-wrap items-center gap-2">{isAuthenticated && user && <button type="button" onClick={() => logout()} className="rounded-full border border-border px-3 py-2 text-[11px] text-muted-foreground">{translate('hero.logout')}</button>}<Link to="/login" onClick={()=>setMenuOpen(false)} className="rounded-full border border-border px-3 py-2 text-[11px] font-semibold text-foreground">{translate('hero.signIn')}</Link><a href={officialPortalUrl} className="rounded-full border border-border px-3 py-2 text-[11px] font-semibold text-muted-foreground">{translate('hero.officialAccess')}</a><button type="button" onClick={()=>navigate('/community/report')} className="rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">{t.report}</button></div></div>
      </motion.div>}</AnimatePresence>
    </header>

    <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col items-center overflow-hidden px-4 pt-2 text-center sm:px-6 sm:pt-4">
      <motion.div lang={language} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={transition(0)} className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/85 px-4 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-md md:mb-5 md:text-sm"><Leaf size={14} className="text-primary"/><span>{t.badge}</span></motion.div>
      <motion.h1 lang={language} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={transition(.1)} className={`max-w-4xl text-[clamp(2rem,5.2vw,4.5rem)] font-bold leading-[1.35] tracking-normal text-foreground md:leading-[1.3] ${language === 'ml' ? 'ml-display' : 'font-display font-normal'}`}>
        {language === 'ml' ? <>{t.headingA}<br className="hidden sm:block"/><span className="text-primary"> {t.headingB}</span></> : <>{t.headingA}<br/><span className="font-display text-[1.12em] font-normal italic text-primary">{t.headingB}</span></>}
      </motion.h1>
      <motion.p lang={language} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={transition(.2)} className="mt-3 max-w-[650px] text-sm leading-[1.8] text-muted-foreground md:mt-4 md:text-base">{t.body}</motion.p>
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={transition(.3)} className="mt-4 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row sm:gap-3 md:mt-5">
        <button type="button" onClick={() => navigate('/community/report')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-primary/90"><Leaf size={16}/>{t.report}<ArrowRight size={15}/></button>
        <button type="button" onClick={() => navigate('/map')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-300 bg-white/80 px-6 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur transition hover:bg-white hover:text-emerald-900"><MapPin size={16}/>{translate('hero.liveMap')}</button>
        <a href="#how" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-white/55 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur transition hover:bg-white/85"><ArrowDown size={15}/>{t.how}</a>
      </motion.div>
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={reducedMotion?{duration:0}:{duration:.8,delay:.5,ease:'easeOut'}} className="mt-5 w-full max-w-5xl shrink-0 pb-8 sm:mt-7 md:mt-8">
        <div className="rounded-2xl border border-white/70 bg-white/45 p-2 shadow-[var(--shadow-dashboard)] backdrop-blur-xl md:p-3"><EnvironmentalDashboardPreview/></div>
      </motion.div>
    </div>
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-10 bg-gradient-to-t from-background/40 to-transparent"/>
  </section>;
}

export function LandingSections() {
  const { t: translate, i18n } = useTranslation();
  const { summary } = usePublicSummary();
  const [updates, setUpdates] = useState<PublicAlert[]>([]);
  const isMalayalam = i18n.resolvedLanguage?.startsWith('ml') ?? true;
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try { const data = await alertService.getAlerts(); if (mounted) setUpdates(data.slice(0, 3)); }
      catch { if (mounted) setUpdates([]); }
    };
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);
  const officialPortalUrl = (import.meta as any).env?.VITE_OFFICIAL_PORTAL_URL || '/official/login';
  const steps = translate('landing.steps', { returnObjects: true }) as Array<{ title: string; body: string }>;
  const categories = translate('landing.categories', { returnObjects: true }) as Array<{ title: string; description: string }>;
  return <div className="bg-background">
    <section id="about" className="mx-auto max-w-6xl px-5 py-16 md:px-6 md:py-24"><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">NAAM · നാം</p><h2 lang="ml" className="ml-display mt-3 max-w-2xl text-3xl font-bold leading-[1.4] text-foreground md:text-4xl">{translate('landing.aboutTitle')}</h2><p className="mt-4 max-w-2xl text-sm leading-[1.8] text-muted-foreground md:text-base">{translate('landing.aboutBody')}</p></section>
    <section id="how" className="border-y border-border bg-muted/40"><div className="mx-auto max-w-6xl px-5 py-14 md:px-6 md:py-20"><div className="mb-8 max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">{translate('landing.workflowLabel')}</p><h2 className="ml-display mt-2 text-2xl font-bold leading-[1.4] text-foreground md:text-3xl">{translate('landing.workflowTitle')}</h2><p className="mt-2 text-sm leading-[1.8] text-muted-foreground">{translate('landing.workflowIntro')}</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map(({title,body},i)=><article key={title} className="relative rounded-2xl border border-border bg-background p-5 shadow-sm"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">0{i+1}</span><h3 className="ml-display mt-4 text-lg font-semibold leading-[1.5] text-foreground">{title}</h3><p className="mt-2 text-sm leading-[1.8] text-muted-foreground">{body}</p></article>)}</div></div></section>
    <section id="participate" className="bg-primary text-primary-foreground"><div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-6 md:py-16"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-white/75">NAAM · COMMUNITY</p><h2 className="ml-display mt-2 text-2xl font-bold leading-[1.45] md:text-3xl">{translate('landing.joinTitle')}</h2><p className="mt-2 text-sm leading-[1.8] text-white/85">{translate('landing.joinBody')}</p></div><div className="flex flex-wrap gap-3"><Link to="/register" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-white/90">{translate('landing.register')}</Link><Link to="/community/report" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/50 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">{translate('landing.report')}</Link></div></div></section>
    <section id="issues" className="mx-auto max-w-6xl px-5 py-14 md:px-6 md:py-20"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">{translate('landing.issueLabel')}</p><h2 className="ml-display mt-2 text-2xl font-bold leading-[1.45] text-foreground md:text-3xl">{translate('landing.issueTitle')}</h2><p className="mt-2 text-sm leading-[1.8] text-muted-foreground">{translate('landing.issueIntro')}</p></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[{Icon:Recycle,color:'text-primary bg-primary/10',code:'WASTE'}, {Icon:Droplets,color:'text-accent bg-accent/10',code:'WATER_POLLUTION'}, {Icon:Waves,color:'text-secondary bg-secondary/10',code:'DRAINAGE'}, {Icon:CloudRain,color:'text-brand-blue bg-brand-blue/10',code:'FLOODING'}, {Icon:CircleHelp,color:'text-muted-foreground bg-muted',code:'OTHER'}].map(({Icon,color,code},index)=>{ const count = summary?.categories.find((item) => item.category === code)?.active_count; return <Link key={categories[index].title} to={`/community/report?category=${code}`} className="group rounded-2xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={19}/></span><h3 className="ml-display mt-3 text-sm font-semibold leading-[1.5] text-foreground">{categories[index].title}</h3><p className="mt-1 text-xs leading-[1.7] text-muted-foreground">{categories[index].description}</p><span className="mt-2 block text-[11px] text-muted-foreground">{count === undefined ? (isMalayalam ? 'പൊതു ഡാറ്റ ലോഡ് ചെയ്യുന്നു' : 'Loading public data') : isMalayalam ? `${count} സജീവ പൊതുകേസുകൾ` : `${count} active public cases`}</span><span className="mt-3 inline-flex text-xs font-semibold text-primary">{translate('landing.report')}<ArrowRight size={13} className="ml-1 transition-transform group-hover:translate-x-1"/></span></Link> })}</div></section>
    <section aria-labelledby="public-updates-title" className="border-y border-border bg-muted/35"><div className="mx-auto max-w-6xl px-5 py-12 md:px-6 md:py-16"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">{isMalayalam ? 'ഔദ്യോഗിക അറിയിപ്പുകൾ' : 'Official notices'}</p><h2 id="public-updates-title" className="ml-display mt-2 text-2xl font-bold text-foreground">{isMalayalam ? 'പരിസ്ഥിതി അപ്‌ഡേറ്റുകൾ' : 'Environmental updates'}</h2><p className="mt-2 text-sm text-muted-foreground">{isMalayalam ? 'പ്രസിദ്ധീകരിച്ച ഔദ്യോഗിക മുന്നറിയിപ്പുകൾ മാത്രം.' : 'Published official warnings only.'}</p></div></div>{updates.length ? <ul className="grid gap-3 md:grid-cols-3">{updates.map((item) => <li key={item.id} className="rounded-2xl border border-border bg-background p-4"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">{isMalayalam ? 'ഔദ്യോഗിക മുന്നറിയിപ്പ്' : 'Official warning'}</span><span className="text-[10px] text-muted-foreground">{item.affected_district || (isMalayalam ? 'കേരളം' : 'Kerala')}</span></div><h3 className="ml-display mt-3 font-semibold text-foreground">{isMalayalam ? item.title_ml : item.title_en}</h3><p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{isMalayalam ? item.message_ml : item.message_en}</p><time className="mt-4 block text-[10px] text-muted-foreground" dateTime={item.created_at}>{new Intl.DateTimeFormat(isMalayalam ? 'ml-IN' : 'en-IN', { dateStyle: 'medium' }).format(new Date(item.created_at))}</time></li>)}</ul> : <div className="rounded-2xl border border-dashed border-border bg-background/70 p-6 text-center text-sm text-muted-foreground">{isMalayalam ? 'നിലവിൽ പ്രസിദ്ധീകരിച്ച ഔദ്യോഗിക അപ്‌ഡേറ്റുകളില്ല.' : 'There are no published official updates right now.'}</div>}</div></section>
    <footer id="contact" className="border-t border-border bg-white/60"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 px-5 py-8 md:flex-row md:items-center md:px-6"><div><Logo height={34}/><p className="mt-2 text-xs text-muted-foreground">People's Environmental Monitoring and Resolution Platform · Kerala</p></div><nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"><a href="#about" className="hover:text-primary">About</a><a href="#how" className="hover:text-primary">How it works</a><a href="#issues" className="hover:text-primary">Issues</a><Link to="/map" className="font-semibold text-primary hover:text-primary/80">Public Map</Link><Link to="/login" className="hover:text-primary">Sign in</Link><Link to="/register" className="hover:text-primary">Register</Link><a href={officialPortalUrl} className="font-semibold text-foreground hover:text-primary">{translate('hero.officialAccess')}</a></nav></div></footer>
  </div>;
}
