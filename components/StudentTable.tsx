
import React, { useState, useMemo, useEffect } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';

interface StudentTableProps {
  students: Student[];
  onUpdate?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onUpdate, onDelete }) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnSearch, setColumnSearch] = useState<Partial<Record<keyof Student, string>>>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  // التحكم في التمرير عند فتح واجهة الطالب
  useEffect(() => {
    if (selectedStudent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedStudent]);

  const filteredData = useMemo(() => {
    return students.filter(student => {
      const searchableText = `${student.name} ${student.phone} ${student.teacher} ${student.circle} ${student.nationalId}`;
      const matchesGlobal = !globalSearch || smartMatch(searchableText, globalSearch);
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
  };

  const handleSave = async () => {
    if (editFormData && onUpdate) {
      await onUpdate(editFormData);
      setSelectedStudent(null);
    }
  };

  const handleDelete = () => {
    if (selectedStudent && onDelete && window.confirm(`⚠️ هل أنت متأكد تماماً من حذف سجل الدارس: ${selectedStudent.name}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      onDelete(selectedStudent);
      setSelectedStudent(null);
    }
  };

  const handleFieldChange = (key: keyof Student, value: string) => {
    if (editFormData) {
      setEditFormData({ ...editFormData, [key]: value });
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* قسم البحث العلوي */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
        <div className="relative flex-1 group w-full">
          <input 
            type="text" 
            placeholder="البحث الذكي في كافة البيانات (الاسم، المعلم، الهاتف...)"
            className="w-full pr-14 pl-6 py-5 bg-white border-none rounded-[2rem] shadow-xl shadow-indigo-100/40 outline-none ring-2 ring-transparent focus:ring-indigo-500/30 transition-all font-bold text-slate-700 placeholder:text-slate-300"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </div>

      {/* الجدول الرئيسي */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/20 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[1100px]">
            <thead className="bg-[#0F172A] text-white">
              <tr>
                <th className="px-4 py-6 text-[10px] font-black uppercase text-center w-12 opacity-50">#</th>
                <th className="px-4 py-6 text-xs font-black">اسم الدارس</th>
                <th className="px-4 py-6 text-xs font-black">المعلم</th>
                <th className="px-4 py-6 text-xs font-black">الحلقة</th>
                <th className="px-4 py-6 text-xs font-black">المستوى</th>
                <th className="px-4 py-6 text-xs font-black text-center">الهوية</th>
                <th className="px-4 py-6 text-xs font-black text-center">الهاتف</th>
                <th className="px-4 py-6 text-xs font-black text-center">الرسوم</th>
                <th className="px-4 py-6 w-16"></th>
              </tr>
              {/* فلاتر الأعمدة المخصصة */}
              <tr className="bg-indigo-50/50">
                <th className="p-3"></th>
                <th className="p-3"><input placeholder="فلترة بالاسم.." className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-400" value={columnSearch.name || ''} onChange={e => setColumnSearch(p => ({...p, name: e.target.value}))} /></th>
                <th className="p-3"><input placeholder="فلترة بالمعلم.." className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-400" value={columnSearch.teacher || ''} onChange={e => setColumnSearch(p => ({...p, teacher: e.target.value}))} /></th>
                <th className="p-3"><input placeholder="فلترة بالحلقة.." className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-400" value={columnSearch.circle || ''} onChange={e => setColumnSearch(p => ({...p, circle: e.target.value}))} /></th>
                <th className="p-3"><input placeholder="المستوى.." className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-400" value={columnSearch.level || ''} onChange={e => setColumnSearch(p => ({...p, level: e.target.value}))} /></th>
                <th className="p-3"><input placeholder="الهوية.." className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-400 text-center" value={columnSearch.nationalId || ''} onChange={e => setColumnSearch(p => ({...p, nationalId: e.target.value}))} /></th>
                <th className="p-3"><input placeholder="الهاتف.." className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-400 text-center" value={columnSearch.phone || ''} onChange={e => setColumnSearch(p => ({...p, phone: e.target.value}))} /></th>
                <th className="p-3 text-center">
                  <select className="p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none" value={columnSearch.fees || ''} onChange={e => setColumnSearch(p => ({...p, fees: e.target.value}))}>
                    <option value="">الكل</option>
                    <option value="نعم">خالص</option>
                    <option value="لا">مستحق</option>
                  </select>
                </th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((s, idx) => (
                <tr 
                  key={s.id || idx} 
                  className="hover:bg-indigo-50/40 transition-all cursor-pointer group"
                  onClick={() => handleOpenDetails(s)}
                >
                  <td className="px-4 py-5 text-[10px] font-black text-slate-300 text-center">{idx + 1}</td>
                  <td className="px-4 py-5 font-black text-slate-700 text-sm">{s.name}</td>
                  <td className="px-4 py-5 text-sm font-bold text-slate-500">{s.teacher}</td>
                  <td className="px-4 py-5 text-sm font-bold text-slate-500">{s.circle}</td>
                  <td className="px-4 py-5">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100/50">{s.level}</span>
                  </td>
                  <td className="px-4 py-5 text-center font-mono text-xs text-slate-400">{s.nationalId}</td>
                  <td className="px-4 py-5 text-center font-bold text-xs text-slate-400">{s.phone}</td>
                  <td className="px-4 py-5 text-center">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black ${s.fees === 'نعم' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                      {s.fees === 'نعم' ? 'خالص' : 'مستحق'}
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- واجهة العرض الكاملة (Full Screen Editor) --- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[1000] bg-slate-900 flex items-center justify-center">
          <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden animate-fade-up">
            
            {/* 1. Header الثابت للتحكم */}
            <header className="bg-[#0F172A] px-6 py-6 md:px-12 flex justify-between items-center shadow-2xl z-20 shrink-0">
              <div className="flex items-center gap-6">
                <button onClick={() => setSelectedStudent(null)} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <div>
                  <h2 className="text-xl md:text-3xl font-black text-white truncate max-w-sm md:max-w-xl">
                    {isEditMode ? 'تعديل بيانات الدارس' : selectedStudent.name}
                  </h2>
                  <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1">
                    المعرف التسلسلي: {selectedStudent.id} • الهوية: {selectedStudent.nationalId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isEditMode ? (
                  <>
                    <button onClick={() => setIsEditMode(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white font-black text-sm transition-all">إلغاء</button>
                    <button onClick={handleSave} className="px-8 py-3 bg-violet-600 hover:bg-violet-700 rounded-2xl text-white font-black text-sm shadow-xl transition-all flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                       حفظ التعديلات
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleDelete} className="px-6 py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl font-black text-sm transition-all">حذف الملف</button>
                    <button onClick={() => setIsEditMode(true)} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl transition-all flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                       تعديل البيانات
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedStudent(null)} className="w-12 h-12 bg-white/5 hover:bg-rose-600 rounded-2xl flex items-center justify-center text-white text-xl transition-all">✕</button>
              </div>
            </header>

            {/* 2. جسم المحتوى القابل للتمرير */}
            <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
              <div className="max-w-7xl mx-auto space-y-12">
                
                {/* شبكة البيانات الـ 20 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  
                  {/* قسم 1: المعلومات الأساسية */}
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-black text-indigo-900 flex items-center gap-2 mb-4">
                      <span className="w-2 h-6 bg-indigo-500 rounded-full"></span> البيانات الشخصية
                    </h3>
                    {[
                      { label: 'الاسم الكامل', key: 'name', icon: '👤' },
                      { label: 'رقم الهاتف', key: 'phone', icon: '📱' },
                      { label: 'الجنسية', key: 'nationality', icon: '🌍' },
                      { label: 'تاريخ الميلاد', key: 'dob', type: 'date', icon: '📅' },
                      { label: 'العمر', key: 'age', icon: '🎂' },
                      { label: 'السكن / العنوان', key: 'address', icon: '📍' },
                      { label: 'الوظيفة الحالية', key: 'job', icon: '💼' },
                    ].map(f => (
                      <div key={f.key} className="group">
                        <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-tighter">{f.icon} {f.label}</label>
                        <input 
                          type={f.type || 'text'}
                          readOnly={!isEditMode}
                          value={(editFormData as any)?.[f.key] || ''}
                          onChange={e => handleFieldChange(f.key as keyof Student, e.target.value)}
                          className={`w-full bg-transparent font-black text-slate-800 outline-none transition-all py-2 ${isEditMode ? 'border-b-2 border-indigo-100 text-indigo-600 focus:border-indigo-500' : 'cursor-default'}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* قسم 2: المسار التعليمي */}
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-black text-indigo-900 flex items-center gap-2 mb-4">
                      <span className="w-2 h-6 bg-violet-500 rounded-full"></span> الأداء والحلقات
                    </h3>
                    {[
                      { label: 'اسم المحفظ', key: 'teacher', icon: '🎓' },
                      { label: 'اسم الحلقة', key: 'circle', icon: '🕌' },
                      { label: 'المستوى الحالي', key: 'level', icon: '📊' },
                      { label: 'الجزء الحالي', key: 'part', type: 'number', icon: '📖' },
                      { label: 'تاريخ التسجيل', key: 'regDate', type: 'date', icon: '✍️' },
                      { label: 'المؤهل الدراسي', key: 'qualification', icon: '📜' },
                    ].map(f => (
                      <div key={f.key} className="group">
                        <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-tighter">{f.icon} {f.label}</label>
                        <input 
                          type={f.type || 'text'}
                          readOnly={!isEditMode}
                          value={(editFormData as any)?.[f.key] || ''}
                          onChange={e => handleFieldChange(f.key as keyof Student, e.target.value)}
                          className={`w-full bg-transparent font-black text-slate-800 outline-none transition-all py-2 ${isEditMode ? 'border-b-2 border-indigo-100 text-indigo-600 focus:border-indigo-500' : 'cursor-default'}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* قسم 3: الحالة الإدارية */}
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-black text-indigo-900 flex items-center gap-2 mb-4">
                      <span className="w-2 h-6 bg-rose-500 rounded-full"></span> المعلومات الرسمية
                    </h3>
                    {[
                      { label: 'رقم الهوية', key: 'nationalId', icon: '🆔' },
                      { label: 'انتهاء الهوية', key: 'expiryId', type: 'date', icon: '⌛' },
                      { label: 'الفئة المستهدفة', key: 'category', icon: '👥' },
                      { label: 'الفترة الدراسية', key: 'period', icon: '⏰' },
                      { label: 'حالة الرسوم', key: 'fees', icon: '💰' },
                      { label: 'اكتمال الملف', key: 'completion', icon: '✅' },
                      { label: 'المعرف الرقمي', key: 'id', icon: '🔢' },
                    ].map(f => (
                      <div key={f.key} className="group">
                        <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-tighter">{f.icon} {f.label}</label>
                        <input 
                          type={f.type || 'text'}
                          readOnly={!isEditMode || f.key === 'id'}
                          value={(editFormData as any)?.[f.key] || ''}
                          onChange={e => handleFieldChange(f.key as keyof Student, e.target.value)}
                          className={`w-full bg-transparent font-black text-slate-800 outline-none transition-all py-2 ${isEditMode && f.key !== 'id' ? 'border-b-2 border-indigo-100 text-indigo-600 focus:border-indigo-500' : 'cursor-default opacity-80'}`}
                        />
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </main>

            {/* تذييل اختياري */}
            <footer className="bg-white/80 backdrop-blur-md px-12 py-4 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">منصة نور القرآن • نظام إدارة البيانات السحابي</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
