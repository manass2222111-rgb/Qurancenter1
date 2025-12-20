
import React, { useState } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';

interface StudentTableProps {
  students: Student[];
}

const StudentTable: React.FC<StudentTableProps> = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    nationality: '',
    period: '',
    level: '',
  });

  const uniqueNationalities = Array.from(new Set(students.map(s => s.nationality))).filter(Boolean);
  const uniquePeriods = Array.from(new Set(students.map(s => s.period))).filter(Boolean);
  const uniqueLevels = Array.from(new Set(students.map(s => s.level))).filter(Boolean);

  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      smartMatch(s.name, searchTerm) || 
      smartMatch(s.nationalId, searchTerm) || 
      smartMatch(s.phone, searchTerm);
    
    const matchesNationality = !filters.nationality || s.nationality === filters.nationality;
    const matchesPeriod = !filters.period || s.period === filters.period;
    const matchesLevel = !filters.level || s.level === filters.level;

    return matchesSearch && matchesNationality && matchesPeriod && matchesLevel;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن اسم، رقم هوية، أو رقم هاتف (بحث ذكي)..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select 
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            value={filters.nationality}
            onChange={(e) => setFilters(prev => ({ ...prev, nationality: e.target.value }))}
          >
            <option value="">كل الجنسيات</option>
            {uniqueNationalities.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select 
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            value={filters.period}
            onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
          >
            <option value="">كل الفترات</option>
            {uniquePeriods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select 
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            value={filters.level}
            onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
          >
            <option value="">كل المستويات</option>
            {uniqueLevels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-gray-600 text-sm">م</th>
                <th className="p-4 font-bold text-gray-600 text-sm">اسم الدارس</th>
                <th className="p-4 font-bold text-gray-600 text-sm">الجنسية</th>
                <th className="p-4 font-bold text-gray-600 text-sm">الفترة</th>
                <th className="p-4 font-bold text-gray-600 text-sm">المستوى</th>
                <th className="p-4 font-bold text-gray-600 text-sm">المحفظ</th>
                <th className="p-4 font-bold text-gray-600 text-sm">رقم الهاتف</th>
                <th className="p-4 font-bold text-gray-600 text-sm">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-teal-50/30 transition-colors group">
                    <td className="p-4 text-sm text-gray-500">{s.id}</td>
                    <td className="p-4 font-bold text-teal-900">{s.name}</td>
                    <td className="p-4 text-sm text-gray-600">{s.nationality}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.period === 'صباحي' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                        {s.period}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">{s.level}</td>
                    <td className="p-4 text-sm text-gray-600">{s.teacher}</td>
                    <td className="p-4 text-sm text-gray-600 font-mono" dir="ltr">{s.phone}</td>
                    <td className="p-4">
                      <button className="p-2 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-400 italic">
                    لا توجد بيانات مطابقة للبحث...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
           <span className="text-sm text-gray-500">إجمالي النتائج: {filteredStudents.length}</span>
           <div className="flex gap-2">
             <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100">السابق</button>
             <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100">التالي</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
