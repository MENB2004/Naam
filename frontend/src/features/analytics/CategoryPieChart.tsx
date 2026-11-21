import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { CategoryDistribution } from '../../types/analytics';

interface CategoryPieChartProps {
  data: CategoryDistribution[];
  isMalayalam?: boolean;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  data,
  isMalayalam = true,
}) => {
  // Filter out zero counts if multiple categories exist with data, or show all
  const activeData = data.filter((item) => item.count > 0);
  const chartData = activeData.length > 0 ? activeData : data;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: CategoryDistribution = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-xl shadow-lg text-xs">
          <p className="font-bold text-slate-800 text-sm">
            {isMalayalam ? item.category_name_ml : item.category_name_en}
          </p>
          <div className="mt-1 space-y-0.5 text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">{item.count}</span>{' '}
              {isMalayalam ? 'പരാതികൾ' : 'complaints'}
            </p>
            <p className="text-emerald-700 font-bold">
              {item.percentage}% {isMalayalam ? 'വിഹിതം' : 'share'}
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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="count"
            nameKey={isMalayalam ? 'category_name_ml' : 'category_name_en'}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }}
            formatter={(value: string) => (
              <span className="text-slate-700 font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
