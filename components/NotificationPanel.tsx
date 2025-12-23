
import React from 'react';
import { Student } from '../types';

interface NotificationPanelProps {
  notifications: {
    expiredIds: Student[];
    expiringSoonIds: Student[];
    unpaidFees: Student[];
  };
  onClose: () => void;
  onViewAll: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onViewAll }) => {
  const { expiredIds, expiringSoonIds, unpaidFees } = notifications;
  const total = expiredIds.length + expiringSoonIds.length + unpaidFees.length;

  return (
    <div className="absolute left-0 mt-5 w-80 md:w-96 bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-[#EBEBEB] z-[60] overflow-hidden animate-in fade-in zoom-in duration-250 origin-top-left">
      <div className="p-6 border-b border-[#EBEBEB] flex justify-between items-center bg-[#84754E] text-white">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]"></div>
          <h3 className="font-black text-sm tracking-widest uppercase">تنبيهات النظام ({total})</h3>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 bg-[#FDFDFD]">
        {total > 0 ? (
          <>
            {expiredIds.map(s => (
              <div key={s.id} className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col">
                <p className="font-black text-[#444] text-xs">{s.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded font-black uppercase">هوية منتهية</span>
                  <span className="text-[9px] text-rose-400 font-bold uppercase tracking-widest">تحديث مطلوب</span>
                </div>
              </div>
            ))}
            {expiringSoonIds.map(s => (
              <div key={s.id} className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col">
                <p className="font-black text-[#444] text-xs">{s.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded font-black uppercase">قرب الانتهاء</span>
                  <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">خلال 30 يوم</span>
                </div>
              </div>
            ))}
            {unpaidFees.map(s => (
              <div key={s.id} className="p-4 bg-[#F4F1EA] rounded-2xl border border-[#EADBC8] flex flex-col">
                <p className="font-black text-[#444] text-xs">{s.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] bg-[#84754E] text-white px-2 py-0.5 rounded font-black uppercase">رسوم مطلوبة</span>
                  <span className="text-[9px] text-[#84754E] font-bold uppercase tracking-widest">لم يسدد بعد</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="p-16 text-center">
            <div className="text-4xl mb-4">✨</div>
            <p className="text-[11px] font-black text-[#AAA] uppercase tracking-widest">لا توجد تنبيهات جديدة</p>
          </div>
        )}
      </div>
      
      <div className="p-6 bg-[#F9F9F9] text-center border-t border-[#EBEBEB] space-y-4">
        <button 
          onClick={onViewAll}
          className="w-full py-4 bg-[#84754E] text-white rounded-2xl text-xs font-black shadow-lg hover:bg-[#6D603F] transition-all uppercase tracking-widest"
        >
          مركز التنبيهات الموحد
        </button>
        <button onClick={onClose} className="text-[10px] font-black text-[#AAA] hover:text-[#84754E] transition-colors uppercase tracking-[0.2em]">إغلاق القائمة</button>
      </div>
    </div>
  );
};

export default NotificationPanel;
