import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HardHat,
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  LogOut,
  Camera,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types/complaint';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Logo } from '../../components/common/Logo';
import { NotificationDropdown } from '../../components/layout/NotificationDropdown';
import { ResolutionProofModal } from './ResolutionProofModal';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export const OfficerTaskList: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [tasks, setTasks] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaskForResolve, setSelectedTaskForResolve] = useState<Complaint | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchTasks = () => {
    setIsLoading(true);
    complaintService
      .getOfficerTasks()
      .then((data) => {
        setTasks(data);
      })
      .catch((err) => {
        console.error('Failed to load officer tasks', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStartInspection = async (taskId: string) => {
    setActionLoadingId(taskId);
    try {
      const updated = await complaintService.updateComplaintStatus(taskId, {
        new_status: 'IN_PROGRESS',
        remarks: 'ഫീൽഡ് ഇൻസ്പെക്ടർ സ്ഥലത്തെത്തി പരിശോധന ആരംഭിച്ചു.',
      });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err: any) {
      alert(err.message || 'സ്റ്റാറ്റസ് അപ്‌ഡേറ്റ് ചെയ്യുന്നതിൽ പിശക് സംഭവിച്ചു.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeCount = tasks.filter((t) => t.current_status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-background text-foreground border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo height={36} />
            <div className="border-l border-slate-200 pl-3 hidden sm:block">
              <span className="font-bold text-sm text-amber-900 tracking-tight block">ഫീൽഡ് ഓഫീസർ ഡെസ്ക്</span>
              <span className="text-[10px] text-slate-500 block">Mobile Field Operations</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationDropdown />
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800">{user?.fullName}</div>
              <div className="text-[11px] text-amber-700 font-semibold">{user?.roleDisplayMl || 'ഫീൽഡ് ഓഫീസർ'}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              ലോഗ് ഔട്ട്
            </Button>
          </div>
        </div>
      </header>

      {/* Main Task List View */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Officer Welcome & Summary */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-5 text-white shadow-md flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-medium mb-1.5">
              <HardHat className="w-3.5 h-3.5" />
              <span>ഫീൽഡ് ഇൻസ്പെക്ഷൻ യൂണിറ്റ്</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {user?.fullName}
            </h1>
            <p className="text-xs text-amber-100 mt-0.5">
              നിങ്ങൾക്ക് ഇപ്പോൾ നിർവ്വഹിക്കാനുള്ള സജീവ ദൗത്യങ്ങൾ: <strong>{activeCount}</strong>
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchTasks}
            disabled={isLoading}
            className="text-xs text-white border-white/40 hover:bg-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            പുതുക്കുക
          </Button>
        </div>

        {/* Task Cards Listing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>ചുമതലപ്പെടുത്തിയ പരാതികൾ (Assigned Tasks)</span>
            <span className="text-slate-500 font-normal">ആകെ: {tasks.length}</span>
          </div>

          {isLoading ? (
            <Card className="p-8 text-center text-xs text-slate-500">
              ദൗത്യ വിവരങ്ങൾ ലഭ്യമാക്കുന്നു...
            </Card>
          ) : tasks.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 border-slate-200">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">പുതിയ ഫീൽഡ് ദൗത്യങ്ങളൊന്നും നിലവിലില്ല</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                നിങ്ങൾക്ക് പുതിയ പരാതികൾ ചുമതലപ്പെടുത്തുമ്പോൾ അവ ഇവിടെ തത്സമയം ദൃശ്യമാകും.
              </p>
            </Card>
          ) : (
            tasks.map((task) => {
              const activeAssignment = task.assignments?.find((a) => a.status === 'ACTIVE');
              const isProgress = task.current_status === 'IN_PROGRESS';
              const isAssigned = task.current_status === 'ASSIGNED';
              const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${task.location.latitude},${task.location.longitude}`;

              return (
                <Card key={task.id} className="border-slate-200 shadow-sm overflow-hidden hover:border-amber-400 transition">
                  <CardContent className="p-5 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#087C63] bg-[#E8F5EE] px-2.5 py-1 rounded-lg">
                          {task.tracking_code}
                        </span>
                        <Badge variant="outline" className="text-[11px]">
                          {task.category_display_ml}
                        </Badge>
                      </div>
                      <StatusBadge status={task.current_status} size="sm" />
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{task.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    {/* Citizen Photo Preview */}
                    {task.evidence && task.evidence.length > 0 && (
                      <div className="flex items-center space-x-2 pt-1">
                        {task.evidence.slice(0, 2).map((ev, i) => (
                          <img
                            key={i}
                            src={ev.file_url}
                            alt="Citizen Evidence"
                            className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                          />
                        ))}
                      </div>
                    )}

                    {/* Authority Instructions & Deadline */}
                    {activeAssignment?.instructions && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                        <strong className="block text-[11px] text-amber-700">അധികാരിയുടെ നിർദ്ദേശം:</strong>
                        <span>{activeAssignment.instructions}</span>
                      </div>
                    )}

                    {/* Location & Navigation Link */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="font-medium">
                          {task.location.district}, {task.location.lsgd_name}
                          {task.location.ward_number ? ` (വാർഡ് ${task.location.ward_number})` : ''}
                        </span>
                      </div>

                      <a
                        href={navUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] transition w-fit"
                      >
                        <Navigation className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        GPS വഴി കാണിക്കുക (Google Maps)
                      </a>
                    </div>

                    {/* Action Execution Row */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <Link to={`/complaints/${task.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          പൂർണ്ണ വിവരങ്ങൾ
                        </Button>
                      </Link>

                      <div className="flex items-center space-x-2">
                        {isAssigned && (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={actionLoadingId === task.id}
                            onClick={() => handleStartInspection(task.id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                          >
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {actionLoadingId === task.id ? 'രേഖപ്പെടുത്തുന്നു...' : 'പരിശോധന ആരംഭിക്കുക'}
                          </Button>
                        )}

                        {isProgress && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedTaskForResolve(task)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                          >
                            <Camera className="w-3.5 h-3.5 mr-1" />
                            നടപടി പൂർത്തിയാക്കി തെളിവ് നൽകുക
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>

      {/* Resolution Proof Modal */}
      {selectedTaskForResolve && (
        <ResolutionProofModal
          complaint={selectedTaskForResolve}
          isOpen={!!selectedTaskForResolve}
          onClose={() => setSelectedTaskForResolve(null)}
          onSuccess={(updated) => {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          }}
        />
      )}
    </div>
  );
};
