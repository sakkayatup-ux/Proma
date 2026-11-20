'use client';

import React from 'react';
import { ModuleTab } from '@/types';

interface SidebarProps {
  activeTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
  pendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingCount,
}) => {
  const handleLogout = () => {
    // 1. ลบสถานะใน sessionStorage
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('role');

    // 2. ลบ Cookie เพื่อไม่ให้ Middleware ปล่อยผ่าน
    document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

    // 3. สั่งเปลี่ยนหน้ากลับไปที่ /login ทันที
    window.location.href = '/login';
  };

  const menuItems: { key: ModuleTab; label: string; badge?: number }[] = [
    { key: 'dashboard', label: 'Dashboard ภาพรวม' },
    { key: 'approval', label: 'อนุมัติวงเงิน', badge: pendingCount },
    { key: 'audit', label: 'ประวัติการอนุมัติ' },
    { key: 'budget', label: 'กำหนดงบประมาณ' },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-[#0B1120] text-white flex flex-col justify-between p-6 lg:min-h-screen">
      <div>
        {/* ส่วนหัวแบรนด์และป้ายสถานะสิทธิ์ผู้บริหาร */}
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-white">
            ระบบสวัสดิการและพนักงาน
          </h1>
      
        </div>

        {/* รายการปุ่มเมนูนำทาง */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectTab(item.key)}
                className={`w-full flex items-center justify-between rounded-full px-4 py-3 text-left text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    
                  />
                  {item.label}
                </span>

                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ส่วนท้ายแถบเมนู: ปุ่มออกจากระบบ */}
      <div className="pt-8">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-medium transition-all duration-200 border border-red-500/30 shadow-sm cursor-pointer group"
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
};