
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
    <div className="space-y-3">
      <label className="text-[12px] font-black text-slate-500 uppercase pr-2 tracking-widest">{label}</label>
      {isManual ? (
        <div className="relative animate-in slide-in-from-right-2 duration-300">
          <input 
            name={name} 
            type="text" 
            value={value || ''} 
            onChange={onChange}
            onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }}
            placeholder={`اكتب ${label} جديد...`}
            className="w-full px-7 py-5 bg-emerald-50/50 border-2 border-emerald-200 rounded-[1.5rem] outline-none font-bold text-emerald-900 shadow-inner focus:border-emerald-500 transition-all"
            autoFocus
          />
          <button 
            type="button" 
            onClick={() => toggleManual(name, false)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] bg-white text-emerald-600 px-4 py-2 rounded-xl shadow-md font-black uppercase border border-emerald-100 hover:bg-emerald-50"
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
            className="w-full px-7 py-5 bg-slate-50/80 border-2 border-transparent rounded-[1.5rem] outline-none font-bold appearance-none cursor-pointer hover:bg-slate-100 focus:bg-white focus:border-emerald-500/20 transition-all text-right text-slate-800 shadow-sm"
          >
            <option value="">{placeholder}</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            <option value="__MANUAL__" className="text-emerald-600 font-black">+ إضافة قيمة جديدة</option>
          </select>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
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
    <div className={`max-w-5xl mx-auto bg-white rounded-[4rem] border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden mb-12 relative transition-all duration-500 ${isSaving ? 'grayscale opacity-70 scale-[0.98]' : ''}`}>
      {/* Premium Stepper Header */}
      <div className="bg-[#064E3B] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10">
          <div className="h-full bg-emerald-400 transition-all duration-1000 ease-out" style={{ width: formData.completion }}></div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div>
            <h3 className="text-3xl font-black mb-2 tracking-tight">تسجيل دارس جديد</h3>
            <p className="text-emerald-300/80 text-[11px] font-black uppercase tracking-[0.3em]">نسبة اكتمال المعلومات: {formData.completion}</p>
          </div>
          
          <div className="flex gap-4">
             {[1, 2, 3].map(s => (
               <div key={s} className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 border-2 ${step >= s ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/10 text-white/30'}`}>
                    {s}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${step === s ? 'text-emerald-400' : 'text-white/20'}`}>
                    {s === 1 ? 'الشخصية' : s === 2 ? 'الأكاديمية' : 'الإدارية'}
                  </span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="p-16 space-y-12">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              <label className="text-[12px] font-black text-slate-500 uppercase pr-2 tracking-widest">الاسم الكامل رباعياً</label>
              <input name="name" type="text" value={formData.name || ''} onChange={handleChange} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="w-full px-7 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none font-bold focus:bg-white focus:border-emerald-500/30 transition-all shadow-sm" placeholder="أدخل الاسم الرباعي..." />
            </div>
            <div className="space-y-3">
              <label className="text-[12px] font-black text-slate-500 uppercase pr-2 tracking-widest">رقم الهاتف النشط</label>
              <input name="phone" type="text" value={formData.phone || ''} onChange={handleChange} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="w-full px-7 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none font-bold focus:bg-white focus:border-emerald-500/30 transition-all shadow-sm" placeholder="05xxxxxxxx" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[12px] font-black text-slate-500 uppercase pr-2 tracking-widest">تاريخ الميلاد</label>
                <input name="dob" type="date" value={formData.dob || ''} onChange={handleChange} className="w-full px-5 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none font-bold text-right focus:bg-white focus:border-emerald-500/30 shadow-sm" />
              </div>
              <div className="space-y-3">
                <label className="text-[12px] font-black text-slate-500 uppercase pr-2 tracking-widest">العمر</label>
                <input name="age" type="text" value={formData.age || ''} readOnly className="w-full px-5 py-5 bg-emerald-50 text-emerald-900 rounded-[1.5rem] font-black text-center border-2 border-emerald-100 shadow-inner" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[12px] font-black text-slate-500 uppercase pr-2 tracking-widest">الجنسية</label>
              <input name="nationality" type="text" value={formData.nationality || ''} onChange={handleChange} className="w-full px-7 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none font-bold focus:bg-white focus:border-emerald-500/30 transition-all shadow-sm" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DynamicSelect name="teacher" label="المحفظ المباشر" options={dropdownOptions.teachers} placeholder="اختر المعلم من القائمة" value={formData.teacher} onChange={handleChange} isManual={manualInputs.teacher} toggleManual={toggleManual} />
            <DynamicSelect name="circle" label="الحلقة القرآنية" options={dropdownOptions.circles} placeholder="اختر الحلقة المسجل بها" value={formData.circle} onChange={handleChange} isManual={manualInputs.circle} toggleManual={toggleManual} />
            
            <div className="space-y-3">
              <label className="text-[12px] font-black text-slate-500 uppercase pr-2 tracking-widest">المستوى الأكاديمي</label>
              <div className="relative">
                  <select name="level" value={formData.level || ''} onChange={handleChange} className="w-full px-7 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none font-bold appearance-none cursor-pointer focus:bg-white focus:border-emerald-500/30 shadow-sm text-right">
                    <option value="">اختر المستوى</option>
                    {LEVEL_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                  </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[12px] font-black text-slate-500 uppercase pr-2 tracking-widest">الجزء الحالي (1-30)</label>
              <input name="part" type="number" min="1" max="30" value={formData.part || ''} onChange={handleChange} className="w-full px-7 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none font-bold shadow-sm" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              <label className="text-[12px] font-black text-slate-500 uppercase pr-2 tracking-widest">رقم الهوية الوطنية / الإقامة</label>
              <input name="nationalId" type="text" value={formData.nationalId || ''} onChange={handleChange} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="w-full px-7 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none font-bold shadow-sm" placeholder="10xxxxxxxx" />
            </div>
            <DynamicSelect name="category" label="فئة الدارس" options={dropdownOptions.categories} placeholder="اختر الفئة" value={formData.category} onChange={handleChange} isManual={manualInputs.category} toggleManual={toggleManual} />
            
            <div className="space-y-3 md:col-span-2 pt-6">
              <label className="text-[12px] font-black text-slate-500 uppercase pr-2 tracking-widest mb-4 block">حالة سداد الرسوم الإدارية</label>
              <div className="flex gap-6">
                {['نعم', 'لا'].map(option => (
                  <button key={option} type="button" onClick={() => setFormData(p => ({ ...p, fees: option }))}
                    className={`flex-1 py-6 rounded-[1.5rem] font-black text-lg transition-all border-2 ${formData.fees === option ? 'bg-emerald-600 text-white border-emerald-600 shadow-[0_15px_30px_-5px_rgba(16,185,129,0.3)] scale-[1.02]' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}>
                    {option === 'نعم' ? 'خالص (تم السداد)' : 'مطلوب (لم يسدد بعد)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-16 border-t border-slate-50">
          <button type="button" onClick={onCancel} className="text-slate-400 font-black text-sm hover:text-rose-600 transition-colors tracking-tight">إلغاء وإغلاق</button>
          <div className="flex gap-6">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-10 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black text-sm hover:bg-slate-200 transition-all">الخطوة السابقة</button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="px-12 py-5 bg-[#064E3B] text-white rounded-[1.5rem] font-black text-sm shadow-[0_15px_35px_-8px_rgba(6,78,59,0.3)] hover:scale-[1.03] transition-all">الخطوة التالية</button>
            ) : (
              <button 
                type="button" 
                onClick={handleFinalSubmit}
                disabled={isSaving} 
                className={`px-14 py-5 rounded-[1.5rem] font-black text-sm shadow-[0_20px_40px_-10px_rgba(5,150,105,0.4)] transition-all ${isSaving ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'}`}
              >
                {isSaving ? 'جاري المزامنة...' : 'إتمام الحفظ السحابي'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isSaving && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-[50]">
          <div className="bg-[#064E3B] text-white px-10 py-6 rounded-[2rem] shadow-2xl flex items-center gap-6 animate-pulse">
            <div className="w-6 h-6 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-black text-sm uppercase tracking-widest">جاري تأمين وحفظ البيانات في جوجل شيت...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStudentForm;
