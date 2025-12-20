
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Student } from '../types';

interface DashboardProps {
  students: Student[];
}

const COLORS = ['#0d9488', '#0f766e', '#14b8a6', '#5eead4', '#99f6e4', '#ccfbf1'];

const Dashboard: React.FC<DashboardProps> = ({ students }) => {
  const stats = useMemo(() => {
    const counts = {
      total: students.length,
      nationalities: new Set(students.map(s => s.nationality)).size,
      paid: students.filter(s => s.fees === 'نعم').length,
      unpaid: students.filter(s => s.fees !== 'نعم').length,
    };

    const levelData = students.reduce((acc: any, curr) => {
      const level = curr.level || 'غير محدد';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const categoryData = students.reduce((acc: any, curr) => {
      const cat = curr.category || 'غير محدد';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return {
      counts,
      levelChart: Object.keys(levelData).map(k => ({ name: k, value: levelData[k] })),
      categoryChart: Object.keys(categoryData).map(k => ({ name: k, value: categoryData[k] })),
    };
  }, [students]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الدارسين', value: stats.counts.total, icon: '👥', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'الجنسيات المختلفة', value: stats.counts.nationalities, icon: '🌍', color: 'bg-blue-50 text-blue-700' },
          { label: 'مسددي الرسوم', value: stats.counts.paid, icon: '💰', color: 'bg-teal-50 text-teal-700' },
          { label: 'غير مسددين', value: stats.counts.unpaid, icon: '⚠️', color: 'bg-amber-50 text-amber-700' },
        ].map((card, i) => (
          <div key={i} className={`p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md ${card.color}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-80">{card.label}</p>
                <h3 className="text-3xl font-extrabold mt-1">{card.value}</h3>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">توزيع الدارسين حسب المستوى</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.levelChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">توزيع الدارسين حسب الفئة</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
