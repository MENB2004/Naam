import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, Building2, HardHat, Leaf, LogOut, Menu, ShieldCheck, Users, X, MapPin } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { LanguageSwitcher, Language } from '../../components/common/LanguageSwitcher';
import { useAuthStore } from '../../store/authStore';
import { EnvironmentalDashboardPreview } from './EnvironmentalDashboardPreview';

const copy = {
  ml: {
    nav: ['ഹോം', 'NAAM എന്താണ്', 'എങ്ങനെ പ്രവർത്തിക്കുന്നു', 'പരിസ്ഥിതി പ്രശ്നങ്ങൾ', 'ബന്ധപ്പെടുക'],
    badge: 'കേരളത്തിന്റെ പരിസ്ഥിതി സംരക്ഷണത്തിനായി ഒരുമിച്ച്',
    headingA: 'നമ്മുടെ നാടിന്റെ പരിസ്ഥിതി സംരക്ഷണം,', headingB: 'ഇനി നമ്മുടെ കൈകളിൽ.',
    body: 'മാലിന്യ പ്രശ്നങ്ങൾ, ജലമലിനീകരണം, ഡ്രെയിനേജ് തടസ്സങ്ങൾ തുടങ്ങിയ പരിസ്ഥിതി പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യാനും ബന്ധപ്പെട്ട അധികാരികളുമായി ബന്ധപ്പെടാനും അവയുടെ പരിഹാര പുരോഗതി നിരീക്ഷിക്കാനും NAAM നിങ്ങളെ സഹായിക്കുന്നു.',
    report: 'പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക', how: 'എങ്ങനെ പ്രവർത്തിക്കുന്നു?',
  },
  en: {
    nav: ['Home', 'About NAAM', 'How It Works', 'Environmental Issues', 'Contact'],
    badge: 'Together for a cleaner, healthier Kerala',
    headingA: 'Protecting the places', headingB: 'we call home.',
    body: 'NAAM helps communities report waste, water pollution, blocked drains and other environmental concerns, connect with the right authorities, and follow each issue through to resolution.',
    report: 'Report an Issue', how: 'How It Works',
  },
} as const;

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
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const reducedMotion = useReducedMotion();
  const t = copy[language];
  const transition = (delay: number) => reducedMotion ? { duration: 0 } : { duration: 0.6, delay, ease: 'easeOut' as const };
  const links = ['#home', '#about', '#how', '#issues', '#contact'];
  const changeLanguage = (next: Language) => { setLanguage(next); localStorage.setItem('naam_language', next); };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <section id="home" className="relative flex h-screen h-[100svh] flex-col overflow-hidden bg-background">
    <LandscapeBackdrop />
    <header className="relative z-30 flex shrink-0 items-center justify-between px-5 py-4 md:px-12 md:py-5 lg:px-20">
      <Logo height={40} className="h-9 md:h-11" />
      <nav lang={language} aria-label="Main navigation" className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex xl:gap-7">
        {t.nav.map((label, i) => <a key={label} href={links[i]} className="whitespace-nowrap transition-colors hover:text-primary">{label}</a>)}
      </nav>
      <div className="flex items-center gap-2 md:gap-3">
        {isAuthenticated && user && <div className="hidden items-center gap-2 md:flex"><span className="max-w-36 truncate text-xs text-muted-foreground">{user.fullName}</span><button type="button" onClick={() => logout()} aria-label="Log out" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white/60 text-muted-foreground hover:text-primary"><LogOut size={15}/></button></div>}
        <div className="hidden sm:block"><LanguageSwitcher currentLang={language} onLanguageChange={changeLanguage} className="border-border/80 bg-background/80 text-foreground shadow-none"/></div>
        <button type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background/80 text-foreground lg:hidden">{menuOpen ? <X size={18}/> : <Menu size={18}/>}</button>
        <button type="button" onClick={() => navigate('/community/report')} className="hidden rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 sm:inline-flex md:px-5 md:text-sm">{language === 'ml' ? 'റിപ്പോർട്ട് ചെയ്യുക' : 'Report an Issue'}</button>
      </div>
      <AnimatePresence>{menuOpen && <motion.div initial={reducedMotion ? false : {opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={reducedMotion ? undefined : {opacity:0,y:-8}} transition={{duration:reducedMotion ? 0 : .18}} className="absolute left-4 right-4 top-[calc(100%-4px)] z-40 rounded-2xl border border-border bg-background/95 p-3 shadow-xl backdrop-blur-xl lg:hidden">
        <nav className="flex flex-col">{t.nav.map((label,i)=><a key={label} href={links[i]} onClick={()=>setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted">{label}</a>)}</nav>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3"><LanguageSwitcher currentLang={language} onLanguageChange={changeLanguage}/><div className="flex items-center gap-2">{isAuthenticated && user && <button type="button" onClick={() => logout()} className="rounded-full border border-border px-3 py-2 text-[11px] text-muted-foreground">{language === 'ml' ? 'ലോഗ് ഔട്ട്' : 'Log out'}</button>}<button type="button" onClick={()=>navigate('/community/report')} className="rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">{t.report}</button></div></div>
      </motion.div>}</AnimatePresence>
    </header>

    <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col items-center overflow-hidden px-4 pt-2 text-center sm:px-6 sm:pt-4">
      <motion.div lang={language} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={transition(0)} className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/85 px-4 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-md md:mb-5 md:text-sm"><Leaf size={14} className="text-primary"/><span>{t.badge}</span></motion.div>
      <motion.h1 lang={language} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={transition(.1)} className="max-w-4xl font-malayalam text-[clamp(2rem,5.2vw,4.5rem)] font-semibold leading-[1.35] tracking-normal text-foreground md:leading-[1.3]">
        {language === 'ml' ? <>{t.headingA}<br className="hidden sm:block"/><span className="text-primary"> {t.headingB}</span></> : <>{t.headingA}<br/><span className="font-display text-[1.12em] font-normal italic text-primary">{t.headingB}</span></>}
      </motion.h1>
      <motion.p lang={language} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={transition(.2)} className="mt-3 max-w-[650px] text-sm leading-[1.8] text-muted-foreground md:mt-4 md:text-base">{t.body}</motion.p>
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={transition(.3)} className="mt-4 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row sm:gap-3 md:mt-5">
        <button type="button" onClick={() => navigate('/community/report')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-primary/90"><Leaf size={16}/>{t.report}<ArrowRight size={15}/></button>
        <button type="button" onClick={() => navigate('/map')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-300 bg-white/80 px-6 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur transition hover:bg-white hover:text-emerald-900"><MapPin size={16}/>{language === 'ml' ? 'ലൈവ് മാപ്പ്' : 'Live Map'}</button>
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
  return <div className="bg-background">
    <section id="about" className="mx-auto max-w-6xl px-6 py-16 md:py-24"><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">NAAM · നാം</p><h2 className="mt-3 max-w-2xl font-malayalam text-3xl font-semibold text-foreground md:text-4xl">പരാതിയിൽ നിന്ന് പരിഹാരത്തിലേക്ക്, ഒരുമിച്ച്.</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">കേരളത്തിലെ സമൂഹങ്ങളെയും പ്രാദേശിക സ്ഥാപനങ്ങളെയും ബന്ധിപ്പിക്കുന്ന പരിസ്ഥിതി നിരീക്ഷണ വേദിയാണ് NAAM.</p></section>
    <section id="how" className="border-y border-border bg-white/55"><div className="mx-auto grid max-w-6xl gap-5 px-6 py-14 md:grid-cols-3 md:py-20">{[['01','റിപ്പോർട്ട് ചെയ്യുക','സ്ഥലവും വിവരങ്ങളും ചേർത്ത് പരിസ്ഥിതി പ്രശ്നം സമർപ്പിക്കുക.'],['02','അധികാരികളുമായി ബന്ധപ്പെടുക','ശരിയായ വകുപ്പിനും ഫീൽഡ് ഓഫീസർക്കും പരാതി കൈമാറുക.'],['03','പുരോഗതി നിരീക്ഷിക്കുക','നടപടികളും പരിഹാര വിവരങ്ങളും പിന്തുടരുക.']].map(([n,title,body])=><article key={n} className="rounded-2xl border border-border bg-background p-5"><span className="text-xs font-semibold text-primary">{n}</span><h3 className="mt-2 font-malayalam text-lg font-semibold text-foreground">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p></article>)}</div></section>
    <section id="portals" className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">PORTALS · പോർട്ടലുകൾ</p>
        <h2 className="mt-3 font-malayalam text-2xl font-semibold leading-[1.45] text-foreground md:text-3xl">നിങ്ങൾക്കാവശ്യമായ NAAM സേവനം തിരഞ്ഞെടുക്കുക</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">ഓരോ പോർട്ടലും അതത് ചുമതലയ്ക്കനുസരിച്ചുള്ള ഉപകരണങ്ങളിലേക്ക് നയിക്കുന്നു.</p>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { Icon: Users, title: 'പൗര പോർട്ടൽ', subtitle: 'Community Portal', description: 'പരിസ്ഥിതി പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യുകയും പുരോഗതി പിന്തുടരുകയും ചെയ്യുക.', to: '/login/community', tone: 'bg-primary/10 text-primary' },
          { Icon: Building2, title: 'അധികാരി പോർട്ടൽ', subtitle: 'Authority Portal', description: 'പരാതികൾ വിലയിരുത്തി ബന്ധപ്പെട്ട ഉദ്യോഗസ്ഥർക്ക് കൈമാറുക.', to: '/login/authority', tone: 'bg-accent/10 text-accent' },
          { Icon: HardHat, title: 'ഫീൽഡ് ഓഫീസർ', subtitle: 'Field Officer Portal', description: 'സ്ഥലപരിശോധനയും പരിഹാര നടപടികളും രേഖപ്പെടുത്തുക.', to: '/login/officer', tone: 'bg-warning/10 text-warning' },
          { Icon: ShieldCheck, title: 'സിസ്റ്റം അഡ്മിൻ', subtitle: 'Super Admin Portal', description: 'പ്ലാറ്റ്‌ഫോം ക്രമീകരണങ്ങളും ഭരണപരമായ ഉപകരണങ്ങളും കൈകാര്യം ചെയ്യുക.', to: '/login/admin', tone: 'bg-violet-100 text-violet-800' },
        ].map(({ Icon, title, subtitle, description, to, tone }) => (
          <Link key={to} to={to} className="group flex min-h-56 flex-col rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon size={20}/></span>
            <h3 className="mt-4 font-malayalam text-base font-semibold leading-[1.45] text-foreground">{title}</h3>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">{subtitle}</p>
            <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">പ്രവേശിക്കുക <span aria-hidden="true">·</span> Sign in <ArrowRight size={13} className="transition-transform group-hover:translate-x-1"/></span>
          </Link>
        ))}
      </div>
    </section>
    <section id="issues" className="mx-auto max-w-6xl px-6 py-14 md:py-20"><h2 className="font-malayalam text-2xl font-semibold text-foreground">നിങ്ങളുടെ പ്രദേശത്തെ പ്രശ്നങ്ങൾ അറിയിക്കുക</h2><div className="mt-5 flex flex-wrap gap-2">{['മാലിന്യ നിയന്ത്രണം','ജലമലിനീകരണം','ഡ്രെയിനേജ്','വെള്ളപ്പൊക്കം'].map(x=><span key={x} className="rounded-full border border-border bg-white px-4 py-2 text-sm text-muted-foreground">{x}</span>)}</div></section>
    <footer id="contact" className="border-t border-border bg-white/60"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 px-6 py-8 md:flex-row md:items-center"><div><Logo height={34}/><p className="mt-2 text-xs text-muted-foreground">People's Environmental Monitoring and Resolution Platform · Kerala</p></div><div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><Link to="/map" className="font-semibold text-emerald-700 hover:text-emerald-800">Live Map</Link><Link to="/login/community" className="hover:text-primary">Community</Link><Link to="/login/authority" className="hover:text-primary">Authority</Link><Link to="/login/officer" className="hover:text-primary">Field Officer</Link><Link to="/login/admin" className="hover:text-primary">Admin</Link><Link to="/design-system" className="hover:text-primary">Design system</Link></div></div></footer>
  </div>;
}
