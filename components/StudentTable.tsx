
import React, { useState, useMemo, useEffect } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';
import * as XLSX from 'https://esm.sh/xlsx';

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

  const saveChanges = async () => {
    if (editFormData && onUpdate) {
      await onUpdate(editFormData);
      setSelectedStudent(null);
    }
  };

  const confirmDelete = () => {
    if (selectedStudent && onDelete && window.confirm(`⚠️ تأكيد حذف ملف: ${selectedStudent.name}؟`)) {
      onDelete(selectedStudent);
      setSelectedStudent(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* البحث الشامل */}
        <div className="relative group max-w-3xl">
          <input 
            type="text" 
            placeholder="ابحث في كافة بيانات الطلاب..."
            className="w-full pr-14 pl-6 py-5 bg-white border-none rounded-[2rem] shadow-xl shadow-indigo-100/40 outline-none ring-2 ring-transparent focus:ring-indigo-500/20 transition-all font-bold text-slate-700"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>

        {/* الجدول الرئيسي */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/20 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[1100px]">
              <thead className="bg-indigo-900 text-white">
                <tr>
                  <th className="px-4 py-5 text-[10px] font-black uppercase text-center w-12 opacity-50">#</th>
                  <th className="px-4 py-5 text-xs font-black">اسم الدارس</th>
                  <th className="px-4 py-5 text-xs font-black">المعلم</th>
                  <th className="px-4 py-5 text-xs font-black">الحلقة</th>
                  <th className="px-4 py-5 text-xs font-black">المستوى</th>
                  <th className="px-4 py-5 text-xs font-black text-center">الهوية</th>
                  <th className="px-4 py-5 text-xs font-black text-center">الهاتف</th>
                  <th className="px-4 py-5 text-xs font-black text-center">الرسوم</th>
                  <th className="px-4 py-5 w-16"></th>
                </tr>
                {/* فلاتر الأعمدة */}
                <tr className="bg-indigo-50/50">
                  <th className="p-2"></th>
                  <th className="p-2"><input placeholder="فلترة بالاسم.." className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-400" value={columnSearch.name || ''} onChange={e => setColumnSearch(p => ({...p, name: e.target.value}))} /></th>
                  <th className="p-2"><input placeholder="فلترة بالمعلم.." className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-400" value={columnSearch.teacher || ''} onChange={e => setColumnSearch(p => ({...p, teacher: e.target.value}))} /></th>
                  <th className="p-2"><input placeholder="فلترة بالحلقة.." className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-400" value={columnSearch.circle || ''} onChange={e => setColumnSearch(p => ({...p, circle: e.target.value}))} /></th>
                  <th className="p-2"><input placeholder="المستوى.." className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-400" value={columnSearch.level || ''} onChange={e => setColumnSearch(p => ({...p, level: e.target.value}))} /></th>
                  <th className="p-2"><input placeholder="الهوية.." className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-400 text-center" value={columnSearch.nationalId || ''} onChange={e => setColumnSearch(p => ({...p, nationalId: e.target.value}))} /></th>
                  <th className="p-2"><input placeholder="الهاتف.." className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-400 text-center" value={columnSearch.phone || ''} onChange={e => setColumnSearch(p => ({...p, phone: e.target.value}))} /></th>
                  <th className="p-2">
                    <select className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold outline-none" value={columnSearch.fees || ''} onChange={e => setColumnSearch(p => ({...p, fees: e.target.value}))}>
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
                    className="hover:bg-indigo-50/40 transition-all cursor-pointer group"
                    onClick={() => handleOpenDetails(s)}
                  >
                    <td className="px-4 py-5 text-[10px] font-black text-slate-300 text-center">{idx + 1}</td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">{s.name.charAt(0)}</div>
                        <span className="font-black text-slate-700 text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-slate-500">{s.teacher}</td>
                    <td className="px-4 py-5 text-sm font-bold text-slate-500">{s.circle}</td>
                    <td className="px-4 py-5">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100/50">{s.level}</span>
                    </td>
                    <td className="px-4 py-5 text-center font-mono text-xs text-slate-400">{s.nationalId}</td>
                    <td className="px-4 py-5 text-center font-bold text-xs text-slate-400">{s.phone}</td>
                    <td className="px-4 py-5 text-center">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black ${s.fees === 'نعم' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>{s.fees === 'نعم' ? 'خالص' : 'مستحق'}</div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* بطاقة الطالب بوضعية Fixed صحيحة ومنفصلة عن أي حاوية أخرى */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white overflow-hidden" dir="rtl">
          {/* Header الثابت بوضعية مطلقة للشاشة */}
          <div className="bg-[#0F172A] px-6 py-4 md:px-12 md:py-8 text-white flex justify-between items-center shadow-2xl shrink-0">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="w-12 h-12 md:w-20 md:h-20 bg-indigo-500 rounded-[1rem] md:rounded-[2rem] flex items-center justify-center text-xl md:text-4xl font-black shadow-lg">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg md:text-3xl font-black truncate max-w-[200px] md:max-w-md">{selectedStudent.name}</h2>
                <div className="flex gap-2 mt-1">
                   <span className="text-[9px] md:text-xs font-bold text-indigo-300 bg-white/5 px-2 py-1 rounded-lg uppercase tracking-widest">ملف {selectedStudent.id}</span>
                   <span className="text-[9px] md:text-xs font-bold text-white/50">{selectedStudent.nationalId}</span>
                </div>
              </div>
            </div>

            {/* أزرار التحكم المطلوبة بارزة جداً */}
            <div className="flex items-center gap-2 md:gap-4 scale-90 md:scale-100">
              {isEditMode ? (
                <>
                  <button onClick={() => setIsEditMode(false)} className="px-4 py-2 md:px-6 md:py-3 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all">إلغاء</button>
                  <button onClick={saveChanges} className="px-6 py-2 md:px-8 md:py-3 bg-violet-600 hover:bg-violet-700 rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-xl transition-all">حفظ التغييرات</button>
                </>
              ) : (
                <>
                  <button onClick={confirmDelete} className="px-4 py-2 md:px-6 md:py-3 bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all">حذف</button>
                  <button onClick={() => setIsEditMode(true)} className="px-6 py-2 md:px-10 md:py-3 bg-white text-indigo-900 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-indigo-50 transition-all shadow-xl">تعديل</button>
                  <button onClick={() => setSelectedStudent(null)} className="w-10 h-10 md:w-14 md:h-14 bg-white/5 hover:bg-rose-500 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl transition-all">✕</button>
                </>
              )}
            </div>
          </div>

          {/* جسم البطاقة القابل للتمرير */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-12 pb-12">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {/* المجموعة 1 */}
                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
                  <h3 className="text-xs font-black text-indigo-900 flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> الهوية والتواصل
                  </h3>
                  {[
                    { label: 'الهاتف', key: 'phone', icon: '📱' },
                    { label: 'الجنسية', key: 'nationality', icon: '🌍' },
                    { label: 'تاريخ الميلاد', key: 'dob', type: 'date', icon: '📅' },
                    { label: 'رقم الهوية', key: 'nationalId', icon: '🆔' },
                    { label: 'السكن', key: 'address', icon: '📍' },
                  ].map(f => (
                    <div key={f.key} className="group">
                      <label className="text-[10px] font-black text-slate-400 block mb-1">{f.icon} {f.label}</label>
                      <input 
                        type={f.type || 'text'}
                        readOnly={!isEditMode}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={e => setEditFormData(p => ({...p!, [f.key]: e.target.value}))}
                        className={`w-full bg-transparent font-black text-slate-800 outline-none transition-all py-1 ${isEditMode ? 'border-b-2 border-indigo-200 text-indigo-600 focus:border-indigo-500' : ''}`}
                      />
                    </div>
                  ))}
                </div>

                {/* المجموعة 2 */}
                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
                  <h3 className="text-xs font-black text-indigo-900 flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-violet-500 rounded-full"></span> المسار التعليمي
                  </h3>
                  {[
                    { label: 'المحفظ', key: 'teacher', icon: '🎓' },
                    { label: 'الحلقة', key: 'circle', icon: '🕌' },
                    { label: 'المستوى', key: 'level', icon: '📊' },
                    { label: 'الجزء', key: 'part', icon: '📖' },
                    { label: 'تاريخ التسجيل', key: 'regDate', type: 'date', icon: '✍️' },
                  ].map(f => (
                    <div key={f.key} className="group">
                      <label className="text-[10px] font-black text-slate-400 block mb-1">{f.icon} {f.label}</label>
                      <input 
                        type={f.type || 'text'}
                        readOnly={!isEditMode}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={e => setEditFormData(p => ({...p!, [f.key]: e.target.value}))}
                        className={`w-full bg-transparent font-black text-slate-800 outline-none transition-all py-1 ${isEditMode ? 'border-b-2 border-indigo-200 text-indigo-600 focus:border-indigo-500' : ''}`}
                      />
                    </div>
                  ))}
                </div>

                {/* المجموعة 3 */}
                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
                  <h3 className="text-xs font-black text-indigo-900 flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-rose-500 rounded-full"></span> الحالة الإدارية
                  </h3>
                  {[
                    { label: 'الفترة', key: 'period', icon: '⏰' },
                    { label: 'الرسوم', key: 'fees', icon: '💰' },
                    { label: 'الوظيفة', key: 'job', icon: '💼' },
                    { label: 'انتهاء الهوية', key: 'expiryId', type: 'date', icon: '⌛' },
                    { label: 'اكتمال الملف', key: 'completion', icon: '✅' },
                  ].map(f => (
                    <div key={f.key} className="group">
                      <label className="text-[10px] font-black text-slate-400 block mb-1">{f.icon} {f.label}</label>
                      <input 
                        type={f.type || 'text'}
                        readOnly={!isEditMode}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={e => setEditFormData(p => ({...p!, [f.key]: e.target.value}))}
                        className={`w-full bg-transparent font-black text-slate-800 outline-none transition-all py-1 ${isEditMode ? 'border-b-2 border-indigo-200 text-indigo-600 focus:border-indigo-500' : ''}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentTable;
