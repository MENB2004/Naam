import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Shield,
  AlertCircle,
  Camera,
  Send,
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types/complaint';
import { useAuthStore } from '../../store/authStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ComplaintTimeline } from './ComplaintTimeline';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

const pinIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transition Action Form State
  const [selectedTargetStatus, setSelectedTargetStatus] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchComplaintData = () => {
    if (!id) return;
    setIsLoading(true);
    complaintService
      .getComplaintById(id)
      .then((data) => {
        setComplaint(data);
      })
      .catch((err: any) => {
        setError(err.message || 'പരാതി വിവരങ്ങൾ ലഭ്യമാക്കാൻ സാധിച്ചില്ല.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaintData();
  }, [id]);

  const handleExecuteTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedTargetStatus || !remarks.trim()) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const updated = await complaintService.updateComplaintStatus(id, {
        new_status: selectedTargetStatus,
        remarks: remarks.trim(),
      });
      setComplaint(updated);
      setSelectedTargetStatus(null);
      setRemarks('');
    } catch (err: any) {
      setUpdateError(err.message || 'സ്റ്റാറ്റസ് മാറ്റുന്നതിൽ പിശക് സംഭവിച്ചു.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F7FA] flex items-center justify-center p-4">
        <div className="text-xs text-slate-500 flex items-center space-x-2">
          <Clock className="w-4 h-4 animate-spin text-[#087C63]" />
          <span>വിവരങ്ങൾ ലഭ്യമാക്കുന്നു...</span>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-[#F0F7FA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">പരാതി കണ്ടെത്തിയില്ല</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
          <Link to="/">
            <Button variant="outline" size="sm">ഹോം പേജിലേക്ക് മടങ്ങുക</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Determine allowed transition options for the logged-in user
  const userRole = user?.role || 'COMMUNITY';
  const currentStatus = complaint.current_status;

  const getAvailableActions = () => {
    const actions: { target: string; labelMl: string; colorClass: string }[] = [];

    if (userRole === 'AUTHORITY' || userRole === 'SUPER_ADMIN') {
      if (currentStatus === 'SUBMITTED') {
        actions.push({ target: 'VERIFIED', labelMl: 'പരിശോധിച്ചു സ്ഥിരീകരിക്കുക', colorClass: 'bg-blue-600 hover:bg-blue-700' });
        actions.push({ target: 'REJECTED', labelMl: 'പരാതി നിരസിക്കുക', colorClass: 'bg-red-600 hover:bg-red-700' });
      } else if (currentStatus === 'VERIFIED') {
        actions.push({ target: 'IN_PROGRESS', labelMl: 'നടപടിയിലേക്ക് മാറ്റുക', colorClass: 'bg-teal-600 hover:bg-teal-700' });
        actions.push({ target: 'REJECTED', labelMl: 'നിരസിക്കുക', colorClass: 'bg-red-600 hover:bg-red-700' });
      } else if (currentStatus === 'IN_PROGRESS' || currentStatus === 'ACTION_TAKEN') {
        actions.push({ target: 'RESOLVED', labelMl: 'പരിഹരിച്ചതായി രേഖപ്പെടുത്തുക', colorClass: 'bg-emerald-600 hover:bg-emerald-700' });
      }
    }

    if (userRole === 'OFFICER' || userRole === 'SUPER_ADMIN') {
      if (currentStatus === 'ASSIGNED' || currentStatus === 'VERIFIED') {
        actions.push({ target: 'IN_PROGRESS', labelMl: 'സ്ഥലപരിശോധന ആരംഭിക്കുക', colorClass: 'bg-amber-600 hover:bg-amber-700' });
      } else if (currentStatus === 'IN_PROGRESS') {
        actions.push({ target: 'ACTION_TAKEN', labelMl: 'നടപടി പൂർത്തിയാക്കി', colorClass: 'bg-teal-600 hover:bg-teal-700' });
        actions.push({ target: 'RESOLVED', labelMl: 'പരിഹരിച്ചു', colorClass: 'bg-emerald-600 hover:bg-emerald-700' });
      }
    }

    if (userRole === 'COMMUNITY') {
      if (currentStatus === 'REJECTED') {
        actions.push({ target: 'APPEALED', labelMl: 'അപ്പീൽ നൽകുക (Appeal)', colorClass: 'bg-purple-600 hover:bg-purple-700' });
      } else if (currentStatus === 'RESOLVED') {
        actions.push({ target: 'REOPENED', labelMl: 'പുനഃപരിശോധന ആവശ്യപ്പെടുക', colorClass: 'bg-rose-600 hover:bg-rose-700' });
      }
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <div className="min-h-screen bg-[#F0F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/community/my-reports" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#087C63]">
            <ArrowLeft className="w-4 h-4 mr-1" />
            പരാതികളുടെ പട്ടികയിലേക്ക് മടങ്ങുക
          </Link>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-[#087C63] bg-[#E8F5EE] px-3 py-1 rounded-lg">
              {complaint.tracking_code}
            </span>
            <StatusBadge status={complaint.current_status} size="md" />
          </div>
        </div>

        {/* Complaint Header Card */}
        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  {complaint.category_display_ml} ({complaint.category})
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{complaint.title}</h1>
              </div>
              <div className="text-left sm:text-right text-xs text-slate-500">
                <div>സമർപ്പിച്ച തീയതി: {new Date(complaint.created_at).toLocaleDateString('ml-IN')}</div>
                <div className="font-semibold text-slate-700">പരാതിക്കാരൻ: {complaint.reporter_name || 'പൗരൻ'}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">പരാതി വിവരണം</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {/* Evidence Photos */}
            {complaint.evidence && complaint.evidence.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                  <Camera className="w-3.5 h-3.5 mr-1 text-[#087C63]" />
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

        {/* Location & Map Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-[#087C63]" />
                സ്ഥല വിവരങ്ങൾ (Location Details)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ജില്ല:</span>
                <span className="font-semibold text-slate-800">{complaint.location.district}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">തദ്ദേശ സ്ഥാപനം:</span>
                <span className="font-semibold text-slate-800">{complaint.location.lsgd_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">തരം:</span>
                <span className="font-semibold text-slate-800">{complaint.location.lsgd_type}</span>
              </div>
              {complaint.location.ward_number && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">വാർഡ് നമ്പർ:</span>
                  <span className="font-semibold text-slate-800">{complaint.location.ward_number}</span>
                </div>
              )}
              {complaint.location.landmark && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">ലാൻഡ്മാർക്ക്:</span>
                  <span className="font-semibold text-slate-800">{complaint.location.landmark}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-900">മാപ്പ് ലൊക്കേഷൻ (Geo-tag)</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[160px]">
              <MapContainer
                center={[complaint.location.latitude, complaint.location.longitude]}
                zoom={14}
                scrollWheelZoom={false}
                zoomControl={false}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[complaint.location.latitude, complaint.location.longitude]}
                  icon={pinIcon}
                />
              </MapContainer>
            </CardContent>
          </Card>
        </div>

        {/* State Machine Transition Action Panel */}
        {availableActions.length > 0 && (
          <Card className="border-slate-200 shadow-md bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-[#087C63]" />
                നടപടിക്രമങ്ങൾ രേഖപ്പെടുത്തുക (Lifecycle Transition Actions)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                നിങ്ങളുടെ റോളിന് ({user?.roleDisplayMl || userRole}) ലഭ്യമായ ഔദ്യോഗിക നടപടികൾ
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {updateError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{updateError}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2.5">
                {availableActions.map((act) => (
                  <button
                    key={act.target}
                    type="button"
                    onClick={() => {
                      setSelectedTargetStatus(act.target);
                      setRemarks('');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition shadow-sm ${act.colorClass} ${
                      selectedTargetStatus === act.target ? 'ring-2 ring-offset-2 ring-slate-900' : ''
                    }`}
                  >
                    {act.labelMl}
                  </button>
                ))}
              </div>

              {selectedTargetStatus && (
                <form onSubmit={handleExecuteTransition} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>നടപടി മാറ്റം: <span className="text-[#087C63] font-mono">{selectedTargetStatus}</span></span>
                    <button
                      type="button"
                      onClick={() => setSelectedTargetStatus(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      റദ്ദാക്കുക
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ഔദ്യോഗിക കുറിപ്പ് / വിശദീകരണം (Remarks) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="നടപടിയെക്കുറിച്ചുള്ള വിശദമായ കുറിപ്പ് ഇവിടെ രേഖപ്പെടുത്തുക..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white focus:ring-2 focus:ring-[#087C63]"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isUpdating || !remarks.trim()}
                      className="text-xs bg-[#087C63]"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {isUpdating ? 'രേഖപ്പെടുത്തുന്നു...' : 'നടപടി സ്ഥിരീകരിക്കുക'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Complaint Audit Timeline Section */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-[#087C63]" />
              പൂർണ്ണ നടപടിക്രമ നാൾവഴി (Audit Trail Timeline)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              പരാതി ലഭിച്ചതുമുതലുള്ള എല്ലാ ഔദ്യോഗിക മാറ്റങ്ങളും രേഖപ്പെടുത്തിയ ചരിത്രം
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ComplaintTimeline updates={complaint.updates || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
