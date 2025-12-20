
import React, { useState } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';

interface StudentTableProps {
  students: Student[];
}

const StudentTable: React.FC<StudentTableProps> = ({ students }) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Partial<Record<keyof Student, string>>>({});

  // استخراج القيم الفريدة للفلاتر المنسدلة
  const uniqueTeachers = Array.from(new Set(students.map(s => s.teacher))).filter(Boolean).sort();
  const uniqueLevels = Array.from(new Set(students.map(s => s.level))).filter(Boolean).sort();
  const uniquePeriods = Array.from(new Set(students.map(s => s.period))).filter(Boolean);

  const filteredStudents = students.filter((s) => {
    // 1. البحث الشامل في كل الحقول
    const matchesGlobal = !globalSearch || Object.values(s).some(value => 
      smartMatch(String(value), globalSearch)
    );

    // 2. الفلترة المخصصة لكل عمود
    const matchesColumnFilters = Object.entries(columnFilters).every(([key, filterValue]) => {
      // Fix: Ensure filterValue is a string and not empty before calling smartMatch
      // This addresses the "Argument of type 'unknown' is not assignable to parameter of type 'string'" error.
      if (!filterValue || typeof filterValue !== 'string') return true;
      const studentValue = s[key as keyof Student];
      return smartMatch(String(studentValue), filterValue);
    });

    return matchesGlobal && matchesColumnFilters;
  });

  const handleColumnFilterChange = (key: keyof Student, value: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setColumnFilters({});
    setGlobalSearch('');
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="بحث شامل في كافة البيانات (اسم، هاتف، معلم، سكن...)"
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                showAdvancedFilters ? 'bg-teal-700 text-white shadow-lg' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showAdvancedFilters ? 'إخفاء الفلاتر' : 'فلاتر الأعمدة'}
            </button>
            {(globalSearch || Object.keys(columnFilters).length > 0) && (
              <button 
                onClick={clearFilters}
                className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                title="مسح الكل"
              >
                مسح
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-gray-600 text-sm w-16">م</th>
                <th className="p-4 font-bold text-gray-600 text-sm min-w-[200px]">اسم الدارس</th>
                <th className="p-4 font-bold text-gray-600 text-sm">الجنسية</th>
                <th className="p-4 font-bold text-gray-600 text-sm">الفترة</th>
                <th className="p-4 font-bold text-gray-600 text-sm">المستوى</th>
                <th className="p-4 font-bold text-gray-600 text-sm">المحفظ</th>
                <th className="p-4 font-bold text-gray-600 text-sm">رقم الهاتف</th>
                <th className="p-4 font-bold text-gray-600 text-sm">الإجراء</th>
              </tr>
              {/* Advanced Filter Row */}
              {showAdvancedFilters && (
                <tr className="bg-teal-50/50 border-b border-teal-100 animate-in fade-in duration-300">
                  <td className="p-2">
                    <input 
                      type="text" 
                      className="w-full p-2 text-xs border border-teal-200 rounded bg-white outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="رقم..."
                      value={columnFilters.id || ''}
                      onChange={(e) => handleColumnFilterChange('id', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      className="w-full p-2 text-xs border border-teal-200 rounded bg-white outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="فلترة بالاسم..."
                      value={columnFilters.name || ''}
                      onChange={(e) => handleColumnFilterChange('name', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      className="w-full p-2 text-xs border border-teal-200 rounded bg-white outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="الجنسية..."
                      value={columnFilters.nationality || ''}
                      onChange={(e) => handleColumnFilterChange('nationality', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <select 
                      className="w-full p-2 text-xs border border-teal-200 rounded bg-white outline-none focus:ring-1 focus:ring-teal-500"
                      value={columnFilters.period || ''}
                      onChange={(e) => handleColumnFilterChange('period', e.target.value)}
                    >
                      <option value="">الكل</option>
                      {uniquePeriods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <select 
                      className="w-full p-2 text-xs border border-teal-200 rounded bg-white outline-none focus:ring-1 focus:ring-teal-500"
                      value={columnFilters.level || ''}
                      onChange={(e) => handleColumnFilterChange('level', e.target.value)}
                    >
                      <option value="">الكل</option>
                      {uniqueLevels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <select 
                      className="w-full p-2 text-xs border border-teal-200 rounded bg-white outline-none focus:ring-1 focus:ring-teal-500"
                      value={columnFilters.teacher || ''}
                      onChange={(e) => handleColumnFilterChange('teacher', e.target.value)}
                    >
                      <option value="">الكل</option>
                      {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      className="w-full p-2 text-xs border border-teal-200 rounded bg-white outline-none focus:ring-1 focus:ring-teal-500 text-left"
                      dir="ltr"
                      placeholder="رقم الهاتف..."
                      value={columnFilters.phone || ''}
                      onChange={(e) => handleColumnFilterChange('phone', e.target.value)}
                    />
                  </td>
                  <td className="p-2"></td>
                </tr>
              )}
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
                    لا توجد بيانات مطابقة لخيارات البحث المحددة...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
           <span className="text-sm text-gray-600 font-medium">إجمالي النتائج: <span className="text-teal-700">{filteredStudents.length}</span> من أصل <span className="text-gray-400">{students.length}</span></span>
           <div className="flex gap-2">
             <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">السابق</button>
             <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">التالي</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
