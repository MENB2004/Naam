import { useState } from 'react';
import { PortalHeader } from '../../components/layout/PortalHeader';
import { StatusBadge, ComplaintStatus } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Language } from '../../components/common/LanguageSwitcher';
import { Shield, Sparkles, Check, AlertCircle, MapPin, Eye } from 'lucide-react';

const ALL_STATUSES: ComplaintStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'VERIFIED',
  'REJECTED',
  'REOPENED',
];

const COLOR_SWATCHES = [
  { name: 'Primary Forest Green', hex: '#087C63', desc: 'Core brand actions, active state' },
  { name: 'Secondary Deep Teal', hex: '#0D9488', desc: 'Badges, tertiary accents' },
  { name: 'Waterway Blue', hex: '#1677C8', desc: 'Water pollution, informational' },
  { name: 'Soft Meadow Green', hex: '#E8F5EE', desc: 'Light card backgrounds, success tints' },
  { name: 'Mist Background', hex: '#F0F7FA', desc: 'Application background' },
  { name: 'Warning Ochre Amber', hex: '#F59E0B', desc: 'Under review, medium severity' },
  { name: 'Critical Hazard Red', hex: '#DC5353', desc: 'High urgency, rejected, hazards' },
];

export function DesignShowcase() {
  const [lang, setLang] = useState<Language>('ml');
  const [sampleInput, setSampleInput] = useState('');
  const [hasError, setHasError] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <PortalHeader currentLang={lang} onLanguageChange={setLang} activeRole="ADMIN" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="flex justify-center mb-2">
            <img
              src="/naam-logo.png"
              alt="NAAM Official Logo"
              className="h-20 sm:h-24 object-contain shadow-sm rounded-xl p-2 bg-white border border-slate-200"
            />
          </div>
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-[#087C63]" />
            NAAM UI/UX Design System v1.0
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B]">
            {lang === 'ml' ? 'ഡിസൈൻ സിസ്റ്റവും ഘടകങ്ങളും' : 'Design System & Component Library'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            {lang === 'ml'
              ? 'മലയാളം മുൻഗണനാ ഇന്റർഫേസും പാരിസ്ഥിതിക നിരീക്ഷണ കളർ ടോക്കണുകളും'
              : 'Malayalam-first typography, environmental status tokens, and accessible WCAG 2.1 AA components.'}
          </p>
        </div>

        {/* 1. Complaint Status Lifecycle Badges */}
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === 'ml' ? '1. പരാതി അവസ്ഥാ സൂചികകൾ (Complaint State Machine)' : '1. Complaint State Machine Badges'}
            </CardTitle>
            <CardDescription>
              {lang === 'ml'
                ? 'പരാതിയുടെ 8 പ്രധാന ഘട്ടങ്ങളെ പ്രതിനിധീകരിക്കുന്ന ബി-ലിംഗ്വൽ ബാഡ്ജുകൾ'
                : 'Bilingual badges reflecting all 8 lifecycle states in Malayalam and English.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ALL_STATUSES.map((status) => (
                <div
                  key={status}
                  className="flex flex-col items-center p-4 bg-slate-50/70 border border-slate-100 rounded-xl space-y-2 text-center"
                >
                  <StatusBadge status={status} lang={lang} size="md" />
                  <span className="text-[11px] font-mono text-slate-400">{status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 2. Color Palette Swatches */}
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === 'ml' ? '2. പരിസ്ഥിതി വർണ്ണ പλέറ്റ് (Environmental Color Palette)' : '2. Official Color Palette'}
            </CardTitle>
            <CardDescription>
              {lang === 'ml'
                ? 'കേരളത്തിന്റെ പരിസ്ഥിതി തനിമയും ഭരണപരമായ വ്യക്തതയും നിലനിർത്തുന്ന നിറങ്ങൾ'
                : 'Colors curated for environmental vibrancy, high sunlight contrast, and administrative clarity.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLOR_SWATCHES.map((swatch) => (
                <div key={swatch.hex} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                  <div
                    className="h-16 w-full rounded-lg shadow-inner flex items-center justify-center"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    <span className="text-xs font-mono font-bold text-white drop-shadow">
                      {swatch.hex}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{swatch.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{swatch.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. Reusable Button Components */}
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === 'ml' ? '3. ബട്ടൺ ഘടകങ്ങൾ (Buttons)' : '3. Button Variants'}
            </CardTitle>
            <CardDescription>
              {lang === 'ml' ? 'വിവിധ തരത്തിലുള്ള ആക്ഷൻ ബട്ടണുകൾ' : 'Accessible, touch-friendly interactive buttons.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">
                <Check className="w-4 h-4 mr-1.5" />
                {lang === 'ml' ? 'പ്രൈമറി ബട്ടൺ' : 'Primary Action'}
              </Button>
              <Button variant="secondary">
                <Shield className="w-4 h-4 mr-1.5" />
                {lang === 'ml' ? 'സെക്കൻഡറി ബട്ടൺ' : 'Secondary Action'}
              </Button>
              <Button variant="outline">
                <MapPin className="w-4 h-4 mr-1.5" />
                {lang === 'ml' ? 'ഔട്ട്ലൈൻ ബട്ടൺ' : 'Outline'}
              </Button>
              <Button variant="danger">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                {lang === 'ml' ? 'ഡേഞ്ചർ / നിരസിക്കുക' : 'Reject Action'}
              </Button>
              <Button variant="ghost">
                <Eye className="w-4 h-4 mr-1.5" />
                {lang === 'ml' ? 'ഗോസ്റ്റ്' : 'Ghost Button'}
              </Button>
              <Button variant="primary" isLoading>
                {lang === 'ml' ? 'പ്രോസസ്സ് ചെയ്യുന്നു...' : 'Loading...'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 4. Form Controls */}
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === 'ml' ? '4. ഫോം ഘടകങ്ങൾ (Form Inputs)' : '4. Form Controls'}
            </CardTitle>
            <CardDescription>
              {lang === 'ml' ? 'കൃത്യമായ മലയാളം വാലിഡേഷനും ഹെൽപ്പർ ടെക്സ്റ്റും' : 'Accessible inputs with validation states.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 max-w-xl">
            <Input
              label={lang === 'ml' ? 'പരാതിയുടെ തലക്കെട്ട്' : 'Complaint Title'}
              placeholder={lang === 'ml' ? 'ഉദാ: റോഡരികിലെ പ്ലാസ്റ്റിക് മാലിന്യക്കൂമ്പാരം' : 'e.g. Plastic waste dump near canal'}
              value={sampleInput}
              onChange={(e) => setSampleInput(e.target.value)}
              helperText={lang === 'ml' ? 'പ്രശ്നം വ്യക്തമാക്കുന്ന ചുരുങ്ങിയ വിവരണം നൽകുക' : 'Provide a concise title'}
              error={hasError ? (lang === 'ml' ? 'ദയവായി സാധുവായ വിവരണം നൽകുക' : 'This field is required') : undefined}
            />

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHasError(!hasError)}
              >
                {hasError ? 'വാലിഡേഷൻ എറർ മാറ്റുക' : 'എറർ സ്റ്റേറ്റ് പരീക്ഷിക്കുക'}
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <span className="text-xs text-slate-500">
              WCAG 2.1 AA Contrast Ratio: &gt; 5.4:1 on all surfaces.
            </span>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
