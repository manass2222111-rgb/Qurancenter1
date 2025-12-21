
import React, { useState } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';

interface StudentTableProps {
  students: Student[];
}

const StudentTable: React.FC<StudentTableProps> = ({ students }) => {
  const [search, setSearch] = useState('');
  
  const filtered = students.filter(s => !search || Object.values(s).some(v => smartMatch(String(v), search)));

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="البحث الذكي (اسم، هاتف، معلم)..." 
            className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-bold text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all">تصدير CSV</button>
          <button className="flex-1 md:flex-none px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">طباعة كشف الحضور</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">م</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest">الدارس</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest">الجنسية</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest">المستوى</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest">المعلم</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest">الحالة</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s, idx) => (
              <tr key={s.id} className="hover:bg-slate-50/80 transition-all group">
                <td className="px-8 py-5 text-xs text-slate-400 font-bold text-center">{idx + 1}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{s.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-600 font-medium">{s.nationality}</td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg border border-blue-100">{s.level}</span>
                </td>
                <td className="px-8 py-5 text-sm text-slate-600 font-bold">{s.teacher}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.fees === 'نعم' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    <span className="text-[11px] font-bold text-slate-500">{s.fees === 'نعم' ? 'خالص' : 'مستحق'}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-8 bg-slate-50/50 flex justify-between items-center">
        <p className="text-xs font-bold text-slate-400">إظهار <span className="text-slate-900">{filtered.length}</span> من أصل <span className="text-slate-900">{students.length}</span> طالب</p>
        <div className="flex gap-2">
           <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
           </button>
           <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md transition-all">1</button>
           <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
