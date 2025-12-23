
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Student, ViewType } from '../types';

interface DashboardProps {
  students: Student[];
  onNavigate: (view: ViewType) => void;
}

const LEVEL_ORDER = ['تمهيدي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
const ARAB_COUNTRIES = ['سعودي', 'مصري', 'أردني', 'سوري', 'يمني', 'سوداني', 'فلسطيني', 'مغربي', 'جزائري', 'تونس', 'عمان', 'كويت', 'قطر', 'إمارات', 'بحرين', 'لبنان', 'عراق', 'ليبيا', 'موريتانيا', 'صومال', 'جيبوتي', 'جزر القمر'];

type ChartDimension = 'level' | 'teacher' | 'category' | 'arabicity';

const Dashboard: React.FC<DashboardProps> = ({ students, onNavigate }) => {
  const [activeChart, setActiveChart] = useState<ChartDimension>('level');
  const [selectedDetail, setSelectedDetail] = useState<'nationalities' | 'fees' | 'teachers' | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  const stats = useMemo(() => {
    // إحصائيات عامة
    const teachersList = Array.from(new Set(students.map(s => s.teacher).filter(Boolean)));
    const nationalityMap = students.reduce((acc: any, s) => {
      acc[s.nationality] = (acc[s.nationality] || 0) + 1;
      return acc;
    }, {});

    const paidStudents = students.filter(s => s.fees === 'نعم');

    // بيانات الرسوم البيانية
    const getChartData = () => {
      if (activeChart === 'level') {
        const map = students.reduce((acc: any, s) => { acc[s.level || 'غير محدد'] = (acc[s.level || 'غير محدد'] || 0) + 1; return acc; }, {});
        return LEVEL_ORDER.map(name => ({ name, count: map[name] || 0 }));
      }
      if (activeChart === 'teacher') {
        const map = students.reduce((acc: any, s) => { acc[s.teacher || 'بدون محفظ'] = (acc[s.teacher || 'بدون محفظ'] || 0) + 1; return acc; }, {});
        return Object.entries(map).map(([name, count]) => ({ name, count: count as number })).sort((a, b) => b.count - a.count);
      }
      if (activeChart === 'category') {
        const map = students.reduce((acc: any, s) => { acc[s.category || 'غير محدد'] = (acc[s.category || 'غير محدد'] || 0) + 1; return acc; }, {});
        return Object.entries(map).map(([name, count]) => ({ name, count: count as number }));
      }
      if (activeChart === 'arabicity') {
        const isArab = (n: string) => ARAB_COUNTRIES.some(c => n.includes(c));
        const arabCount = students.filter(s => isArab(s.nationality)).length;
        return [
          { name: 'طلاب عرب', count: arabCount },
          { name: 'جنسيات أخرى', count: students.length - arabCount }
        ];
      }
      return [];
    };

    return {
      total: students.length,
      nationalities: Object.entries(nationalityMap).map(([name, count]) => ({ name, count: count as number })),
      paid: paidStudents,
      teachers: teachersList.map(t => ({ name: t, students: students.filter(s => s.teacher === t) })),
      chartData: getChartData()
    };
  }, [students, activeChart]);

  // إغلاق تفاصيل المحفظ والعودة لقائمة المحفظين
  const handleTeacherBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTeacher(null);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* البطاقات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* إجمالي المسجلين */}
        <button onClick={() => onNavigate('table')} className="bg-white p-10 rounded-[2.5rem] border border-[#EBEBEB] shadow-sm hover:border-[#84754E] hover:shadow-xl transition-all group text-right">
          <div className="w-14 h-14 bg-[#84754E]/5 text-[#84754E] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <h4 className="text-[#A1A1A1] text-[11px] font-black mb-1 uppercase tracking-[0.2em]">إجمالي المسجلين</h4>
          <div className="text-5xl font-black text-[#444] tracking-tighter flex items-center gap-3">
            {stats.total}
            <span className="text-sm font-bold text-[#84754E] bg-[#84754E]/5 px-3 py-1 rounded-full group-hover:bg-[#84754E] group-hover:text-white transition-colors">عرض السجل ←</span>
          </div>
        </button>

        {/* تعدد الجنسيات */}
        <button onClick={() => setSelectedDetail('nationalities')} className={`bg-white p-10 rounded-[2.5rem] border shadow-sm transition-all group text-right ${selectedDetail === 'nationalities' ? 'border-[#84754E] ring-2 ring-[#84754E]/5' : 'border-[#EBEBEB] hover:border-[#84754E]'}`}>
          <div className="w-14 h-14 bg-[#84754E]/5 text-[#84754E] rounded-2xl flex items-center justify-center mb-8">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 012.5 2.5V17M12.828 4.405l-.01.01M16.5 4.5l.01.01"/></svg>
          </div>
          <h4 className="text-[#A1A1A1] text-[11px] font-black mb-1 uppercase tracking-[0.2em]">تعدد الجنسيات</h4>
          <div className="text-5xl font-black text-[#444] tracking-tighter">{stats.nationalities.length}</div>
        </button>

        {/* الرسوم المسددة */}
        <button onClick={() => setSelectedDetail('fees')} className={`bg-white p-10 rounded-[2.5rem] border shadow-sm transition-all group text-right ${selectedDetail === 'fees' ? 'border-[#84754E] ring-2 ring-[#84754E]/5' : 'border-[#EBEBEB] hover:border-[#84754E]'}`}>
          <div className="w-14 h-14 bg-[#84754E]/5 text-[#84754E] rounded-2xl flex items-center justify-center mb-8">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h4 className="text-[#A1A1A1] text-[11px] font-black mb-1 uppercase tracking-[0.2em]">طلاب سددوا الرسوم</h4>
          <div className="text-5xl font-black text-[#444] tracking-tighter">{stats.paid.length}</div>
        </button>

        {/* كادر التحفيظ */}
        <button onClick={() => setSelectedDetail('teachers')} className={`bg-white p-10 rounded-[2.5rem] border shadow-sm transition-all group text-right ${selectedDetail === 'teachers' ? 'border-[#84754E] ring-2 ring-[#84754E]/5' : 'border-[#EBEBEB] hover:border-[#84754E]'}`}>
          <div className="w-14 h-14 bg-[#84754E]/5 text-[#84754E] rounded-2xl flex items-center justify-center mb-8">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9-5-9 5 9 5zm0 0v6m0 0l4-2.223M12 20l-4-2.223"/></svg>
          </div>
          <h4 className="text-[#A1A1A1] text-[11px] font-black mb-1 uppercase tracking-[0.2em]">كادر التحفيظ</h4>
          <div className="text-5xl font-black text-[#444] tracking-tighter">{stats.teachers.length}</div>
        </button>
      </div>

      {/* منطقة تفاصيل البطاقات (Drill-down) */}
      {selectedDetail && (
        <div className="bg-white p-12 rounded-[3rem] border border-[#84754E]/20 shadow-2xl animate-fade">
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#F5F5F5]">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-8 bg-[#84754E] rounded-full"></div>
               <h3 className="text-[#444] font-black text-2xl uppercase tracking-tight">
                 {selectedDetail === 'nationalities' ? 'قائمة الجنسيات المتوفرة' : 
                  selectedDetail === 'fees' ? 'الطلاب المسددين للرسوم' : 
                  selectedTeacher ? `طلاب المحفظ: ${selectedTeacher}` : 'قائمة كادر التحفيظ'}
               </h3>
            </div>
            <div className="flex gap-4">
              {selectedTeacher && (
                <button onClick={handleTeacherBack} className="px-6 py-2 bg-[#F4F1EA] text-[#84754E] rounded-xl font-bold text-xs border border-[#84754E]/10">العودة للمحفظين</button>
              )}
              <button onClick={() => { setSelectedDetail(null); setSelectedTeacher(null); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 font-black hover:bg-rose-500 hover:text-white transition-all">×</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
            {selectedDetail === 'nationalities' && stats.nationalities.map(n => (
              <div key={n.name} className="p-6 bg-[#F9F9F9] rounded-2xl border border-[#EDEDED] flex justify-between items-center">
                <span className="font-black text-[#444]">{n.name}</span>
                <span className="text-[#84754E] font-black bg-white px-3 py-1 rounded-lg text-sm">{n.count}</span>
              </div>
            ))}

            {selectedDetail === 'fees' && stats.paid.map(s => (
              <div key={s.id} className="p-6 bg-[#F9F9F9] rounded-2xl border border-[#EDEDED] flex flex-col">
                <span className="font-black text-[#444] text-sm mb-1">{s.name}</span>
                <span className="text-[10px] text-[#AAA] font-bold uppercase tracking-widest">{s.teacher} | {s.circle}</span>
              </div>
            ))}

            {selectedDetail === 'teachers' && !selectedTeacher && stats.teachers.map(t => (
              <button key={t.name} onClick={() => setSelectedTeacher(t.name)} className="p-8 bg-[#FDFDFB] rounded-3xl border border-[#F4F1EA] flex flex-col items-center group hover:bg-[#84754E] hover:border-[#84754E] transition-all">
                <div className="w-16 h-16 bg-[#84754E]/5 text-[#84754E] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/20 group-hover:text-white">
                  <span className="text-2xl font-black">{t.name.charAt(0)}</span>
                </div>
                <span className="font-black text-[#444] group-hover:text-white text-center text-sm">{t.name}</span>
                <span className="text-[10px] text-[#AAA] group-hover:text-white/60 font-bold mt-2 uppercase">{t.students.length} طالب مسجل</span>
              </button>
            ))}

            {selectedTeacher && stats.teachers.find(t => t.name === selectedTeacher)?.students.map(s => (
               <div key={s.id} className="p-6 bg-white rounded-2xl border border-[#84754E]/10 flex flex-col shadow-sm">
                  <span className="font-black text-[#444] text-sm mb-1">{s.name}</span>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] bg-[#F4F1EA] text-[#84754E] px-2 py-0.5 rounded font-black uppercase tracking-widest">{s.level}</span>
                    <span className="text-[9px] text-[#AAA] font-bold uppercase">{s.circle}</span>
                  </div>
               </div>
            ))}
          </div>
        </div>
      )}

      {/* قسم الرسوم البيانية المتطورة */}
      <div className="bg-white p-12 rounded-[3rem] border border-[#EBEBEB] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-full bg-[#84754E]/5 -skew-x-12 -translate-x-32 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-1.5 h-8 bg-[#84754E] rounded-full"></div>
             <h3 className="text-[#84754E] font-black text-xl">تحليلات البيانات المتقدمة</h3>
          </div>
          
          <div className="flex bg-[#F9F9F9] p-2 rounded-2xl border border-[#EDEDED] flex-wrap justify-center">
            {[
              { id: 'level', label: 'المستويات' },
              { id: 'teacher', label: 'المحفظين' },
              { id: 'category', label: 'الفئات' },
              { id: 'arabicity', label: 'جنسيات عربية' }
            ].map(dim => (
              <button 
                key={dim.id}
                onClick={() => setActiveChart(dim.id as ChartDimension)}
                className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeChart === dim.id ? 'bg-[#84754E] text-white shadow-lg' : 'text-[#AAA] hover:text-[#84754E]'}`}
              >
                {dim.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[500px] relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === 'arabicity' ? (
              <PieChart>
                <Pie 
                  data={stats.chartData} 
                  innerRadius={100} 
                  outerRadius={180} 
                  paddingAngle={8} 
                  dataKey="count"
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#84754E' : '#EADBC8'} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '20px' }}
                  itemStyle={{ fontWeight: 900, color: '#84754E' }}
                />
              </PieChart>
            ) : (
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84754E" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#84754E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#AAA' }} 
                  dy={20}
                  interval={0}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#AAA' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '20px' }}
                  itemStyle={{ fontWeight: 900, color: '#84754E' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#84754E" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorBrand)" 
                  dot={{ r: 6, fill: '#84754E', strokeWidth: 3, stroke: '#fff', shadow: '0 4px 10px rgba(0,0,0,0.2)' }} 
                  activeDot={{ r: 10, fill: '#84754E', strokeWidth: 4, stroke: '#fff' }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* ملخص البيانات تحت الرسم البياني */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
           {stats.chartData.slice(0, 4).map((d, i) => (
             <div key={i} className="bg-[#F9F9F9] p-5 rounded-2xl border border-[#EDEDED]">
               <p className="text-[9px] font-black text-[#AAA] uppercase tracking-widest mb-1">{d.name}</p>
               <p className="text-xl font-black text-[#444]">{d.count} طالب</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
