
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { Student } from '../types';

interface DashboardProps {
  students: Student[];
}

const Dashboard: React.FC<DashboardProps> = ({ students }) => {
  const stats = useMemo(() => {
    const counts = {
      total: students.length,
      nationalities: new Set(students.map(s => s.nationality)).size,
      paid: students.filter(s => s.fees === 'نعم').length,
      teachers: new Set(students.map(s => s.teacher)).size,
    };

    const levelData = students.reduce((acc: any, curr) => {
      const level = curr.level || 'غير محدد';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    return {
      counts,
      levelChart: Object.keys(levelData).map(k => ({ name: k, count: levelData[k] })),
    };
  }, [students]);

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي الدارسين', value: stats.counts.total, color: 'indigo', trend: '+12%', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { label: 'التنوع الجغرافي', value: stats.counts.nationalities, color: 'blue', trend: 'عالمي', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 012.5 2.5V17M12.828 4.405l-.01.01M16.5 4.5l.01.01' },
          { label: 'المحصلة المالية', value: stats.counts.paid, color: 'emerald', trend: '75%', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'الطاقم التعليمي', value: stats.counts.teachers, color: 'amber', trend: 'نشط', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9-5-9 5 9 5zm0 0v6m0 0l4-2.223M12 20l-4-2.223' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 bg-${card.color}-50 text-${card.color}-600 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon}/></svg>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 bg-${card.color}-50 text-${card.color}-700 rounded-full border border-${card.color}-100`}>{card.trend}</span>
            </div>
            <h4 className="text-slate-400 text-xs font-bold mb-1">{card.label}</h4>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-slate-900 font-black text-xl tracking-tight">توزيع الدارسين حسب المستويات</h3>
                <p className="text-slate-400 text-xs font-medium mt-1">إحصائية شاملة لجميع الحلقات الحالية</p>
              </div>
           </div>
           <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.levelChart}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Info Card */}
        <div className="bg-indigo-900 p-10 rounded-[3rem] text-white relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
           <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4 leading-tight">جاهز لتوسعة <br/>حلقاتك؟</h3>
              <p className="text-indigo-200 text-sm font-medium leading-relaxed mb-10">يمكنك الآن إضافة معلمين جدد وربطهم بجداول البيانات التلقائية في ثوانٍ معدودة.</p>
           </div>
           <button className="bg-white text-indigo-900 w-full py-5 rounded-[2rem] font-black text-sm shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3">
              إنشاء تقرير فوري
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
