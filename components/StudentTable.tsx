
import React, { useState, useMemo, useCallback } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';
import * as XLSX from 'https://esm.sh/xlsx';

interface StudentTableProps {
  students: Student[];
  onUpdate?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onUpdate, onDelete }) => {
  // --- حالات التصفية ---
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnSearch, setColumnSearch] = useState<Partial<Record<keyof Student, string>>>({});
  
  // --- حالات العرض (Selected Student) ---
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  // --- محرك الفلترة الذكي ---
  const filteredData = useMemo(() => {
    return students.filter(student => {
      // 1. البحث الشامل
      const searchableText = `${student.name} ${student.phone} ${student.teacher} ${student.circle} ${student.nationalId}`;
      const matchesGlobal = !globalSearch || smartMatch(searchableText, globalSearch);

      // 2. فلاتر الأعمدة (تطبيق الفلترة على كل خانة بحث في الجدول)
      const matchesColumns = Object.entries(columnSearch).every(([key, value]) => 
        !value || smartMatch(String(student[key as keyof Student] || ''), value as string)
      );

      return matchesGlobal && matchesColumns;
    });
  }, [students, globalSearch, columnSearch]);

  const handleOpenDetails = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({ ...student });
    setIsEditMode(false);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
    document.body.style.overflow = 'auto';
  };

  const saveChanges = async () => {
    if (editFormData && onUpdate) {
      await onUpdate(editFormData);
      handleCloseDetails();
    }
  };

  const confirmDelete = () => {
    if (selectedStudent && onDelete && window.confirm(`تأكيد حذف: ${selectedStudent.name} نهائياً؟`)) {
      onDelete(selectedStudent);
      handleCloseDetails();
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الطلاب المصفون");
    XLSX.writeFile(wb, "تقرير_الطلاب.xlsx");
  };

  return (
    <div className="space-y-8 animate-fade-up">
      
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-2xl group">
          <input 
            type="text" 
            placeholder="ابحث عن أي شيء (اسم، هاتف، معلم، حلقة...)"
            className="w-full pr-14 pl-6 py-5 bg-white border-none rounded-[2rem] shadow-xl shadow-indigo-100/50 outline-none ring-2 ring-transparent focus:ring-indigo-500/20 transition-all font-bold text-slate-700"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <button 
          onClick={handleExport}
          className="px-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          تصدير النتائج
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[1000px]">
            <thead className="bg-indigo-900 text-white">
              <tr>
                <th className="px-6 py-6 text-[10px] font-black uppercase text-center w-12 opacity-70">#</th>
                <th className="px-6 py-6 text-xs font-black tracking-tight">الدارس</th>
                <th className="px-6 py-6 text-xs font-black tracking-tight">المعلم</th>
                <th className="px-6 py-6 text-xs font-black tracking-tight">الحلقة</th>
                <th className="px-6 py-6 text-xs font-black tracking-tight">المستوى</th>
                <th className="px-6 py-6 text-xs font-black tracking-tight text-center">الهوية</th>
                <th className="px-6 py-6 text-xs font-black tracking-tight text-center">الرسوم</th>
                <th className="px-6 py-6 w-16"></th>
              </tr>
              {/* Row of Filters for EVERY column */}
              <tr className="bg-indigo-50/50">
                <th className="p-2"></th>
                <th className="p-2">
                  <input 
                    placeholder="فلترة بالاسم.."
                    className="w-full p-3 bg-white border border-indigo-100 rounded-2xl text-[10px] font-bold text-indigo-900 outline-none focus:border-indigo-500"
                    value={columnSearch.name || ''}
                    onChange={(e) => setColumnSearch(p => ({...p, name: e.target.value}))}
                  />
                </th>
                <th className="p-2">
                  <input 
                    placeholder="فلترة بالمعلم.."
                    className="w-full p-3 bg-white border border-indigo-100 rounded-2xl text-[10px] font-bold text-indigo-900 outline-none focus:border-indigo-500"
                    value={columnSearch.teacher || ''}
                    onChange={(e) => setColumnSearch(p => ({...p, teacher: e.target.value}))}
                  />
                </th>
                <th className="p-2">
                  <input 
                    placeholder="الحلقة.."
                    className="w-full p-3 bg-white border border-indigo-100 rounded-2xl text-[10px] font-bold text-indigo-900 outline-none focus:border-indigo-500"
                    value={columnSearch.circle || ''}
                    onChange={(e) => setColumnSearch(p => ({...p, circle: e.target.value}))}
                  />
                </th>
                <th className="p-2">
                  <input 
                    placeholder="المستوى.."
                    className="w-full p-3 bg-white border border-indigo-100 rounded-2xl text-[10px] font-bold text-indigo-900 outline-none focus:border-indigo-500"
                    value={columnSearch.level || ''}
                    onChange={(e) => setColumnSearch(p => ({...p, level: e.target.value}))}
                  />
                </th>
                <th className="p-2">
                  <input 
                    placeholder="الهوية.."
                    className="w-full p-3 bg-white border border-indigo-100 rounded-2xl text-[10px] font-bold text-indigo-900 outline-none focus:border-indigo-500 text-center"
                    value={columnSearch.nationalId || ''}
                    onChange={(e) => setColumnSearch(p => ({...p, nationalId: e.target.value}))}
                  />
                </th>
                <th className="p-2">
                   <select 
                    className="w-full p-3 bg-white border border-indigo-100 rounded-2xl text-[10px] font-bold text-indigo-900 outline-none focus:border-indigo-500"
                    value={columnSearch.fees || ''}
                    onChange={(e) => setColumnSearch(p => ({...p, fees: e.target.value}))}
                  >
                    <option value="">الكل</option>
                    <option value="نعم">خالص</option>
                    <option value="لا">مستحق</option>
                  </select>
                </th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((s, idx) => (
                <tr 
                  key={s.id || idx} 
                  className="hover:bg-indigo-50/30 transition-all cursor-pointer group"
                  onClick={() => handleOpenDetails(s)}
                >
                  <td className="px-6 py-6 text-[10px] font-black text-slate-300 text-center">{idx + 1}</td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm font-bold text-slate-600">{s.teacher}</td>
                  <td className="px-6 py-6 text-sm font-bold text-slate-600">{s.circle}</td>
                  <td className="px-6 py-6">
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-xl border border-indigo-100/50">
                      {s.level}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center font-mono text-sm text-slate-400">{s.nationalId}</td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${s.fees === 'نعم' ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
                      <span className="text-[10px] font-black text-slate-500">{s.fees === 'نعم' ? 'خالص' : 'مستحق'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all transform group-hover:rotate-45">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Full-Screen Student Profile Overlay --- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex animate-fade-up">
          {/* Blur Background */}
          <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-3xl" onClick={handleCloseDetails}></div>
          
          {/* Side Panel Wrapper */}
          <div className="relative w-full max-w-7xl mx-auto bg-slate-50 shadow-2xl overflow-hidden flex flex-col my-4 rounded-[4rem] border border-white/20">
            
            {/* Profile Header */}
            <div className="bg-indigo-900 p-10 md:p-14 text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
               
               <div className="relative z-10 flex items-center gap-8">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] flex items-center justify-center text-4xl font-black shadow-2xl">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">{selectedStudent.name}</h2>
                    <div className="flex gap-4 mt-4">
                       <span className="bg-white/10 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-200">هوية: {selectedStudent.nationalId}</span>
                       <span className="bg-indigo-500/30 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest text-white">اكتمال: {selectedStudent.completion}</span>
                    </div>
                  </div>
               </div>

               <button 
                 onClick={handleCloseDetails}
                 className="relative z-10 w-16 h-16 bg-white/10 hover:bg-rose-500 transition-all rounded-[2rem] flex items-center justify-center text-xl"
               >✕</button>
            </div>

            {/* Scrollable Detailed Sections */}
            <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  
                  {/* Column 1: Personal */}
                  <div className="space-y-8">
                    <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest flex items-center gap-3">
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span> البيانات الشخصية
                    </h3>
                    <div className="grid gap-6">
                      {[
                        { label: 'رقم الهاتف', key: 'phone', icon: '📱' },
                        { label: 'الجنسية', key: 'nationality', icon: '🌍' },
                        { label: 'تاريخ الميلاد', key: 'dob', type: 'date', icon: '📅' },
                        { label: 'العمر', key: 'age', icon: '🎂' },
                        { label: 'العنوان', key: 'address', icon: '📍' },
                      ].map(f => (
                        <div key={f.key} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
                          <label className="text-[10px] font-black text-slate-400 block mb-2">{f.icon} {f.label}</label>
                          <input 
                            type={f.type || 'text'}
                            readOnly={!isEditMode}
                            value={(editFormData as any)?.[f.key] || ''}
                            onChange={(e) => setEditFormData(p => ({...p!, [f.key]: e.target.value}))}
                            className={`w-full bg-transparent font-black text-slate-900 outline-none ${isEditMode ? 'text-indigo-600' : ''}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Education */}
                  <div className="space-y-8">
                    <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest flex items-center gap-3">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> المسار القرآني
                    </h3>
                    <div className="grid gap-6">
                      {[
                        { label: 'المعلم المباشر', key: 'teacher', icon: '🎓' },
                        { label: 'اسم الحلقة', key: 'circle', icon: '🕌' },
                        { label: 'المستوى الحالي', key: 'level', icon: '📊' },
                        { label: 'الجزء الحالي', key: 'part', type: 'number', icon: '📖' },
                        { label: 'تاريخ التسجيل', key: 'regDate', type: 'date', icon: '✍️' },
                      ].map(f => (
                        <div key={f.key} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
                          <label className="text-[10px] font-black text-slate-400 block mb-2">{f.icon} {f.label}</label>
                          <input 
                            type={f.type || 'text'}
                            readOnly={!isEditMode}
                            value={(editFormData as any)?.[f.key] || ''}
                            onChange={(e) => setEditFormData(p => ({...p!, [f.key]: e.target.value}))}
                            className={`w-full bg-transparent font-black text-slate-900 outline-none ${isEditMode ? 'text-indigo-600' : ''}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Administration */}
                  <div className="space-y-8">
                    <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest flex items-center gap-3">
                      <span className="w-2 h-2 bg-rose-500 rounded-full"></span> الحالة الإدارية
                    </h3>
                    <div className="grid gap-6">
                      {[
                        { label: 'الفئة', key: 'category', icon: '👥' },
                        { label: 'الفترة', key: 'period', icon: '⏰' },
                        { label: 'الرسوم المالية', key: 'fees', icon: '💰' },
                        { label: 'انتهاء الهوية', key: 'expiryId', type: 'date', icon: '⌛' },
                        { label: 'المؤهل الدراسي', key: 'qualification', icon: '📜' },
                        { label: 'الوظيفة', key: 'job', icon: '💼' },
                      ].map(f => (
                        <div key={f.key} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
                          <label className="text-[10px] font-black text-slate-400 block mb-2">{f.icon} {f.label}</label>
                          <input 
                            type={f.type || 'text'}
                            readOnly={!isEditMode}
                            value={(editFormData as any)?.[f.key] || ''}
                            onChange={(e) => setEditFormData(p => ({...p!, [f.key]: e.target.value}))}
                            className={`w-full bg-transparent font-black text-slate-900 outline-none ${isEditMode ? 'text-indigo-600' : ''}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

               </div>
            </div>

            {/* Profile Footer - Actions */}
            <div className="bg-white p-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
               <button 
                 onClick={confirmDelete}
                 className="w-full md:w-auto px-10 py-5 bg-rose-50 text-rose-600 rounded-[2rem] font-black text-sm hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-100/20"
               >
                 حذف الملف نهائياً
               </button>

               <div className="flex gap-4 w-full md:w-auto">
                 {isEditMode ? (
                   <>
                    <button onClick={() => setIsEditMode(false)} className="flex-1 md:px-12 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-sm">إلغاء</button>
                    <button onClick={saveChanges} className="flex-[2] md:px-16 py-5 bg-violet-600 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-violet-200">تأكيد وحفظ التغييرات</button>
                   </>
                 ) : (
                   <>
                    <button onClick={() => setIsEditMode(true)} className="flex-1 md:px-12 py-5 border-2 border-indigo-100 text-indigo-600 rounded-[2rem] font-black text-sm hover:bg-indigo-50 transition-all">تحرير البيانات</button>
                    <button onClick={handleCloseDetails} className="flex-1 md:px-16 py-5 bg-indigo-900 text-white rounded-[2rem] font-black text-sm shadow-xl">إغلاق الصفحة</button>
                   </>
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
