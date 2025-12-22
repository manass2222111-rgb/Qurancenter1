
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchSheetData, performSheetAction, getScriptUrl, setScriptUrl } from './services/googleSheets';
import { Student, ViewType } from './types';
import Dashboard from './components/Dashboard';
import StudentTable from './components/StudentTable';
import NotificationPanel from './components/NotificationPanel';
import AddStudentForm from './components/AddStudentForm';
import AlertsView from './components/AlertsView';

const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  Add: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
  Bell: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
};

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [scriptUrl, setScriptUrlState] = useState(getScriptUrl());

  const loadData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const data = await fetchSheetData();
      setStudents(data);
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setIsInitialLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (student: Student, action: 'add' | 'update' | 'delete') => {
    if (!scriptUrl) {
      setShowSettings(true);
      return;
    }
    try {
      setIsSaving(true);
      const success = await performSheetAction(student, action);
      if (success) {
        await loadData();
        if (action === 'delete') alert("تم حذف الدارس بنجاح.");
        if (action === 'update') alert("تم تحديث البيانات بنجاح.");
        if (action === 'add') {
          alert("تم تسجيل الدارس بنجاح.");
          setActiveView('table');
        }
      } else {
        alert("لم يتم تنفيذ العملية، يرجى التحقق من الرابط.");
      }
    } catch (err) {
      alert("حدث خطأ تقني في الاتصال.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = () => {
    setScriptUrl(scriptUrl);
    setShowSettings(false);
    loadData();
  };

  const notifications = useMemo(() => {
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return {
      expiredIds: students.filter(s => s.expiryId && new Date(s.expiryId) < now),
      expiringSoonIds: students.filter(s => {
        if (!s.expiryId) return false;
        const d = new Date(s.expiryId);
        return d > now && d.getTime() < (now.getTime() + thirtyDays);
      }),
      unpaidFees: students.filter(s => s.fees !== 'نعم')
    };
  }, [students]);

  const totalNotifications = notifications.expiredIds.length + notifications.expiringSoonIds.length + notifications.unpaidFees.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden font-['Tajawal'] text-right" dir="rtl">
      {/* Sidebar - Re-designed */}
      <aside className="hidden lg:flex w-80 bg-[#064E3B] flex-col relative z-20 shadow-2xl">
        <div className="p-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-emerald-400 font-black text-xl shadow-inner border border-white/5">ن</div>
            <div>
              <h1 className="text-white font-black text-xl tracking-wide leading-tight">نور القرآن</h1>
              <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-[0.2em] mt-1 block">إدارة الحلقات</span>
            </div>
          </div>
          <nav className="space-y-3">
            {[
              { id: 'dashboard', label: 'الرئيسية', icon: Icons.Home },
              { id: 'table', label: 'الطلاب', icon: Icons.Users },
              { id: 'alerts', label: 'التنبيهات', icon: Icons.Alert, count: totalNotifications },
              { id: 'add', label: 'تسجيل جديد', icon: Icons.Add },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id as ViewType)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.25rem] transition-all duration-400 font-bold text-sm ${
                  activeView === item.id 
                  ? 'sidebar-active' 
                  : 'text-emerald-100/60 hover:text-white hover:bg-white/5'
                }`}>
                <div className="flex items-center gap-4"><item.icon />{item.label}</div>
                {item.count ? <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white shadow-lg">{item.count}</span> : null}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-10 border-t border-emerald-800/30">
          <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] text-emerald-100/40 hover:text-white hover:bg-white/5 transition-all font-bold text-sm">
            <Icons.Settings /> الإعدادات
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-24 glass-header flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <h2 className="text-slate-900 font-black text-2xl tracking-tight">
              {activeView === 'dashboard' ? 'لوحة المتابعة' : activeView === 'table' ? 'سجل الدارسين' : activeView === 'alerts' ? 'التنبيهات الإدارية' : 'إضافة دارس جديد'}
            </h2>
            {isSyncing && (
              <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm animate-pulse">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">مزامنة سحابية...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
             <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full border text-[11px] font-black uppercase shadow-sm transition-all ${scriptUrl ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${scriptUrl ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
              {scriptUrl ? 'سحابي متصل' : 'ضبط الربط'}
            </div>
            <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-2xl transition-all">
              <Icons.Bell />
              {totalNotifications > 0 && <span className="absolute top-3 right-3 w-4.5 h-4.5 bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-lg">{totalNotifications}</span>}
            </button>
            {isNotificationOpen && <NotificationPanel notifications={notifications} onClose={() => setIsNotificationOpen(false)} onViewAll={() => { setActiveView('alerts'); setIsNotificationOpen(false); }} />}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 relative">
          {isInitialLoading && students.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 border-[5px] border-emerald-600 border-t-transparent rounded-full animate-spin shadow-xl"></div>
              <p className="mt-6 text-slate-400 font-bold animate-pulse text-sm">جاري تهيئة المنصة السحابية...</p>
            </div>
          ) : (
            <div className="max-w-[1400px] mx-auto animate-slide-up">
              {activeView === 'dashboard' && <Dashboard students={students} />}
              {activeView === 'table' && <StudentTable students={students} onUpdate={(s) => handleAction(s, 'update')} onDelete={(s) => handleAction(s, 'delete')} />}
              {activeView === 'alerts' && <AlertsView notifications={notifications} />}
              {activeView === 'add' && <AddStudentForm onAdd={(s) => handleAction(s, 'add')} onCancel={() => setActiveView('table')} studentsCount={students.length} students={students} isSaving={isSaving} />}
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal - Styled */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-emerald-950/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden">
            <div className="p-10 bg-[#064E3B] text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <h3 className="text-2xl font-black mb-2 relative z-10">إعدادات الربط</h3>
              <p className="text-emerald-100/60 text-xs font-bold relative z-10 tracking-widest uppercase">Apps Script API Connection</p>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest">رابط الخدمة السحابية</label>
                <input type="text" value={scriptUrl} onChange={(e) => setScriptUrlState(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-emerald-500 transition-all text-xs font-mono text-emerald-900" placeholder="https://script.google.com/..." />
              </div>
              <button onClick={handleSaveSettings} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-sm shadow-[0_15px_30px_-5px_rgba(16,185,129,0.3)] hover:bg-emerald-700 active:scale-95 transition-all">حفظ وتفعيل الربط</button>
              <button onClick={() => setShowSettings(false)} className="w-full text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors">إغلاق بدون حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
