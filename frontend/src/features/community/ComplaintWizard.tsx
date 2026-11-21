import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Trash2,
  Droplets,
  Waves,
  Wind,
  TreePine,
  Mountain,
  AlertCircle,
  Camera,
  Mic,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  FileText,
  Clock,
} from 'lucide-react';
import { ComplaintCategory, ComplaintSeverity, LocationData } from '../../types/complaint';
import { complaintService } from '../../services/complaintService';
import { LocationPicker, KERALA_DISTRICTS } from './LocationPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface CategoryOption {
  key: ComplaintCategory;
  titleMl: string;
  titleEn: string;
  descMl: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    key: 'WASTE',
    titleMl: 'മാലിന്യ നിക്ഷേപം',
    titleEn: 'Solid Waste Dumping',
    descMl: 'വഴിയരികിലെ മാലിന്യക്കൂമ്പാരം, പ്ലാസ്റ്റിക് മാലിന്യങ്ങൾ, അനധികൃത മാലിന്യം തള്ളൽ.',
    icon: Trash2,
    color: '#087C63',
    bgColor: 'bg-emerald-50',
  },
  {
    key: 'WATER_POLLUTION',
    titleMl: 'ജല മലിനീകരണം',
    titleEn: 'Water Pollution',
    descMl: 'പുഴകൾ, തടാകങ്ങൾ, കിണറുകൾ, കുടിവെള്ള സ്രോതസ്സുകളിലെ മലിനീകരണം.',
    icon: Droplets,
    color: '#1677C8',
    bgColor: 'bg-blue-50',
  },
  {
    key: 'DRAINAGE',
    titleMl: 'ഡ്രെയിനേജ് തടസ്സം',
    titleEn: 'Drainage & Sewage',
    descMl: 'ഓടകളിലെ തടസ്സം, മലിനജല ചോർച്ച, വെള്ളക്കെട്ട് ഭീഷണി.',
    icon: Waves,
    color: '#0D9488',
    bgColor: 'bg-teal-50',
  },
  {
    key: 'AIR_POLLUTION',
    titleMl: 'വായു മലിനീകരണം',
    titleEn: 'Air Pollution',
    descMl: 'പ്ലാസ്റ്റിക് / മാലിന്യങ്ങൾ കത്തിക്കൽ, കനത്ത പുക, വിഷവാതക ദുർഗന്ധം.',
    icon: Wind,
    color: '#D97706',
    bgColor: 'bg-amber-50',
  },
  {
    key: 'DEFORESTATION',
    titleMl: 'വനനശീകരണം / കണ്ടൽ നശീകരണം',
    titleEn: 'Deforestation & Mangroves',
    descMl: 'അനധികൃത മരംമുറി, കണ്ടൽക്കാടുകൾ നികത്തൽ, തണ്ണീർത്തട കയ്യേറ്റം.',
    icon: TreePine,
    color: '#15803D',
    bgColor: 'bg-green-50',
  },
  {
    key: 'ILLEGAL_MINING',
    titleMl: 'അനധികൃത ഖനനം',
    titleEn: 'Illegal Mining / Sand Mining',
    descMl: 'അനധികൃത മണലെടുപ്പ്, കുന്നിടിക്കൽ, ക്വാറി നിയമലംഘനങ്ങൾ.',
    icon: Mountain,
    color: '#9333EA',
    bgColor: 'bg-purple-50',
  },
  {
    key: 'OTHER',
    titleMl: 'മറ്റ് പരിസ്ഥിതി പ്രശ്നങ്ങൾ',
    titleEn: 'Other Environmental Issues',
    descMl: 'മുകളിൽ പരാമർശിക്കാത്ത മറ്റ് ഗുരുതര പരിസ്ഥിതി പ്രശ്നങ്ങൾ.',
    icon: AlertCircle,
    color: '#64748B',
    bgColor: 'bg-slate-50',
  },
];

