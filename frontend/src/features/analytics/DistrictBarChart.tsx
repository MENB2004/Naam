import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DistrictMetric } from '../../types/analytics';

interface DistrictBarChartProps {
  data: DistrictMetric[];
  isMalayalam?: boolean;
}

export const DistrictBarChart: React.FC<DistrictBarChartProps> = ({
  data,
  isMalayalam = true,
}) => {
  // Show top districts or all with non-zero, or default top 8 for clean visualization
  const displayData = data.slice(0, 8);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const metric = data.find((d) => (isMalayalam ? d.district_name_ml : d.district) === label);
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-xl shadow-lg text-xs">
          <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-slate-600 flex justify-between gap-3">
              <span>{isMalayalam ? 'ആകെ പരാതികൾ:' : 'Total:'}</span>
              <span className="font-semibold text-slate-900">{metric?.total || 0}</span>
            </p>
            <p className="text-emerald-700 flex justify-between gap-3">
              <span>{isMalayalam ? 'പരിഹരിച്ചവ:' : 'Resolved:'}</span>
              <span className="font-semibold">{metric?.resolved || 0}</span>
            </p>
            <p className="text-amber-700 flex justify-between gap-3">
              <span>{isMalayalam ? 'പരിഹാര നിരക്ക്:' : 'Resolution Rate:'}</span>
              <span className="font-bold">{metric?.resolution_rate || 0}%</span>
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
        <BarChart
          data={displayData}
          margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey={isMalayalam ? 'district_name_ml' : 'district'}
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value: string) => {
              if (value === 'total') return isMalayalam ? 'ആകെ പരാതികൾ' : 'Total Reports';
              if (value === 'resolved') return isMalayalam ? 'പരിഹരിച്ചവ' : 'Resolved';
              return value;
            }}
          />
          <Bar
            dataKey="total"
            fill="#38bdf8"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="resolved"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
