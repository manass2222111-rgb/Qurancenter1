
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Student } from '../types';

interface AddStudentFormProps {
  onAdd: (student: Student) => void;
  onCancel: () => void;
  studentsCount: number;
  students: Student[];
  isSaving?: boolean;
}

const LEVEL_ORDER = ['تمهيدي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

const DynamicSelect = ({ name, label, options, placeholder, value, onChange, isManual, toggleManual }: any) => {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest">{label}</label>
      {isManual ? (
        <div className="relative animate-in slide-in-from-right-2 duration-300">
          <input 
            name={name} 
            type="text" 
            value={value || ''} 
            onChange={onChange}
            onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }}
            placeholder={`اكتب ${label} جديد...`}
            className="w-full px-6 py-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl outline-none font-bold text-indigo-900 shadow-inner focus:border-indigo-500 transition-all"
            autoFocus
          />
          <button 
            type="button" 
            onClick={() => toggleManual(name, false)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] bg-white text-indigo-600 px-3 py-1.5 rounded-xl shadow-md font-black uppercase border border-indigo-100"
          >
            رجوع
          </button>
        </div>
      ) : (
        <div className="relative">
          <select 
            name={name} 
            value={value || ''} 
            onChange={(e) => {
              if (e.target.value === "__MANUAL__") {
                toggleManual(name, true);
              } else {
                onChange(e);
              }
            }} 
            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold appearance-none cursor-pointer hover:bg-slate-100 focus:bg-white focus:border-indigo-100 transition-all text-right text-slate-700 shadow-sm"
          >
            <option value="">{placeholder}</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            <option value="__MANUAL__" className="text-indigo-600 font-black">+ إضافة جديد</option>
          </select>
          <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      )}
    </div>
  );
};

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onAdd, onCancel, studentsCount, students, isSaving = false }) => {
  const [step, setStep] = useState(1);
  const [manualInputs, setManualInputs] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Partial<Student>>({
    regDate: new Date().toISOString().split('T')[0],
    fees: 'لا',
    completion: '0%'
  });

  const dropdownOptions = useMemo(() => {
    const getUnique = (key: keyof Student) => {
      const vals = students.map(s => s[key]).filter(v => v && v.trim() !== '');
      return Array.from(new Set(vals)).sort();
    };
    return {
      teachers: getUnique('teacher'),
      circles: getUnique('circle'),
      categories: getUnique('category'),
      periods: getUnique('period'),
    };
  }, [students]);

  const toggleManual = (name: string, isManual: boolean) => {
    setManualInputs(prev => ({ ...prev, [name]: isManual }));
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'dob' && value) {
        const birthDate = new Date(value);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        updated.age = age.toString();
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    const essentialFields = ['name', 'phone', 'nationality', 'dob', 'address', 'teacher', 'circle', 'level', 'nationalId', 'category', 'period'];
    const filledCount = essentialFields.filter(k => (formData as any)[k] && (formData as any)[k].trim() !== '').length;
    const percentage = Math.round((filledCount / essentialFields.length) * 100);
    setFormData(prev => ({ ...prev, completion: `${percentage}%` }));
  }, [formData]);

  const handleFinalSubmit = () => {
    if (isSaving) return;
    if (!formData.name) {
      alert("يرجى إدخال اسم الدارس رباعياً");
      setStep(1);
      return;
    }
    onAdd({
      id: (studentsCount + 1).toString(),
      name: formData.name || '',
      nationality: formData.nationality || '',
      dob: formData.dob || '',
      phone: formData.phone || '',
      age: formData.age || '',
      qualification: formData.qualification || '',
      job: formData.job || '',
      address: formData.address || '',
      regDate: formData.regDate || '',
      level: formData.level || '',
      part: formData.part || '',
      nationalId: formData.nationalId || '',
      category: formData.category || '',
      period: formData.period || '',
      expiryId: formData.expiryId || '',
      teacher: formData.teacher || '',
      fees: formData.fees || 'لا',
      circle: formData.circle || '',
      completion: formData.completion || '0%'
    });
  };

  return (
    <div className={`max-w-4xl mx-auto bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden mb-12 relative transition-all duration-300 ${isSaving ? 'opacity-70 scale-[0.99]' : ''}`}>
      {/* Stepper Header */}
      <div className="bg-[#0F172A] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-1 bg-white/5">
          <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: formData.completion }}></div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div>
            <h3 className="text-2xl font-black mb-1">تسجيل دارس جديد</h3>
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">اكتمال الملف: {formData.completion}</p>
          </div>
          
          <div className="flex gap-3">
             {[1, 2, 3].map(s => (
               <div key={s} className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-500 border-2 ${step >= s ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/20'}`}>
                    {s}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${step === s ? 'text-indigo-400' : 'text-white/20'}`}>
                    {s === 1 ? 'شخصية' : s === 2 ? 'أكاديمية' : 'إدارية'}
                  </span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="p-12 space-y-10">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest">الاسم الكامل رباعياً</label>
              <input name="name" type="text" value={formData.name || ''} onChange={handleChange} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold border-2 border-transparent focus:bg-white focus:border-indigo-100 shadow-sm" placeholder="أدخل الاسم..." />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest">رقم الهاتف</label>
              <input name="phone" type="text" value={formData.phone || ''} onChange={handleChange} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold border-2 border-transparent focus:bg-white focus:border-indigo-100 shadow-sm" placeholder="05xxxxxxxx" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest">تاريخ الميلاد</label>
                <input name="dob" type="date" value={formData.dob || ''} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-right shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest">العمر</label>
                <input name="age" type="text" value={formData.age || ''} readOnly className="w-full px-4 py-4 bg-indigo-50 text-indigo-900 rounded-2xl font-black text-center shadow-inner" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest">الجنسية</label>
              <input name="nationality" type="text" value={formData.nationality || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold shadow-sm" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <DynamicSelect name="teacher" label="المحفظ" options={dropdownOptions.teachers} placeholder="اختر المعلم" value={formData.teacher} onChange={handleChange} isManual={manualInputs.teacher} toggleManual={toggleManual} />
            <DynamicSelect name="circle" label="الحلقة" options={dropdownOptions.circles} placeholder="اختر الحلقة" value={formData.circle} onChange={handleChange} isManual={manualInputs.circle} toggleManual={toggleManual} />
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest">المستوى</label>
              <select name="level" value={formData.level || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-right appearance-none shadow-sm cursor-pointer">
                <option value="">اختر المستوى</option>
                {LEVEL_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest">الجزء الحالي</label>
              <input name="part" type="number" min="1" max="30" value={formData.part || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold shadow-sm" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest">رقم الهوية</label>
              <input name="nationalId" type="text" value={formData.nationalId || ''} onChange={handleChange} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold shadow-sm" placeholder="10xxxxxxxx" />
            </div>
            <DynamicSelect name="category" label="الفئة" options={dropdownOptions.categories} placeholder="اختر الفئة" value={formData.category} onChange={handleChange} isManual={manualInputs.category} toggleManual={toggleManual} />
            <div className="space-y-2 md:col-span-2 pt-6">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest mb-4 block text-center">حالة السداد</label>
              <div className="flex gap-4">
                {['نعم', 'لا'].map(option => (
                  <button key={option} type="button" onClick={() => setFormData(p => ({ ...p, fees: option }))}
                    className={`flex-1 py-5 rounded-3xl font-black text-lg transition-all border-2 ${formData.fees === option ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl scale-[1.02]' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}>
                    {option === 'نعم' ? 'تم السداد' : 'لم يسدد'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-10 border-t border-slate-50">
          <button type="button" onClick={onCancel} className="text-slate-400 font-black text-sm hover:text-rose-500 transition-colors">إلغاء وإغلاق</button>
          <div className="flex gap-4">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm">السابق</button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="px-10 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-sm shadow-xl">المتابعة</button>
            ) : (
              <button 
                type="button" 
                onClick={handleFinalSubmit}
                disabled={isSaving} 
                className={`px-12 py-4 rounded-2xl font-black text-sm shadow-xl transition-all ${isSaving ? 'bg-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}
              >
                {isSaving ? 'جاري الحفظ...' : 'إتمام التسجيل السحابي'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isSaving && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-[50]">
          <div className="bg-[#0F172A] text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-bounce">
            <div className="w-5 h-5 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-black text-sm uppercase tracking-widest">جاري تأمين البيانات في جوجل شيت...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStudentForm;
