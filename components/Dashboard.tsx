
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { Student } from '../types';

interface DashboardProps {
  students: Student[];
}

const LEVEL_ORDER = ['تمهيدي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

const Dashboard: React.FC<DashboardProps> = ({ students }) => {
  const stats = useMemo(() => {
    const counts = {
      total: students.length,
      nationalities: new Set(students.map(s => s.nationality)).size,
      paid: students.filter(s => s.fees === 'نعم').length,
      teachers: new Set(students.map(s => s.teacher)).size,
    };

    const levelMap = students.reduce((acc: any, curr) => {
      const level = curr.level || 'غير محدد';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const levelChart = LEVEL_ORDER.map(name => ({
      name,
      count: levelMap[name] || 0
    }));

    return { counts, levelChart };
  }, [students]);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'إجمالي الدارسين', value: stats.counts.total, color: 'emerald', trend: 'نشط', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { label: 'التنوع الجغرافي', value: stats.counts.nationalities, color: 'amber', trend: 'دولي', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 012.5 2.5V17M12.828 4.405l-.01.01M16.5 4.5l.01.01' },
          { label: 'المحصلة المالية', value: stats.counts.paid, color: 'teal', trend: 'مدفوع', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'الطاقم التعليمي', value: stats.counts.teachers, color: 'emerald', trend: 'محفظ', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9-5-9 5 9 5zm0 0v6m0 0l4-2.223M12 20l-4-2.223' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all group">
            <div className="flex justify-between items-start mb-8">
              <div className={`w-16 h-16 bg-${card.color}-50 text-${card.color}-600 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon}/></svg>
              </div>
              <span className={`text-[10px] font-black px-3.5 py-1.5 bg-${card.color}-50 text-${card.color}-700 rounded-full border border-${card.color}-100 tracking-widest`}>{card.trend}</span>
            </div>
            <h4 className="text-slate-400 text-xs font-bold mb-1 tracking-tight">{card.label}</h4>
            <div className="text-5xl font-black text-slate-900 tracking-tighter">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-40 blur-3xl"></div>
        <h3 className="text-slate-900 font-black text-2xl mb-12 pr-4 relative z-10 flex items-center gap-4">
            <div className="w-2 h-10 bg-emerald-600 rounded-full"></div>
            تحليل مستويات الطلاب الأكاديمية
        </h3>
        <div className="h-[450px] relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.levelChart}>
              <defs>
                <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 800, fill: '#64748b' }} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 800, fill: '#94A3B8' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '15px' }} 
                itemStyle={{ fontWeight: 900, color: '#064e3b' }}
              />
              <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorEmerald)" dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
