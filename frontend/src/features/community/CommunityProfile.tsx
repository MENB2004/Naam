import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, UserRound } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export function CommunityProfile() {
  const navigate = useNavigate();
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [locality, setLocality] = useState(user?.locality ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try {
      const updated = await authService.updateMyProfile({ full_name: fullName.trim(), phone: phone.trim() || undefined, locality: locality.trim() || undefined });
      if (accessToken && refreshToken) setAuth(updated, accessToken, refreshToken);
      setMessage('പ്രൊഫൈൽ പുതുക്കി. Profile updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'പ്രൊഫൈൽ പുതുക്കാനായില്ല.');
    } finally { setSaving(false); }
  };

  return <div className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto max-w-xl"><div className="mb-6 flex items-center justify-between"><Logo height={38}/><Link to="/community/dashboard" className="inline-flex items-center text-sm text-slate-600 hover:text-primary"><ArrowLeft size={16} className="mr-2"/>ഡാഷ്ബോർഡ്</Link></div><Card><CardHeader><div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><UserRound size={20}/></div><CardTitle>എന്റെ പ്രൊഫൈൽ</CardTitle><p className="text-sm text-slate-600">നിങ്ങളുടെ അക്കൗണ്ട് വിവരങ്ങൾ നിയന്ത്രിക്കുക.</p></CardHeader><CardContent><form onSubmit={save} className="space-y-4">{message && <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={16}/>{message}</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<label className="block text-sm font-medium">പൂർണ്ണ നാമം<input required minLength={2} maxLength={150} value={fullName} onChange={e=>setFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"/></label><label className="block text-sm font-medium">ഇമെയിൽ<input disabled value={user?.email ?? ''} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-slate-500"/><span className="mt-1 block text-xs text-slate-500">ഇമെയിൽ മാറ്റാൻ പിന്തുണാ സേവനവുമായി ബന്ധപ്പെടുക.</span></label><label className="block text-sm font-medium">ഫോൺ നമ്പർ<input type="tel" maxLength={20} value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"/></label><label className="block text-sm font-medium">പ്രദേശം / പൊതുവായ വിലാസം<input maxLength={255} value={locality} onChange={e=>setLocality(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"/></label><div className="flex gap-3"><Button disabled={saving} type="submit">{saving ? 'സംരക്ഷിക്കുന്നു…' : 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക'}</Button><Button type="button" variant="outline" onClick={()=>navigate('/community/dashboard')}>റദ്ദാക്കുക</Button></div></form></CardContent></Card></div></div>;
}
