
import React, { useState, useMemo } from 'react';
import { Student } from '../types';

interface AlertsViewProps {
  notifications: {
    expiredIds: Student[];
    expiringSoonIds: Student[];
    unpaidFees: Student[];
  };
}

type FilterType = 'all' | 'expired' | 'soon' | 'fees';

const AlertsView: React.FC<AlertsViewProps> = ({ notifications }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const allAlerts = useMemo(() => {
    const list = [
      ...notifications.expiredIds.map(s => ({ ...s, alertType: 'expired', label: 'منتهية', color: 'rose' })),
      ...notifications.expiringSoonIds.map(s => ({ ...s, alertType: 'soon', label: 'أوشكت على الانتهاء', color: 'amber' })),
      ...notifications.unpaidFees.map(s => ({ ...s, alertType: 'fees', label: 'رسوم متأخرة', color: 'indigo' }))
    ];
    return list;
  }, [notifications]);

  const filteredAlerts = allAlerts.filter(a => {
    const matchesFilter = filter === 'all' || a.alertType === filter;
    const matchesSearch = !search || a.name.includes(search) || a.teacher.includes(search);
    return matchesFilter && matchesSearch;
  });

  // وظيفة تصدير كشف المتابعة
  const handleExportAlerts = () => {
    if (filteredAlerts.length === 0) return;

    const headers = [
      "اسم الدارس", "نوع التنبيه", "المحفظ", "رقم الجوال", "التفاصيل (تاريخ الانتهاء/الرسوم)"
    ];

    const rows = filteredAlerts.map(a => [
      a.name, a.label, a.teacher, a.phone, 
      a.alertType === 'fees' ? 'مطلوب السداد' : a.expiryId
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `كشف_متابعة_التنبيهات_${new Date().toLocaleDateString('ar-EG')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { id: 'all', label: 'كافة التنبيهات', count: allAlerts.length, color: 'slate' },
          { id: 'expired', label: 'هويات منتهية', count: notifications.expiredIds.length, color: 'rose' },
          { id: 'soon', label: 'قرب الانتهاء', count: notifications.expiringSoonIds.length, color: 'amber' },
          { id: 'fees', label: 'متأخرات مالية', count: notifications.unpaidFees.length, color: 'indigo' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as FilterType)}
            className={`p-6 rounded-[2rem] border transition-all text-right ${
              filter === item.id 
              ? `bg-${item.color}-600 border-transparent text-white shadow-xl shadow-${item.color}-200` 
              : `bg-white border-slate-100 text-slate-600 hover:border-${item.color}-300`
            }`}
          >
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${filter === item.id ? 'text-white/70' : 'text-slate-400'}`}>
              {item.label}
            </p>
            <h4 className="text-2xl font-black">{item.count}</h4>
          </button>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input 
            type="text"
            placeholder="البحث في التنبيهات (اسم الطالب أو المعلم)..."
            className="w-full pr-12 pl-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <button 
          onClick={handleExportAlerts}
          className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          تصدير كشف المتابعة
        </button>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center group hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl bg-${item.color}-50 text-${item.color}-600 font-black`}>
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{item.name}</h5>
                  <div className="flex gap-4 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round"/></svg>
                      {item.teacher}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2" strokeLinecap="round"/></svg>
                      {item.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                <div className="text-left md:text-right">
                  <p className={`text-[10px] font-black uppercase mb-1 text-${item.color}-600`}>{item.label}</p>
                  <p className="text-xs font-bold text-slate-500">{item.alertType === 'fees' ? 'الرسوم مطلوبة' : `تاريخ الانتهاء: ${item.expiryId}`}</p>
                </div>
                <button className={`p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-${item.color}-600 hover:text-white transition-all`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
             <div className="text-6xl mb-4">✨</div>
             <h3 className="text-xl font-black text-slate-900">كل شيء على ما يرام</h3>
             <p className="text-slate-400 text-sm mt-2">لا توجد تنبيهات تطابق المعايير المختارة حالياً.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsView;
