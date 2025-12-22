
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
    if (selectedStudent && onDelete && window.confirm(`⚠️ حذف سجل: ${selectedStudent.name}؟`)) {
      onDelete(selectedStudent);
      setSelectedStudent(null);
    }
  };

  const handleFieldChange = (key: keyof Student, value: string) => {
    if (editFormData) {
      setEditFormData({ ...editFormData, [key]: value });
    }
  };

  const DataField = ({ label, value, fieldKey, icon, type = 'text' }: { label: string, value: string, fieldKey: keyof Student, icon: string, type?: string }) => (
    <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
      <label className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-tighter">
        <span>{icon}</span> {label}
      </label>
      {isEditMode && fieldKey !== 'id' ? (
        <input 
          type={type}
          value={(editFormData as any)?.[fieldKey] || ''}
          onChange={e => handleFieldChange(fieldKey, e.target.value)}
          className="bg-white border border-indigo-200 rounded-lg px-2 py-1 text-xs font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      ) : (
        <span className="text-xs font-black text-slate-700 truncate">{value || '—'}</span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* البحث العلوي */}
      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <input 
            type="text" 
            placeholder="ابحث عن أي طالب بالاسم أو الرقم..."
            className="w-full pr-12 pl-6 py-4 bg-white border-none rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </div>

      {/* الجدول الرئيسي */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-center w-12">#</th>
                <th className="px-6 py-4 text-xs font-black">اسم الدارس</th>
                <th className="px-6 py-4 text-xs font-black">المعلم</th>
                <th className="px-6 py-4 text-xs font-black text-center">الحلقة</th>
                <th className="px-6 py-4 text-xs font-black text-center">الرسوم</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((s, idx) => (
                <tr key={s.id || idx} onClick={() => handleOpenDetails(s)} className="hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-300 text-center">{idx + 1}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">{s.name}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{s.teacher}</td>
                  <td className="px-6 py-4 text-center text-xs font-medium text-slate-500">{s.circle}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black ${s.fees === 'نعم' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {s.fees === 'نعم' ? 'خالص' : 'مستحق'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- بطاقة تفاصيل الطالب (Modal) المحسنة --- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* الشريط العلوي للبطاقة */}
            <div className="bg-white border-b border-slate-100 px-8 py-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none">{selectedStudent.name}</h2>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ملف الدارس الرقمي • {selectedStudent.nationalId}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isEditMode ? (
                  <>
                    <button onClick={() => setIsEditMode(false)} className="px-4 py-2 text-slate-400 font-black text-xs hover:text-slate-600 transition-colors">إلغاء</button>
                    <button onClick={handleSave} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-black text-xs shadow-md hover:bg-emerald-700 transition-all">حفظ التعديلات</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleDelete} className="text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl font-black text-xs transition-colors">حذف</button>
                    <button onClick={() => setIsEditMode(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-xs shadow-md hover:bg-indigo-700 transition-all">تعديل البيانات</button>
                  </>
                )}
                <button onClick={() => setSelectedStudent(null)} className="ml-2 w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all text-xl">✕</button>
              </div>
            </div>

            {/* منطقة البيانات - شبكة (Grid) احترافية */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* المجموعة 1: الشخصية */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-2 border-r-4 border-indigo-600">البيانات الشخصية</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <DataField icon="👤" label="الاسم الكامل" value={selectedStudent.name} fieldKey="name" />
                    <DataField icon="🆔" label="رقم الهوية" value={selectedStudent.nationalId} fieldKey="nationalId" />
                    <DataField icon="🌍" label="الجنسية" value={selectedStudent.nationality} fieldKey="nationality" />
                    <DataField icon="📱" label="رقم الهاتف" value={selectedStudent.phone} fieldKey="phone" />
                    <DataField icon="📅" label="تاريخ الميلاد" value={selectedStudent.dob} fieldKey="dob" type="date" />
                    <DataField icon="🎂" label="العمر" value={selectedStudent.age} fieldKey="age" />
                    <DataField icon="📍" label="العنوان" value={selectedStudent.address} fieldKey="address" />
                  </div>
                </div>

                {/* المجموعة 2: الأكاديمية */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-violet-600 uppercase tracking-widest px-2 border-r-4 border-violet-600">المسار الدراسي</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <DataField icon="🎓" label="اسم المحفظ" value={selectedStudent.teacher} fieldKey="teacher" />
                    <DataField icon="🕌" label="الحلقة" value={selectedStudent.circle} fieldKey="circle" />
                    <DataField icon="📊" label="المستوى" value={selectedStudent.level} fieldKey="level" />
                    <DataField icon="📖" label="الجزء الحالي" value={selectedStudent.part} fieldKey="part" />
                    <DataField icon="✍️" label="تاريخ التسجيل" value={selectedStudent.regDate} fieldKey="regDate" type="date" />
                    <DataField icon="📜" label="المؤهل" value={selectedStudent.qualification} fieldKey="qualification" />
                    <DataField icon="💼" label="الوظيفة" value={selectedStudent.job} fieldKey="job" />
                  </div>
                </div>

                {/* المجموعة 3: الإدارية */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-2 border-r-4 border-emerald-600">الحالة الإدارية</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <DataField icon="⌛" label="انتهاء الهوية" value={selectedStudent.expiryId} fieldKey="expiryId" type="date" />
                    <DataField icon="💰" label="حالة الرسوم" value={selectedStudent.fees} fieldKey="fees" />
                    <DataField icon="👥" label="الفئة" value={selectedStudent.category} fieldKey="category" />
                    <DataField icon="⏰" label="الفترة" value={selectedStudent.period} fieldKey="period" />
                    <DataField icon="✅" label="اكتمال الملف" value={selectedStudent.completion} fieldKey="completion" />
                    <DataField icon="🔢" label="المعرف الرقمي" value={selectedStudent.id} fieldKey="id" />
                  </div>
                </div>

              </div>
            </div>

            {/* تذييل البطاقة */}
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-center shrink-0">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">نظام إدارة حلقات القرآن الكريم • الإصدار 2.0</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
