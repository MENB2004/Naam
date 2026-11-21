import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types/complaint';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

export const MyReports: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const fetchReports = () => {
    setIsLoading(true);
    complaintService
      .getMyComplaints()
      .then((data) => setComplaints(data))
      .catch((err) => console.error('Failed to load my reports', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.current_status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F0F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to="/community" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#087C63] mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              ഡാഷ്‌ബോർഡിലേക്ക് മടങ്ങുക
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              എന്റെ പരാതികൾ (My Submitted Reports)
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              നിങ്ങൾ സമർപ്പിച്ച പരിസ്ഥിതി പരാതികളും അവയുടെ നിലവിലെ പുരോഗതിയും.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              disabled={isLoading}
              className="text-xs text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              പുതുക്കുക
            </Button>
            <Link to="/community/report">
              <Button variant="primary" size="sm" className="bg-[#087C63]">
                <Plus className="w-4 h-4 mr-1.5" />
                പുതിയ പരാതി നൽകുക
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="ട്രാക്കിംഗ് കോഡ്, വിഷയം അല്ലെങ്കിൽ ജില്ല നൽകി തിരയുക..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#087C63]"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-[#087C63]"
              >
                <option value="ALL">എല്ലാ സ്റ്റാറ്റസുകളും</option>
                <option value="SUBMITTED">സമർപ്പിച്ചു (SUBMITTED)</option>
                <option value="VERIFIED">പരിശോധിച്ചു (VERIFIED)</option>
                <option value="ASSIGNED">ചുമതലപ്പെടുത്തി (ASSIGNED)</option>
                <option value="IN_PROGRESS">നടപടിയിൽ (IN PROGRESS)</option>
                <option value="RESOLVED">പരിഹരിച്ചു (RESOLVED)</option>
                <option value="REJECTED">നിരസിച്ചു (REJECTED)</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-[#087C63]"
              >
                <option value="ALL">എല്ലാ വിഭാഗങ്ങളും</option>
                <option value="WASTE">മാലിന്യ നിക്ഷേപം</option>
                <option value="WATER_POLLUTION">ജല മലിനീകരണം</option>
                <option value="DRAINAGE">ഡ്രെയിനേജ് തടസ്സം</option>
                <option value="AIR_POLLUTION">വായു മലിനീകരണം</option>
                <option value="DEFORESTATION">വനനശീകരണം</option>
                <option value="ILLEGAL_MINING">അനധികൃത ഖനനം</option>
                <option value="OTHER">മറ്റ് പ്രശ്നങ്ങൾ</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Listing */}
        {isLoading ? (
          <div className="text-center py-12 text-xs text-slate-500">പരാതി വിവരങ്ങൾ ലഭ്യമാക്കുന്നു...</div>
        ) : filteredComplaints.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">പരാതികളൊന്നും കണ്ടെത്തിയില്ല</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              തിരഞ്ഞെടുത്ത ഫിൽട്ടറുകൾക്ക് അനുയോജ്യമായ പരാതികൾ ലഭ്യമല്ല അല്ലെങ്കിൽ നിങ്ങൾ ഇതുവരെ പരാതികൾ സമർപ്പിച്ചിട്ടില്ല.
            </p>
            <Link to="/community/report">
              <Button variant="primary" size="sm" className="bg-[#087C63]">
                <Plus className="w-4 h-4 mr-1.5" />
                പുതിയ പരാതി നൽകുക
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComplaints.map((comp) => (
              <Card key={comp.id} className="border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#087C63] bg-[#E8F5EE] px-2.5 py-1 rounded-lg">
                      {comp.tracking_code}
                    </span>
                    <StatusBadge status={comp.current_status} size="sm" />
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      {comp.category_display_ml}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">{comp.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {comp.description}
                    </p>
                  </div>

                  {comp.evidence && comp.evidence.length > 0 && (
                    <div className="flex items-center space-x-2 pt-1">
                      {comp.evidence.slice(0, 3).map((ev, i) => (
                        <img
                          key={i}
                          src={ev.file_url}
                          alt="Evidence"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                        />
                      ))}
                      {comp.evidence.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-500 font-semibold text-[11px] flex items-center justify-center">
                          +{comp.evidence.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{comp.location.district}, {comp.location.lsgd_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(comp.created_at).toLocaleDateString('ml-IN')}</span>
                    </div>
                  </div>
                </CardContent>

                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
                  <span className="text-[11px] text-slate-500">
                    അപ്‌ഡേറ്റുകൾ: <strong>{comp.updates?.length || 1}</strong>
                  </span>
                  <Link to={`/track/${comp.tracking_code}`}>
                    <Button variant="outline" size="sm" className="text-xs text-[#087C63] border-[#087C63]/30 hover:bg-[#E8F5EE]">
                      പൂർണ്ണ വിവരങ്ങളും പുരോഗതിയും
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
