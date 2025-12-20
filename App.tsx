
import React, { useState, useEffect } from 'react';
import { fetchSheetData } from './services/googleSheets';
import { Student, ViewType } from './types';
import Dashboard from './components/Dashboard';
import StudentTable from './components/StudentTable';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchSheetData();
      setStudents(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Sidebar / Sidebar Navigation for Desktop */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-200">
                  🌙
                </div>
                <h1 className="text-xl font-black text-teal-800 hidden sm:block">نظام إدارة الحلقات</h1>
              </div>
              
              <div className="hidden md:flex gap-1">
                {[
                  { id: 'dashboard', label: 'الرئيسية', icon: '🏠' },
                  { id: 'table', label: 'قاعدة البيانات', icon: '📊' },
                  { id: 'add', label: 'إضافة دارس', icon: '➕' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as ViewType)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      activeView === item.id 
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-100' 
                      : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
               <button className="p-2 text-gray-400 hover:text-teal-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
               </button>
               <div className="w-10 h-10 rounded-full bg-teal-100 border-2 border-teal-200 flex items-center justify-center text-teal-700 font-bold cursor-pointer">
                  أ
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-teal-700 font-bold animate-pulse">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <>
            <header className="mb-8">
              <h2 className="text-2xl font-black text-gray-900">
                {activeView === 'dashboard' && 'نظرة عامة على البيانات'}
                {activeView === 'table' && 'قاعدة بيانات الدارسين'}
                {activeView === 'add' && 'إضافة دارس جديد'}
              </h2>
              <p className="text-gray-500 mt-1">
                {activeView === 'dashboard' && 'إحصائيات وتحليلات الحلقات لعام 2025'}
                {activeView === 'table' && 'إدارة واستعراض كافة بيانات الدارسين المسجلين'}
                {activeView === 'add' && 'تعبئة بيانات الدارس لإضافته لقاعدة البيانات'}
              </p>
            </header>

            {activeView === 'dashboard' && <Dashboard students={students} />}
            {activeView === 'table' && <StudentTable students={students} />}
            {activeView === 'add' && (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center flex flex-col items-center justify-center gap-4">
                 <div className="text-6xl">🚧</div>
                 <h3 className="text-xl font-bold">نموذج الإضافة قيد التطوير</h3>
                 <p className="text-gray-500 max-w-md">سيتم ربط هذا النموذج بـ Google App Script في الخطوة القادمة لتحديث الجدول مباشرة.</p>
                 <button 
                  onClick={() => setActiveView('table')}
                  className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold"
                 >
                   العودة للقاعدة
                 </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
        {[
          { id: 'dashboard', label: 'إحصائيات', icon: '🏠' },
          { id: 'table', label: 'البيانات', icon: '📊' },
          { id: 'add', label: 'إضافة', icon: '➕' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as ViewType)}
            className={`flex flex-col items-center gap-1 ${activeView === item.id ? 'text-teal-600' : 'text-gray-400'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
