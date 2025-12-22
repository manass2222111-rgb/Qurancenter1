
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
        if (action === 'delete') alert("تم حذف السجل بنجاح.");
        if (action === 'update') alert("تم تحديث السجل بنجاح.");
        if (action === 'add') {
          alert("تم تسجيل الدارس الجديد بنجاح.");
          setActiveView('table');
        }
      } else {
        alert("فشل تنفيذ العملية. تأكد من إعدادات الربط.");
      }
    } catch (err) {
      alert("خطأ في الاتصال بالخادم.");
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
      {/* Sidebar - Sapphire Blue Theme */}
      <aside className="hidden lg:flex w-72 bg-[#0F172A] flex-col relative z-20 shadow-2xl border-l border-white/5">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10 group">
            <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30 transition-transform group-hover:rotate-12">ن</div>
            <div>
              <h1 className="text-white font-black text-lg leading-tight">نور القرآن</h1>
              <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mt-1 block">المنصة الإدارية</span>
            </div>
          </div>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'الرئيسية', icon: Icons.Home },
              { id: 'table', label: 'الطلاب', icon: Icons.Users },
              { id: 'alerts', label: 'التنبيهات', icon: Icons.Alert, count: totalNotifications },
              { id: 'add', label: 'تسجيل جديد', icon: Icons.Add },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id as ViewType)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm ${
                  activeView === item.id 
                  ? 'sidebar-active' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                <div className="flex items-center gap-4"><item.icon />{item.label}</div>
                {item.count ? <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{item.count}</span> : null}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-white/5">
          <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all font-bold text-sm">
            <Icons.Settings /> الإعدادات
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 glass-header flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <h2 className="text-slate-900 font-black text-xl tracking-tight">
              {activeView === 'dashboard' ? 'نظرة عامة' : activeView === 'table' ? 'سجل الطلاب' : activeView === 'alerts' ? 'مركز التنبيهات' : 'إضافة طالب'}
            </h2>
            {isSyncing && (
              <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 shadow-sm animate-pulse">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">مزامنة سحابية...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
             <div className={`flex items-center gap-3 px-5 py-2 rounded-full border text-[11px] font-black uppercase shadow-sm transition-all ${scriptUrl ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
              <div className={`w-2 h-2 rounded-full ${scriptUrl ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
              {scriptUrl ? 'سحابي متصل' : 'ضبط الاتصال'}
            </div>
            <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 w-11 h-11 flex items-center justify-center rounded-2xl transition-all">
              <Icons.Bell />
              {totalNotifications > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-lg">{totalNotifications}</span>}
            </button>
            {isNotificationOpen && <NotificationPanel notifications={notifications} onClose={() => setIsNotificationOpen(false)} onViewAll={() => { setActiveView('alerts'); setIsNotificationOpen(false); }} />}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 relative">
          {isInitialLoading && students.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-6 text-slate-400 font-bold animate-pulse text-sm">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <div className="max-w-[1500px] mx-auto animate-content">
              {activeView === 'dashboard' && <Dashboard students={students} />}
              {activeView === 'table' && <StudentTable students={students} onUpdate={(s) => handleAction(s, 'update')} onDelete={(s) => handleAction(s, 'delete')} />}
              {activeView === 'alerts' && <AlertsView notifications={notifications} />}
              {activeView === 'add' && <AddStudentForm onAdd={(s) => handleAction(s, 'add')} onCancel={() => setActiveView('table')} studentsCount={students.length} students={students} isSaving={isSaving} />}
            </div>
          )}
        </div>
      </main>

      {/* Settings Dialog */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-8 bg-[#0F172A] text-white text-center relative overflow-hidden">
              <h3 className="text-2xl font-black mb-1 relative z-10">إعدادات الربط</h3>
              <p className="text-slate-400 text-xs relative z-10 tracking-widest uppercase">Apps Script API Service</p>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest">رابط الخدمة (Script URL)</label>
                <input type="text" value={scriptUrl} onChange={(e) => setScriptUrlState(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-indigo-500 transition-all text-xs font-mono" placeholder="https://script.google.com/..." />
              </div>
              <button onClick={handleSaveSettings} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">حفظ البيانات وتفعيل المزامنة</button>
              <button onClick={() => setShowSettings(false)} className="w-full text-slate-400 font-bold text-xs hover:text-slate-600">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
