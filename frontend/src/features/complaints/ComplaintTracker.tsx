import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  ArrowLeft,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types/complaint';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const TIMELINE_STAGES = [
  { key: 'SUBMITTED', titleMl: 'പരാതി സമർപ്പിച്ചു', descMl: 'പൗരൻ വിവരങ്ങളും ഫോട്ടോകളും സമർപ്പിച്ചു' },
  { key: 'VERIFIED', titleMl: 'പ്രാഥമിക പരിശോധന', descMl: 'തദ്ദേശ അധികാരി പരാതി ശരിയാണെന്ന് സ്ഥിരീകരിച്ചു' },
  { key: 'ASSIGNED', titleMl: 'ചുമതലപ്പെടുത്തി', descMl: 'വാർഡ് ഫീൽഡ് ഇൻസ്പെക്ടർക്ക് കൈമാറി' },
  { key: 'IN_PROGRESS', titleMl: 'നടപടിയിൽ', descMl: 'ഫീൽഡ് തല പരിശോധനയും മാലിന്യ നീക്കവും നടക്കുന്നു' },
  { key: 'RESOLVED', titleMl: 'പരിഹരിച്ചു', descMl: 'പ്രശ്നം പൂർണ്ണമായി പരിഹരിച്ച് റിപ്പോർട്ട് നൽകി' },
];

export const ComplaintTracker: React.FC = () => {
  const { trackingCode: paramCode } = useParams<{ trackingCode?: string }>();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState(paramCode || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaint = (code: string) => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);

    complaintService
      .trackComplaint(code)
      .then((data) => {
        setComplaint(data);
      })
      .catch((err: any) => {
        setComplaint(null);
        setError(err.message || 'പരാതി കണ്ടെത്തിയില്ല. ദയവായി ട്രാക്കിംഗ് കോഡ് വീണ്ടും പരിശോധിക്കുക.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (paramCode) {
      setInputCode(paramCode);
      fetchComplaint(paramCode);
    }
  }, [paramCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      navigate(`/track/${inputCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#087C63]">
            <ArrowLeft className="w-4 h-4 mr-1" />
            ഹോം പേജിലേക്ക് മടങ്ങുക
          </Link>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#087C63]" />
            <span className="text-xs font-bold text-slate-800">തത്സമയ പരാതി നിരീക്ഷണം (Live Tracking)</span>
          </div>
        </div>

        {/* Search Header Card */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
              പരാതിയുടെ പുരോഗതി പരിശോധിക്കുക
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 mt-1">
              നിങ്ങൾക്ക് ലഭിച്ച യുണീക്ക് ട്രാക്കിംഗ് കോഡ് (ഉദാ: NAAM-2026-XXXXX) നൽകി വിവരങ്ങൾ കാണാം.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-6 max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="NAAM-2026-XXXXX"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono uppercase focus:ring-2 focus:ring-[#087C63]"
                />
              </div>
              <Button type="submit" variant="primary" disabled={isLoading} className="bg-[#087C63] px-6">
                {isLoading ? 'തിരയുന്നു...' : 'തിരയുക'}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700 text-xs text-left">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tracking Details View */}
        {complaint && (
          <div className="space-y-6">
            {/* Top Complaint Summary Card */}
            <Card className="border-slate-200 shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2.5 mb-1.5">
                      <span className="font-mono text-xs font-bold text-[#087C63] bg-[#E8F5EE] px-3 py-1 rounded-lg">
                        {complaint.tracking_code}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <Badge variant="outline" className="text-xs">
                        {complaint.category_display_ml}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{complaint.title}</h2>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                    <StatusBadge status={complaint.current_status} size="md" />
                    <span className="text-[11px] text-slate-400 mt-1">
                      സമർപ്പിച്ചത്: {new Date(complaint.created_at).toLocaleDateString('ml-IN')}
                    </span>
                  </div>
                </div>

                <div className="py-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">വിശദാംശങ്ങൾ</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {complaint.description}
                  </p>
                </div>

                {/* Evidence Photo Grid */}
                {complaint.evidence && complaint.evidence.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      ഫോട്ടോ തെളിവുകൾ ({complaint.evidence.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {complaint.evidence.map((ev, i) => (
                        <a
                          key={i}
                          href={ev.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition shadow-sm"
                        >
                          <img src={ev.file_url} alt="Evidence" className="h-28 w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visual Lifecycle Progress Timeline */}
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-[#087C63]" />
                  നടപടിക്രമങ്ങളുടെ പുരോഗതി (Status Progression)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  പരാതി ലഭിച്ചതുമുതൽ പരിഹാരം വരെയുള്ള തത്സമയ ഘട്ടങ്ങൾ
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2">
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {TIMELINE_STAGES.map((stage, idx) => {
                    const statusOrder = ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
                    const currentIdx = statusOrder.indexOf(complaint.current_status);
                    const isPassed = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div key={stage.key} className="relative flex items-start space-x-3">
                        <div
                          className={`absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                            isCurrent
                              ? 'bg-[#087C63] text-white ring-4 ring-[#E8F5EE]'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : idx + 1}
                        </div>

                        <div className="flex-1">
                          <h4 className={`text-xs sm:text-sm font-bold ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                            {stage.titleMl}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{stage.descMl}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Official Updates Log & Map Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Audit Updates */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-[#087C63]" />
                    ഔദ്യോഗിക അറിയിപ്പുകൾ (Official Action Log)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {complaint.updates && complaint.updates.length > 0 ? (
                    complaint.updates.map((up) => (
                      <div key={up.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700">{up.author_name || 'അധികാരി'}</span>
                          <span className="text-slate-400">
                            {new Date(up.created_at).toLocaleDateString('ml-IN')}
                          </span>
                        </div>
                        <p className="text-slate-600">{up.remarks || 'നടപടിക്രമങ്ങൾ പുരോഗമിക്കുന്നു.'}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 py-3">അപ്‌ഡേറ്റുകളൊന്നും ഇതുവരെ രേഖപ്പെടുത്തിയിട്ടില്ല.</div>
                  )}
                </CardContent>
              </Card>

              {/* Location Details & Mini Map */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-[#087C63]" />
                    സ്ഥല വിവരങ്ങൾ (Location Details)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">ജില്ല:</span>
                      <span className="font-semibold text-slate-800">{complaint.location.district}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">തദ്ദേശ സ്ഥാപനം:</span>
                      <span className="font-semibold text-slate-800">{complaint.location.lsgd_name}</span>
                    </div>
                    {complaint.location.ward_number && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">വാർഡ് നമ്പർ:</span>
                        <span className="font-semibold text-slate-800">{complaint.location.ward_number}</span>
                      </div>
                    )}
                    {complaint.location.landmark && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">ലാൻഡ്മാർക്ക്:</span>
                        <span className="font-semibold text-slate-800">{complaint.location.landmark}</span>
                      </div>
                    )}
                  </div>

                  {/* Leaflet Mini Map Preview */}
                  <div className="h-36 w-full rounded-xl overflow-hidden border border-slate-200 mt-2">
                    <MapContainer
                      center={[complaint.location.latitude, complaint.location.longitude]}
                      zoom={14}
                      scrollWheelZoom={false}
                      zoomControl={false}
                      dragging={false}
                      className="h-full w-full"
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[complaint.location.latitude, complaint.location.longitude]}
                        icon={markerIcon}
                      />
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