export const ComplaintWizard: React.FC = () => {
  const navigate = useNavigate();

  // Multi-step state (1: Category, 2: Details & Evidence, 3: Location, 4: Success)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [category, setCategory] = useState<ComplaintCategory>('WASTE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<ComplaintSeverity>('MEDIUM');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceRecorded, setVoiceRecorded] = useState(false);

  // Location State (Default to Kochi, Ernakulam)
  const [latitude, setLatitude] = useState(9.9816);
  const [longitude, setLongitude] = useState(76.2999);
  const [district, setDistrict] = useState('Ernakulam');
  const [lsgdType, setLsgdType] = useState('CORPORATION');
  const [lsgdName, setLsgdName] = useState('Kochi Municipal Corporation');
  const [wardNumber, setWardNumber] = useState('62');
  const [landmark, setLandmark] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [createdTrackingCode, setCreatedTrackingCode] = useState<string | null>(null);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert('ഫയൽ വലുപ്പം 5MB-ൽ താഴെയായിരിക്കണം (Maximum file size 5MB)');
        continue;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSamplePhoto = () => {
    // High-resolution environmental sample photo
    const sample = 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80';
    setPhotos((prev) => [...prev, sample]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyDemoForm = () => {
    setCategory('WASTE');
    setTitle('മറൈൻ ഡ്രൈവ് വാക്ക് വേയ്ക്ക് സമീപം പ്ലാസ്റ്റിക് മാലിന്യങ്ങൾ');
    setDescription(
      'കായലോരത്ത് വൻതോതിൽ പ്ലാസ്റ്റിക് കുപ്പികളും ഭക്ഷ്യാവശിഷ്ടങ്ങളും കുന്നുകൂടി കിടക്കുന്നു. ശക്തമായ ദുർഗന്ധം വമിക്കുന്നുണ്ട്. അടിയന്തരമായി നീക്കം ചെയ്യണം.'
    );
    setSeverity('HIGH');
    setDistrict('Ernakulam');
    setLsgdType('CORPORATION');
    setLsgdName('Kochi Municipal Corporation');
    setWardNumber('62');
    setLandmark('Near Marine Drive Rainbow Bridge');
    if (photos.length === 0) {
      handleUseSamplePhoto();
    }
  };

  const handleSubmitComplaint = async () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (cleanTitle.length < 5 || cleanTitle.length > 255) {
      setSubmissionError('തലക്കെട്ട് 5 മുതൽ 255 വരെ അക്ഷരങ്ങളായിരിക്കണം (Title must be 5–255 characters).');
      return;
    }
    if (cleanDescription.length < 10) {
      setSubmissionError('വിവരണം കുറഞ്ഞത് 10 അക്ഷരങ്ങളെങ്കിലും വേണം (Description must be at least 10 characters).');
      return;
    }
    if (latitude < 8 || latitude > 13 || longitude < 74.5 || longitude > 77.8) {
      setSubmissionError('കേരളത്തിനകത്തുള്ള സ്ഥലം തിരഞ്ഞെടുക്കുക (Select a location within Kerala).');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    const locationData: LocationData = {
      latitude,
      longitude,
      district,
      lsgd_type: lsgdType,
      lsgd_name: lsgdName.trim() || 'Local Body',
      ward_number: wardNumber.trim() || undefined,
      landmark: landmark.trim() || undefined,
    };

    const evidenceData = photos.map((url) => ({
      file_url: url,
      file_type: 'image/jpeg',
      file_size_bytes: 1048576,
      evidence_type: 'CITIZEN_SUBMISSION',
    }));

    try {
      const res = await complaintService.createComplaint({
        title: cleanTitle,
        description: cleanDescription,
        category,
        severity,
        location: locationData,
        evidence: evidenceData,
      });

      setCreatedTrackingCode(res.tracking_code);
      setStep(4);
    } catch (err: any) {
      setSubmissionError(
        err.message || 'പരാതി സമർപ്പിക്കുന്നതിൽ പിശക് സംഭവിച്ചു. ദയവായി വിവരങ്ങൾ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/community" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#087C63]">
            <ArrowLeft className="w-4 h-4 mr-1" />
            പൗര പോർട്ടലിലേക്ക് മടങ്ങുക
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800">NAAM റിപ്പോർട്ടിംഗ് വിസാർഡ്</span>
            <Badge variant="secondary" className="bg-[#E8F5EE] text-[#087C63] text-xs">
              ഘട്ടം {step} / 4
            </Badge>
          </div>
        </div>

        {/* Wizard Stepper Progress Bar */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium text-slate-600 mb-2">
            <span className={step >= 1 ? 'font-bold text-[#087C63]' : ''}>1. വിഭാഗം</span>
            <span className={step >= 2 ? 'font-bold text-[#087C63]' : ''}>2. വിവരങ്ങൾ</span>
            <span className={step >= 3 ? 'font-bold text-[#087C63]' : ''}>3. സ്ഥലം</span>
            <span className={step >= 4 ? 'font-bold text-[#087C63]' : ''}>4. രസീത്</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#087C63] transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">
                പ്രശ്ന വിഭാഗം തിരഞ്ഞെടുക്കുക (Select Issue Category)
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                താഴെ നൽകിയിരിക്കുന്നവയിൽ നിന്ന് നിങ്ങളുടെ പരാതിക്ക് ഏറ്റവും അനുയോജ്യമായ വിഭാഗം തിരഞ്ഞെടുക്കുക.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key)}
                      className={`text-left p-4 rounded-xl border-2 transition flex items-start space-x-3.5 ${
                        isSelected
                          ? 'border-[#087C63] bg-[#E8F5EE]/40 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900">{cat.titleMl}</h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#087C63]" />}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{cat.titleEn}</div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{cat.descMl}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyDemoForm}
                className="text-xs text-[#087C63] border-[#087C63]/30"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                ഡെമോ ഡാറ്റ ഓട്ടോ-ഫിൽ
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep(2)}
                className="px-6"
              >
                തുടരുക (Next)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 2: DETAILS & EVIDENCE */}
        {step === 2 && (
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">
                വിവരങ്ങളും ഫോട്ടോ തെളിവുകളും (Details & Evidence)
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                സംഭവസ്ഥലത്തെക്കുറിച്ചുള്ള കൃത്യമായ വിവരങ്ങളും ഫോട്ടോകളും നൽകുക.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  പരാതിയുടെ തലക്കെട്ട് (Title) *
                </label>
                <Input
                  type="text"
                  required
                  minLength={5}
                  maxLength={255}
                  placeholder="ഉദാ: മറൈൻ ഡ്രൈവിൽ പ്ലാസ്റ്റിക് മാലിന്യ നിക്ഷേപം"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-slate-500">5 മുതൽ 255 വരെ അക്ഷരങ്ങൾ (5–255 characters)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  വിശദമായ വിവരണം (Detailed Description) *
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  placeholder="പ്രശ്നത്തിന്റെ സ്വഭാവം, ദുർഗന്ധം, എത്ര നാളായി നിലനിൽക്കുന്നു, ബാധിക്കുന്ന ജനസംഖ്യ എന്നിവ വിശദമാക്കുക..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#087C63]"
                />
                <p className="mt-1 text-[11px] text-slate-500">കുറഞ്ഞത് 10 അക്ഷരങ്ങൾ (At least 10 characters)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  മുൻഗണന / അടിയന്തിര നില (Priority Level)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as ComplaintSeverity[]).map((sev) => {
                    const labels: Record<ComplaintSeverity, { ml: string; color: string }> = {
                      LOW: { ml: 'സാധാരണ (Low)', color: 'border-slate-200 text-slate-700' },
                      MEDIUM: { ml: 'ഇടത്തരം (Medium)', color: 'border-amber-200 text-amber-700' },
                      HIGH: { ml: 'അടിയന്തിരം (Urgent/High)', color: 'border-red-200 text-red-700' },
                      CRITICAL: { ml: 'ഗുരുതരം (Critical)', color: 'border-red-500 text-red-800' },
                    };
                    const isSelected = severity === sev;
                    return (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeverity(sev)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                          isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        {labels[sev].ml}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center">
                    <Camera className="w-4 h-4 mr-1 text-[#087C63]" />
                    <span>സ്ഥലത്തുനിന്നുള്ള ഫോട്ടോകൾ (Field Photographs)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseSamplePhoto}
                    className="text-[11px] font-semibold text-[#087C63] hover:underline"
                  >
                    + സാമ്പിൾ ഫോട്ടോ ചേർക്കുക
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    id="photo-upload"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-semibold text-slate-700">
                      ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      JPEG, PNG അല്ലെങ്കിൽ WebP (പരമാവധി 5MB)
                    </span>
                  </label>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                    {photos.map((p, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={p} alt="Evidence" className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition shadow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice Note Simulation */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#087C63] flex items-center justify-center">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">മലയാളം വോയ്സ് നോട്ട് (Voice Description)</h5>
                      <p className="text-[11px] text-slate-500">ടൈപ്പ് ചെയ്യുന്നതിന് പകരം സംസാരിച്ച് വിവരങ്ങൾ നൽകാം</p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!isRecordingVoice) {
                        setIsRecordingVoice(true);
                        setTimeout(() => {
                          setIsRecordingVoice(false);
                          setVoiceRecorded(true);
                        }, 2500);
                      } else {
                        setIsRecordingVoice(false);
                        setVoiceRecorded(true);
                      }
                    }}
                    className={`text-xs ${isRecordingVoice ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : ''}`}
                  >
                    {isRecordingVoice ? 'റെക്കോർഡിംഗ്...' : voiceRecorded ? 'റെക്കോർഡ് ചെയ്തു (0:18)' : 'റെക്കോർഡ് ചെയ്യുക'}
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                മുമ്പത്തെ ഘട്ടം
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={title.trim().length < 5 || title.trim().length > 255 || description.trim().length < 10}
                onClick={() => setStep(3)}
              >
                തുടരുക (Next)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 3: LOCATION & KERALA MAP */}
        {step === 3 && (
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">
                സ്ഥലം തിരഞ്ഞെടുക്കുക (Map Location & Local Body)
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                തദ്ദേശ സ്ഥാപനത്തിനും വാർഡ് ഓഫീസർക്കും കൃത്യമായി പരിശോധിക്കാൻ സ്ഥലം അടയാളപ്പെടുത്തുക.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {submissionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <span>{submissionError}</span>
                </div>
              )}

              {/* Leaflet Pin Dropper */}
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                onDistrictSelect={(dist) => setDistrict(dist)}
              />

              {/* Local Body Administrative Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ജില്ല (District) *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white focus:ring-2 focus:ring-[#087C63]"
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d.en} value={d.en}>
                        {d.ml} ({d.en})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    തദ്ദേശ സ്ഥാപന തരം (LSGD Type) *
                  </label>
                  <select
                    value={lsgdType}
                    onChange={(e) => setLsgdType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white focus:ring-2 focus:ring-[#087C63]"
                  >
                    <option value="GRAMA_PANCHAYAT">ഗ്രാമപഞ്ചായത്ത് (Grama Panchayat)</option>
                    <option value="MUNICIPALITY">മുനിസിപ്പാലിറ്റി (Municipality)</option>
                    <option value="CORPORATION">മുനിസിപ്പൽ കോർപ്പറേഷൻ (Corporation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    തദ്ദേശ സ്ഥാപനത്തിന്റെ പേര് (LSGD Name) *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="ഉദാ: കൊച്ചി കോർപ്പറേഷൻ"
                    value={lsgdName}
                    onChange={(e) => setLsgdName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    വാർഡ് നമ്പർ (Ward Number - ഓപ്ഷണൽ)
                  </label>
                  <Input
                    type="text"
                    placeholder="ഉദാ: 62"
                    value={wardNumber}
                    onChange={(e) => setWardNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ലാൻഡ്മാർക്ക് / വിലാസം (Landmark / Location Address)
                </label>
                <Input
                  type="text"
                  placeholder="ഉദാ: മറൈൻ ഡ്രൈവ് റെയിൻബോ ബ്രിഡ്ജിന് സമീപം"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                മുമ്പത്തെ ഘട്ടം
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                onClick={handleSubmitComplaint}
                className="bg-[#087C63] hover:bg-[#06614D] text-white px-6 font-semibold"
              >
                {isSubmitting ? 'പരാതി രജിസ്റ്റർ ചെയ്യുന്നു...' : 'പരാതി സമർപ്പിക്കുക (Submit Complaint)'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 4: SUCCESS RECEIPT */}
        {step === 4 && (
          <Card className="shadow-xl border-slate-200 text-center">
            <CardHeader className="pb-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <CardTitle className="text-2xl font-extrabold text-slate-900">
                പരാതി വിജയകരമായി രജിസ്റ്റർ ചെയ്തു!
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 mt-1">
                നിങ്ങളുടെ പരാതി തദ്ദേശ സ്വയംഭരണ വകുപ്പിലേക്കും ബന്ധപ്പെട്ട അധികാരികൾക്കും അയച്ചു.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 max-w-md mx-auto">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 mb-6">
                <div className="text-xs text-emerald-800 font-medium mb-1">നിങ്ങളുടെ യുണീക്ക് ട്രാക്കിംഗ് കോഡ്</div>
                <div className="text-2xl font-mono font-extrabold text-[#087C63] tracking-wider select-all">
                  {createdTrackingCode}
                </div>
                <div className="mt-2 text-[11px] text-emerald-700">
                  ഈ കോഡ് ഉപയോഗിച്ച് നിങ്ങൾക്ക് ഏതുസമയത്തും പരാതിയുടെ പുരോഗതി പരിശോധിക്കാം.
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2 text-xs mb-6">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">പരാതി വിഷയം:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">{title}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">ജില്ല / തദ്ദേശ സ്ഥാപനം:</span>
                  <span className="font-semibold text-slate-800">{district}, {lsgdName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">നിലവിലെ സ്റ്റാറ്റസ്:</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px]">
                    സമർപ്പിച്ചു (SUBMITTED)
                  </Badge>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">ലൊക്കേഷൻ കോർഡിനേറ്റ്സ്:</span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/track/${createdTrackingCode}`)}
                  className="w-full flex items-center justify-center bg-[#087C63]"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  പരാതിയുടെ പുരോഗതി ട്രാക്ക് ചെയ്യുക
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/community/my-reports')}
                  className="w-full flex items-center justify-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  എന്റെ എല്ലാ പരാതികളും കാണുക
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTitle('');
                    setDescription('');
                    setPhotos([]);
                    setStep(1);
                  }}
                  className="text-xs text-slate-600"
                >
                  + പുതിയൊരു പരാതി കൂടി നൽകുക
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
