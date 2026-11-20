'use client';

import React from 'react';

interface HrSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function HrSidebar({ activeTab, setActiveTab }: HrSidebarProps) {
  const handleLogout = () => {
    document.cookie = 'role=; path=/; max-age=0';
    document.cookie = 'isLoggedIn=; path=/; max-age=0';
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const menuItems = [
    'ภาพรวม & งบประมาณ',
    'ตรวจสอบคำขอ',
    'จัดการแบบฟอร์มสวัสดิการ',
    'ทะเบียนประวัติพนักงาน',
  ];

  return (
    <aside className="w-64 bg-[#0B132B] text-white flex flex-col justify-between min-h-screen p-4">
      <div>
        <div className="mb-2 px-2">
          <div className="text-xl font-bold">ระบบพนักงานและสวัสดิการ</div>
        </div>
        <div className="mb-6" />
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === item
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item}
              {item === 'ตรวจสอบคำขอ' && (
                <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">5</span>
              )}
            </button>
          ))}
        </nav>
      </div>
       <div className="pt-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-medium transition-all duration-200 border border-red-500/30 shadow-sm cursor-pointer group"
        >
          <svg 
            className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm">ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
