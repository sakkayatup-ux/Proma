'use client';

import React, { useEffect, useState } from 'react';
import HrSidebar from '@/components/HrSidebar';
import HrHeader from '@/components/HrHeader';
import HrOverviewContent from '@/components/HrOverviewContent';
import HrVerifyContent from '@/components/HrVerifyContent';
import HrFormBuilderContent from '@/components/HrFormBuilderContent';
import HrEmployeeContent from '@/components/HrEmployeeContent';
import { useStore } from '@/lib/store';

// ฝั่ง HR (H0–H3)
export default function HrPage() {
  const [activeTab, setActiveTab] = useState('ภาพรวม & งบประมาณ');
  const { db } = useStore();

  useEffect(() => {
    const s = sessionStorage.getItem('session');
    if (!s || JSON.parse(s).role !== 'hr') window.location.href = '/login';
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col md:flex-row font-sans antialiased text-slate-800">
      <HrSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 bg-[#f8fafc] p-6 lg:p-10 overflow-y-auto">
        <HrHeader />
        {!db ? (
          <p className="text-sm text-slate-400">กำลังโหลดข้อมูล...</p>
        ) : (
          <>
            {activeTab === 'ภาพรวม & งบประมาณ' && <HrOverviewContent onNavigateToVerify={() => setActiveTab('ตรวจสอบคำขอ')} />}
            {activeTab === 'ตรวจสอบคำขอ' && <HrVerifyContent />}
            {activeTab === 'จัดการแบบฟอร์มสวัสดิการ' && <HrFormBuilderContent />}
            {activeTab === 'ทะเบียนประวัติพนักงาน' && <HrEmployeeContent />}
          </>
        )}
      </main>
    </div>
  );
}
