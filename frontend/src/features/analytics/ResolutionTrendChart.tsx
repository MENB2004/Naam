import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendPoint } from '../../types/analytics';

interface ResolutionTrendChartProps {
  data: TrendPoint[];
  isMalayalam?: boolean;
}

export const ResolutionTrendChart: React.FC<ResolutionTrendChartProps> = ({
  data,
  isMalayalam = true,
}) => {
  const formattedData = data.map((point) => {
    // Show short date like "11-22"
    const parts = point.date.split('-');
    const shortDate = parts.length === 3 ? `${parts[1]}/${parts[2]}` : point.date;
    return {
      ...point,
      displayDate: shortDate,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-xl shadow-lg text-xs">
          <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-amber-700 font-semibold flex items-center justify-between gap-3">
              <span>{isMalayalam ? 'റിപ്പോർട്ട് ചെയ്തവ:' : 'Reported:'}</span>
              <span className="font-bold">{payload[0]?.value ?? 0}</span>
            </p>
            <p className="text-emerald-700 font-semibold flex items-center justify-between gap-3">
              <span>{isMalayalam ? 'പരിഹരിച്ചവ:' : 'Resolved:'}</span>
              <span className="font-bold">{payload[1]?.value ?? 0}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value: string) => {
              if (value === 'reported') return isMalayalam ? 'റിപ്പോർട്ട് ചെയ്തവ' : 'Reported';
              if (value === 'resolved') return isMalayalam ? 'പരിഹരിച്ചവ' : 'Resolved';
              return value;
            }}
          />
          <Area
            type="monotone"
            dataKey="reported"
            stroke="#f59e0b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorReported)"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorResolved)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
