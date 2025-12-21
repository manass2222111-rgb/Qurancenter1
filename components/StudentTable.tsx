
import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';
import * as XLSX from 'https://esm.sh/xlsx';

interface StudentTableProps {
  students: Student[];
  onUpdate?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onUpdate, onDelete }) => {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Partial<Record<keyof Student, string>>>({});
  
  // حالة الطالب المختار للعرض/التعديل
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  const uniqueValues = useMemo(() => ({
    nationalities: Array.from(new Set(students.map(s => s.nationality))).filter(Boolean).sort(),
    levels: Array.from(new Set(students.map(s => s.level))).filter(Boolean).sort(),
    teachers: Array.from(new Set(students.map(s => s.teacher))).filter(Boolean).sort(),
    fees: Array.from(new Set(students.map(s => s.fees))).filter(Boolean),
    circles: Array.from(new Set(students.map(s => s.circle))).filter(Boolean).sort(),
  }), [students]);

  const filtered = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = !search || Object.values(student).some(v => smartMatch(String(v), String(search)));
      const matchesColumnFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return smartMatch(String(student[key as keyof Student]), String(value));
      });
      return matchesSearch && matchesColumnFilters;
    });
  }, [students, search, filters]);

  const handleOpenDetails = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({ ...student });
    setIsEditMode(false);
  };

  const handleSaveEdit = () => {
    if (editFormData && onUpdate) {
      onUpdate(editFormData);
      setSelectedStudent(null);
    }
  };

  const handleDelete = () => {
    if (selectedStudent && onDelete) {
      if (window.confirm(`هل أنت متأكد من حذف الدارس "${selectedStudent.name}" نهائياً من جوجل شيت؟`)) {
        onDelete(selectedStudent);
        setSelectedStudent(null);
      }
    }
  };

  const exportToExcel = () => {
    if (filtered.length === 0) return;
    const headers = ["م", "اسم الدارس", "الجنسية", "تاريخ الميلاد", "رقم الهاتف", "العمر", "المؤهل", "العمل", "السكن", "تاريخ التسجيل", "المستوى", "الجزء", "رقم الهوية", "الفئة", "الفترة", "انتهاء الهوية", "المحفظ", "الرسوم", "الحلقة", "نسبة الاكتمال"];
    const data = filtered.map(s => [s.id, s.name, s.nationality, s.dob, s.phone, s.age, s.qualification, s.job, s.address, s.regDate, s.level, s.part, s.nationalId, s.category, s.period, s.expiryId, s.teacher, s.fees, s.circle, s.completion]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    if (!ws['!views']) ws['!views'] = [];
    ws['!views'].push({ RTL: true });
    ws['!cols'] = headers.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الطلاب");
    XLSX.writeFile(wb, `طلاب_نور_القرآن.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-xl">
              <input 
                type="text" 
                placeholder="البحث الذكي السريع..." 
                className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={exportToExcel} className="px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              تصدير Excel
            </button>
            <button onClick={() => setShowFilters(!showFilters)} className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all ${showFilters ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>تصفية</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">م</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">الدارس</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">المعلم والحلقة</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">المستوى</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">رقم الهوية</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">الحالة المادية</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-all group cursor-pointer" onClick={() => handleOpenDetails(s)}>
                  <td className="px-8 py-5 text-xs text-slate-400 font-bold text-center">{idx + 1}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">{s.name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-bold">
                    <p>{s.teacher}</p>
                    <p className="text-[10px] text-slate-400 font-medium">حلقة: {s.circle}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg border border-blue-100">مستوى {s.level}</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-mono">{s.nationalId}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.fees === 'نعم' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <span className="text-[11px] font-bold text-slate-500">{s.fees === 'نعم' ? 'خالص' : 'مستحق'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-left">
                    <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-fade-up">
            <div className="bg-[#0F172A] p-10 text-white flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-3xl font-black border border-indigo-400/20">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-1">{selectedStudent.name}</h3>
                  <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">ملف الدارس رقم: {selectedStudent.id}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsEditMode(!isEditMode)} className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${isEditMode ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {isEditMode ? 'إلغاء التعديل' : 'تعديل البيانات'}
                </button>
                <button onClick={() => setSelectedStudent(null)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-rose-500 transition-all">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 1. البيانات الشخصية */}
                <div className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase pr-2 mb-4">البيانات الشخصية</h4>
                  {[
                    { label: 'الجنسية', key: 'nationality' },
                    { label: 'تاريخ الميلاد', key: 'dob', type: 'date' },
                    { label: 'رقم الهاتف', key: 'phone' },
                    { label: 'العمر', key: 'age', readOnly: true },
                    { label: 'السكن', key: 'address' },
                    { label: 'المؤهل', key: 'qualification' },
                    { label: 'الوظيفة', key: 'job' },
                  ].map(f => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold px-2">{f.label}</label>
                      <input 
                        type={f.type || 'text'}
                        readOnly={!isEditMode || f.readOnly}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={(e) => setEditFormData(p => ({ ...p!, [f.key]: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all outline-none ${isEditMode ? 'border-indigo-100 bg-white focus:border-indigo-500' : 'border-transparent bg-slate-50 text-slate-600'}`}
                      />
                    </div>
                  ))}
                </div>

                {/* 2. المسار التعليمي */}
                <div className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase pr-2 mb-4">المسار التعليمي</h4>
                  {[
                    { label: 'المعلم', key: 'teacher' },
                    { label: 'الحلقة', key: 'circle' },
                    { label: 'المستوى', key: 'level' },
                    { label: 'الجزء الحالي', key: 'part', type: 'number' },
                    { label: 'تاريخ التسجيل', key: 'regDate', type: 'date' },
                  ].map(f => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold px-2">{f.label}</label>
                      <input 
                        type={f.type || 'text'}
                        readOnly={!isEditMode}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={(e) => setEditFormData(p => ({ ...p!, [f.key]: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all outline-none ${isEditMode ? 'border-indigo-100 bg-white focus:border-indigo-500' : 'border-transparent bg-slate-50 text-slate-600'}`}
                      />
                    </div>
                  ))}
                </div>

                {/* 3. البيانات الإدارية والمالية */}
                <div className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase pr-2 mb-4">البيانات الإدارية</h4>
                  {[
                    { label: 'رقم الهوية', key: 'nationalId' },
                    { label: 'انتهاء الهوية', key: 'expiryId', type: 'date' },
                    { label: 'الفئة', key: 'category' },
                    { label: 'الفترة', key: 'period' },
                    { label: 'حالة الرسوم', key: 'fees' },
                    { label: 'نسبة الاكتمال', key: 'completion', readOnly: true },
                  ].map(f => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold px-2">{f.label}</label>
                      <input 
                        type={f.type || 'text'}
                        readOnly={!isEditMode || f.readOnly}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={(e) => setEditFormData(p => ({ ...p!, [f.key]: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all outline-none ${isEditMode ? 'border-indigo-100 bg-white focus:border-indigo-500' : 'border-transparent bg-slate-50 text-slate-600'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 bg-white border-t border-slate-100 flex justify-between items-center">
              <button onClick={handleDelete} className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-100 transition-all flex items-center gap-2">
                حذف الملف نهائياً
              </button>
              <div className="flex gap-4">
                {isEditMode ? (
                  <button onClick={handleSaveEdit} className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">
                    حفظ التغييرات في السحابة
                  </button>
                ) : (
                  <button onClick={() => setSelectedStudent(null)} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-600 transition-all">
                    إغلاق البطاقة
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
