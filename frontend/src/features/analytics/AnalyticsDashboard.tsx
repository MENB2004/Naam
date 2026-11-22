import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { AnalyticsSummaryResponse } from '../../types/analytics';
import { CategoryPieChart } from './CategoryPieChart';
import { ResolutionTrendChart } from './ResolutionTrendChart';
import { DistrictBarChart } from './DistrictBarChart';
import { PortalHeader } from '../../components/layout/PortalHeader';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

export const AnalyticsDashboard: React.FC = () => {
  const { i18n } = useTranslation();
  const isMl = i18n.language === 'ml';

  const [days, setDays] = useState<number>(14);
  const [data, setData] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (selectedDays: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsService.getSummary(selectedDays);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'ഡാറ്റ ശേഖരിക്കുന്നതിൽ തടസ്സം നേരിട്ടു / Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(days);
  }, [days]);

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    try {
      setExporting(true);
      await analyticsService.downloadReport(format);
    } catch (err: any) {
      alert(err.message || 'Error downloading report');
    } finally {
      setExporting(false);
    }
  };

  const overview = data?.overview;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <PortalHeader activeRole="AUTHORITY" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <BarChart3 className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {isMl ? 'പരിസ്ഥിതി അനലിറ്റിക്സ് ഡാഷ്‌ബോർഡ്' : 'Environmental Analytics & Intelligence'}
                </h1>
                <p className="text-xs text-slate-500">
                  {isMl
                    ? 'തത്സമയ പരാതികൾ, വകുപ്പുതല പരിഹാര പുരോഗതി, ജില്ലാ സ്ഥിതിവിവരക്കണക്കുകൾ'
                    : 'Real-time complaints, departmental resolution metrics, and Kerala district analytics'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Time Filter Buttons */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm text-xs">
              {[
                { label: isMl ? '7 ദിവസം' : '7 Days', val: 7 },
                { label: isMl ? '14 ദിവസം' : '14 Days', val: 14 },
                { label: isMl ? '30 ദിവസം' : '30 Days', val: 30 },
                { label: isMl ? '90 ദിവസം' : '90 Days', val: 90 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setDays(opt.val)}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    days === opt.val
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(days)}
              disabled={loading}
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              {isMl ? 'പുതുക്കുക' : 'Refresh'}
            </Button>

            {/* Export Report */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {exporting
                ? isMl ? 'ഡൗൺലോഡ് ചെയ്യുന്നു...' : 'Exporting...'
                : isMl ? 'റിപ്പോർട്ട് CSV' : 'Export CSV'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">
                  {isMl ? 'ആകെ പരാതികൾ' : 'Total Reports'}
                </span>
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {overview?.total_complaints ?? 0}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {isMl ? 'സമർപ്പിച്ചവ' : 'All-time'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">
                  {isMl ? 'പരിഹരിച്ചവ' : 'Resolved'}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                {overview?.resolved_complaints ?? 0}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {isMl ? 'വിജയകരമായി പൂർത്തിയാക്കി' : 'Action verified'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">
                  {isMl ? 'നടപടിയിൽ' : 'In Progress'}
                </span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-700">
                {overview?.in_progress_complaints ?? 0}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {isMl ? 'ഉദ്യോഗസ്ഥ ചുമതലയിൽ' : 'Under field action'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">
                  {isMl ? 'പരിഹാര നിരക്ക്' : 'Resolution Rate'}
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {overview?.resolution_rate ?? 0}%
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {isMl ? 'ശരാശരി കാര്യക്ഷമത' : 'Platform SLA'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">
                  {isMl ? 'ശരാശരി സമയം' : 'Avg Resolution'}
                </span>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {overview?.average_resolution_hours ?? 0}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  {isMl ? 'മണി' : 'hrs'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {isMl ? 'പരിഹരിക്കാനെടുത്ത സമയം' : 'Turnaround speed'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">
                  {isMl ? 'സജീവ മുന്നറിയിപ്പുകൾ' : 'Active Alerts'}
                </span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {overview?.active_alerts ?? 0}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {isMl ? 'അടിയന്തര അറിയിപ്പുകൾ' : 'Emergency alerts'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row: Category Distribution + Resolution Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    {isMl ? 'പ്രശ്ന വിഭാഗങ്ങളുടെ വിതരണം' : 'Complaint Category Distribution'}
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    {isMl
                      ? 'വിവിധ പരിസ്ഥിതി പ്രശ്നങ്ങളുടെ ശതമാന വിഹിതം'
                      : 'Proportion of environmental issues reported'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data ? (
                <CategoryPieChart data={data.categories} isMalayalam={isMl} />
              ) : (
                <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
                  {isMl ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Intake vs Resolution Trend */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    {isMl ? 'പരാതി - പരിഹാര പുരോഗതി ഗതി' : 'Intake vs Resolution Trends'}
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    {isMl
                      ? `കഴിഞ്ഞ ${days} ദിവസങ്ങളിലെ ദൈനംദിന താരതമ്യം`
                      : `Daily intake vs resolution activity over last ${days} days`}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data ? (
                <ResolutionTrendChart data={data.trends} isMalayalam={isMl} />
              ) : (
                <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
                  {isMl ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* District Performance Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* District Bar Chart */}
          <Card className="lg:col-span-2 border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    {isMl ? 'ജില്ലാ തിരിച്ചുള്ള പരാതി താരതമ്യം' : 'District-Wise Report Volumes'}
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    {isMl
                      ? 'കൂടുതൽ പരാതികൾ ലഭിച്ച പ്രധാന ജില്ലകൾ'
                      : 'Complaint volume and resolution status across Kerala'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data ? (
                <DistrictBarChart data={data.districts} isMalayalam={isMl} />
              ) : (
                <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
                  {isMl ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* District Table / Fast Summary */}
          <Card className="border-slate-200 bg-white shadow-sm flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900">
                  {isMl ? 'ജില്ലാ പ്രകടനം' : 'District Performance'}
                </CardTitle>
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">
                {isMl ? '14 ജില്ലകളിലെ പരിഹാര നിരക്ക്' : 'Resolution rates across all 14 districts'}
              </p>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto max-h-80 p-0">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">{isMl ? 'ജില്ല' : 'District'}</th>
                    <th className="py-2.5 px-2 text-center">{isMl ? 'ആകെ' : 'Total'}</th>
                    <th className="py-2.5 px-2 text-center">{isMl ? 'തീർപ്പായത്' : 'Done'}</th>
                    <th className="py-2.5 px-3 text-right">{isMl ? 'നിരക്ക്' : 'Rate'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.districts.map((d) => (
                    <tr key={d.district} className="hover:bg-slate-50/70 transition">
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {isMl ? d.district_name_ml : d.district}
                      </td>
                      <td className="py-2 px-2 text-center text-slate-600">{d.total}</td>
                      <td className="py-2 px-2 text-center text-emerald-700 font-medium">
                        {d.resolved}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            d.resolution_rate >= 75
                              ? 'bg-emerald-100 text-emerald-800'
                              : d.resolution_rate >= 40
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {d.resolution_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
