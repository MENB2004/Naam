import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Camera,
  AlertCircle,
  Send,
  Upload,
} from 'lucide-react';
import { Complaint } from '../../types/complaint';
import { complaintService } from '../../services/complaintService';
import { Button } from '../../components/ui/button';

interface ResolutionProofModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Complaint) => void;
}

export const ResolutionProofModal: React.FC<ResolutionProofModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSampleResolvedPhoto = () => {
    // High-resolution clean cleaned-up environmental photo
    const sample = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80';
    setPhotos((prev) => [...prev, sample]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setError('ദയവായി പരിഹാര നടപടി വിവരണം നൽകുക.');
      return;
    }
    if (photos.length === 0) {
      setError('കുറഞ്ഞത് ഒരു പരിഹാര ഫോട്ടോയെങ്കിലും അപ്‌ലോഡ് ചെയ്യേണ്ടതുണ്ട് (Resolution photo is mandatory).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updated = await complaintService.resolveComplaintWithProof(complaint.id, {
        resolution_notes: resolutionNotes.trim(),
        evidence_photos: photos.map((url) => ({
          file_url: url,
          file_type: 'image/jpeg',
          file_size_bytes: 1048576,
          evidence_type: 'FIELD_RESOLUTION_PROOF',
        })),
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'പരിഹാര തെളിവ് സമർപ്പിക്കുന്നതിൽ പിശക് സംഭവിച്ചു.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">പരിഹാര തെളിവ് സമർപ്പിക്കുക (Resolution Proof)</h3>
              <span className="font-mono text-[11px] text-emerald-800 font-semibold">{complaint.tracking_code}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
            <span className="text-slate-500 font-medium">പരാതി വിഷയം:</span>
            <div className="font-bold text-slate-900 line-clamp-1">{complaint.title}</div>
            <div className="text-[11px] text-slate-500">
              സ്ഥലം: {complaint.location.district}, {complaint.location.lsgd_name}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              പരിഹാര നടപടിയെക്കുറിച്ചുള്ള വിശദമായ കുറിപ്പ് (Inspection / Action Notes) *
            </label>
            <textarea
              rows={3}
              required
              placeholder="ഉദാ: ഹരിതകർമ്മസേനയെ നിയോഗിച്ച് സ്ഥലത്തെ പ്ലാസ്റ്റിക് മാലിന്യങ്ങൾ മുഴുവൻ നീക്കം ചെയ്തു..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center">
                <Camera className="w-4 h-4 mr-1 text-emerald-600" />
                <span>പരിഹരിച്ച ശേഷമുള്ള ഫോട്ടോകൾ (Resolution Proof Photos) *</span>
              </label>
              <button
                type="button"
                onClick={handleAddSampleResolvedPhoto}
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                + സാമ്പിൾ ഫോട്ടോ ചേർക്കുക
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50/50 hover:bg-slate-50 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                id="proof-upload"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700">
                  ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക
                </span>
                <span className="text-[10px] text-slate-500">JPEG, PNG അല്ലെങ്കിൽ WebP</span>
              </label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {photos.map((p, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 h-16">
                    <img src={p} alt="Proof" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 shadow"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              റദ്ദാക്കുക
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || !resolutionNotes.trim() || photos.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {isLoading ? 'സമർപ്പിക്കുന്നു...' : 'പരിഹരിച്ചതായി സ്ഥിരീകരിക്കുക'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
