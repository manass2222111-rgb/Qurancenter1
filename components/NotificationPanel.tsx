
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
    <div className="absolute left-0 mt-3 w-80 md:w-96 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 z-[60] overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-left">
      <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          <h3 className="font-black text-sm tracking-tight">إشعارات النظام ({total})</h3>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-1.5 rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="max-h-[380px] overflow-y-auto p-3 space-y-2">
        {total > 0 ? (
          <>
            {expiredIds.slice(0, 3).map(s => (
              <div key={s.id} className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex justify-between items-center">
                <div>
                  <p className="font-black text-slate-900 text-xs">{s.name}</p>
                  <p className="text-[10px] text-rose-600 font-bold mt-1">هوية منتهية</p>
                </div>
              </div>
            ))}
            {expiringSoonIds.slice(0, 3).map(s => (
              <div key={s.id} className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex justify-between items-center">
                <div>
                  <p className="font-black text-slate-900 text-xs">{s.name}</p>
                  <p className="text-[10px] text-amber-600 font-bold mt-1">تقترب من الانتهاء</p>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="p-12 text-center text-slate-300">
            <p className="text-xs font-bold">لا توجد إشعارات جديدة</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-50 text-center border-t border-gray-100 space-y-3">
        <button 
          onClick={onViewAll}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          عرض مركز التنبيهات الكامل
        </button>
        <button onClick={onClose} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">إغلاق القائمة</button>
      </div>
    </div>
  );
};

export default NotificationPanel;
