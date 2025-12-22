
import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';

interface StudentTableProps {
  students: Student[];
  onUpdate?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

type TabType = 'personal' | 'academic' | 'admin';
const LEVEL_ORDER = ['تمهيدي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

const StudentTable: React.FC<StudentTableProps> = ({ students, onUpdate, onDelete }) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  const dropdownOptions = useMemo(() => {
    const getUnique = (key: keyof Student) => 
      Array.from(new Set(students.map(s => s[key]).filter(v => v && v.trim() !== ''))).sort();

    return {
      teachers: getUnique('teacher'),
      circles: getUnique('circle'),
      categories: getUnique('category'),
      periods: getUnique('period'),
    };
  }, [students]);

  const filteredData = useMemo(() => {
    return students.filter(student => {
      const searchableText = `${student.name} ${student.phone} ${student.teacher} ${student.circle} ${student.nationalId}`;
      const matchesSearch = !globalSearch || smartMatch(searchableText, globalSearch);
      const matchesLevel = !levelFilter || student.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [students, globalSearch, levelFilter]);

  const handleOpenProfile = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({ ...student });
    setIsEditMode(false);
    setActiveTab('personal');
  };

  const handleSave = async () => {
    if (editFormData && onUpdate) {
      await onUpdate(editFormData);
      setSelectedStudent(null);
    }
  };

  const DataField = ({ label, value, fieldKey, icon, type = 'text', isSelect = false, options = [] }: any) => (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <label className="text-[10px] font-black text-slate-400 uppercase">{label}</label>
      </div>
      {isEditMode ? (
        isSelect ? (
          <select 
            value={(editFormData as any)?.[fieldKey] || ''}
            onChange={e => setEditFormData({ ...editFormData!, [fieldKey]: e.target.value })}
            className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm font-bold text-indigo-700 outline-none"
          >
            <option value="">اختر...</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input 
            type={type}
            value={(editFormData as any)?.[fieldKey] || ''}
            onChange={e => setEditFormData({ ...editFormData!, [fieldKey]: e.target.value })}
            className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm font-bold text-indigo-700 outline-none"
          />
        )
      ) : (
        <div className="text-sm font-extrabold text-slate-800">{value || '—'}</div>
      )}
    </div>
  );

  if (selectedStudent) {
    return (
      <div className="animate-fade-up">
        {/* Profile Card UI */}
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden mb-8">
           <div className="bg-slate-900 p-12 text-white flex flex-col md:flex-row items-center gap-8">
              <button onClick={() => setSelectedStudent(null)} className="absolute top-8 right-8 text-white/50 hover:text-white">إغلاق ×</button>
              <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl font-black">
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-black mb-2">{selectedStudent.name}</h2>
                <div className="flex gap-4 text-indigo-300 text-sm font-bold">
                  <span>ID: {selectedStudent.id}</span>
                  <span>🕌 {selectedStudent.circle}</span>
                </div>
              </div>
              <div className="flex gap-3">
                {isEditMode ? (
                  <button onClick={handleSave} className="px-8 py-3 bg-emerald-600 rounded-xl font-black text-sm shadow-xl">حفظ التغييرات</button>
                ) : (
                  <button onClick={() => setIsEditMode(true)} className="px-8 py-3 bg-indigo-600 rounded-xl font-black text-sm shadow-xl">تعديل الملف</button>
                )}
                <button onClick={() => { if(confirm("هل متأكد؟")) onDelete?.(selectedStudent); setSelectedStudent(null); }} className="px-4 py-3 bg-rose-600/10 text-rose-500 rounded-xl font-black text-sm">حذف</button>
              </div>
           </div>
           
           <div className="flex border-b border-slate-50 bg-slate-50/50 p-2 gap-2">
              {['personal', 'academic', 'admin'].map(t => (
                <button key={t} onClick={() => setActiveTab(t as TabType)} className={`flex-1 py-4 rounded-2xl text-[11px] font-black ${activeTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                  {t === 'personal' ? 'الشخصية' : t === 'academic' ? 'الأكاديمية' : 'الإدارية'}
                </button>
              ))}
           </div>

           <div className="p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeTab === 'personal' && (
                  <>
                    <DataField label="الاسم" value={selectedStudent.name} fieldKey="name" icon="👤" />
                    <DataField label="الهوية" value={selectedStudent.nationalId} fieldKey="nationalId" icon="🆔" />
                    <DataField label="الهاتف" value={selectedStudent.phone} fieldKey="phone" icon="📱" />
                  </>
                )}
                {activeTab === 'academic' && (
                  <>
                    <DataField label="المحفظ" value={selectedStudent.teacher} fieldKey="teacher" isSelect options={dropdownOptions.teachers} icon="👳" />
                    <DataField label="المستوى" value={selectedStudent.level} fieldKey="level" isSelect options={LEVEL_ORDER} icon="📊" />
                    <DataField label="الحلقة" value={selectedStudent.circle} fieldKey="circle" isSelect options={dropdownOptions.circles} icon="🕌" />
                  </>
                )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="البحث بالاسم، الرقم، أو المعلم..."
            className="w-full pr-12 pl-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold">
          <option value="">تصفية بالمستوى (الكل)</option>
          {LEVEL_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">اسم الدارس</th>
              <th className="px-8 py-5">المحفظ</th>
              <th className="px-8 py-5">المستوى</th>
              <th className="px-8 py-5 text-center">الرسوم</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((s, idx) => (
              <tr key={idx} onClick={() => handleOpenProfile(s)} className="hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                <td className="px-8 py-5">
                  <div className="font-extrabold text-slate-800 text-sm group-hover:text-indigo-600">{s.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold mt-1">ID: {s.id}</div>
                </td>
                <td className="px-8 py-5 text-xs font-bold text-slate-500">{s.teacher}</td>
                <td className="px-8 py-5 text-xs font-bold text-slate-500">{s.level}</td>
                <td className="px-8 py-5 text-center">
                  <span className={`px-4 py-1 rounded-full text-[9px] font-black ${s.fees === 'نعم' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {s.fees === 'نعم' ? 'خالص' : 'مطلوب'}
                  </span>
                </td>
                <td className="px-8 py-5">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      →
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
