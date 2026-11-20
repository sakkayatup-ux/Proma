'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    // 1. ลบ Cookie สิทธิ์การใช้งานออก
    document.cookie = "role=; path=/; max-age=0";
    document.cookie = "isLoggedIn=; path=/; max-age=0";
    
    // 2. เคลียร์ sessionStorage
    sessionStorage.clear();

    // 3. ดีดกลับไปหน้า Login
    window.location.href = '/login';
  };

  // รายการเมนูทั้งหมดของ User
  const menuItems = [
    'หน้าหลัก',
    'เบิกสวัสดิการทั่วไป',
    'เบิกสวัสดิการประเภทภัยพิบัติ',
    'ติดตามสถานะ',
    'ข้อมูลส่วนตัว'
  ];

  return (
    <aside className="w-64 bg-[#0B132B] text-white flex flex-col justify-between min-h-screen p-4">
      {/* ส่วนบน: โลโก้และเมนูนำทาง */}
      <div>
        <div className="text-xl font-bold mb-8 px-2">ระบบพนักงานและสวัสดิการ</div>

        <nav className="space-y-2">
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
            </button>
          ))}
        </nav>
      </div>

      {/* ส่วนล่าง: ปุ่มออกจากระบบ */}
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