
import React, { useState } from 'react';

interface AddStudentFormProps {
  onCancel: () => void;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onCancel }) => {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
      <div className="bg-[#0F172A] p-10 text-white flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black mb-1">تسجيل دارس جديد</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">توسعة قاعدة بيانات المركز</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-10 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
          ))}
        </div>
      </div>

      <div className="p-12 space-y-10">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-up">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase ml-2">الاسم الكامل للدارس</label>
              <input type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="أدخل الاسم رباعياً..." />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase ml-2">رقم الهوية / الإقامة</label>
              <input type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="10xxxxxxxx" />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase ml-2">الجنسية</label>
              <select className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold appearance-none">
                <option>سعودي</option>
                <option>مقيم</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase ml-2">تاريخ الميلاد</label>
              <input type="date" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-up text-center py-10">
            <div className="md:col-span-2 text-slate-400 italic font-medium">سيتم ربط هذا القسم بالخوادم لتفعيل المزامنة الفورية...</div>
          </div>
        )}

        <div className="flex justify-between items-center pt-8 border-t border-slate-50">
          <button onClick={onCancel} className="text-slate-400 font-black text-sm hover:text-slate-600 transition-colors">إلغاء العملية</button>
          <div className="flex gap-4">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">السابق</button>}
            <button 
              onClick={() => step < 3 ? setStep(step + 1) : null}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              {step === 3 ? 'إتمام التسجيل' : 'المتابعة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentForm;
