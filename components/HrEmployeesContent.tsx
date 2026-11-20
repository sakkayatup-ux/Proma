'use client';

import React, { useState } from 'react';

const EMPLOYEES = [
  { id: 'EMP-001', name: 'ขจร จิตงาม', dept: 'ไอที', position: 'นักพัฒนาซอฟต์แวร์', requests: 2, used: 5000, max: 30000 },
  { id: 'EMP-008', name: 'มาลี สุขสวัสดิ์', dept: 'บัญชี', position: 'นักบัญชี', requests: 5, used: 10000, max: 30000 },
  { id: 'EMP-012', name: 'สมหญิง ใจดี', dept: 'การตลาด', position: 'นักการตลาด', requests: 3, used: 4500, max: 30000 },
  { id: 'EMP-021', name: 'ธนา พานทอง', dept: 'ขาย', position: 'ผู้จัดการขาย', requests: 7, used: 18000, max: 30000 },
  { id: 'EMP-034', name: 'วิชัย พงษ์สุข', dept: 'ไอที', position: 'DevOps Engineer', requests: 1, used: 0, max: 30000 },
  { id: 'EMP-055', name: 'ศิริ วัฒนสุข', dept: 'HR', position: 'HR Officer', requests: 4, used: 7500, max: 30000 },
  { id: 'EMP-067', name: 'จันทร์ เพ็งพงศ์', dept: 'บัญชี', position: 'ผู้ช่วยผู้จัดการ', requests: 6, used: 22000, max: 30000 },
];

export default function HrEmployeesContent() {
  const [search, setSearch] = useState('');
  const filtered = EMPLOYEES.filter(e => e.name.includes(search) || e.id.includes(search) || e.dept.includes(search));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">ข้อมูลพนักงาน</h2>
        <p className="text-xs text-slate-400 mt-1">สิทธิ์สวัสดิการและประวัติการเบิกของพนักงานทั้งหมด</p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="ค้นหาชื่อ, รหัสพนักงาน, แผนก..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 font-medium bg-slate-50/70">
                <th className="pb-3 pt-4 px-4">รหัส</th>
                <th className="pb-3 pt-4 px-4">ชื่อ</th>
                <th className="pb-3 pt-4 px-4">แผนก</th>
                <th className="pb-3 pt-4 px-4">ตำแหน่ง</th>
                <th className="pb-3 pt-4 px-4">คำขอ (ปีนี้)</th>
                <th className="pb-3 pt-4 px-4">วงเงินที่ใช้</th>
                <th className="pb-3 pt-4 px-4">คงเหลือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((emp) => {
                const remaining = emp.max - emp.used;
                const pct = (emp.used / emp.max) * 100;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">{emp.id}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold text-[10px] shrink-0">{emp.name.charAt(0)}</div>
                        <span className="font-semibold text-slate-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500">{emp.dept}</td>
                    <td className="py-4 px-4 text-slate-500">{emp.position}</td>
                    <td className="py-4 px-4">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">{emp.requests} รายการ</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct > 80 ? '#ef4444' : pct > 50 ? '#d97706' : '#2563eb' }} />
                        </div>
                        <span className="font-semibold text-slate-900 shrink-0">฿{emp.used.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${remaining > 10000 ? 'text-[#16a34a]' : remaining > 0 ? 'text-[#d97706]' : 'text-[#ef4444]'}`}>฿{remaining.toLocaleString()}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="py-16 text-center text-slate-400 text-sm">ไม่พบพนักงานที่ค้นหา</div>}
      </div>
    </div>
  );
}
