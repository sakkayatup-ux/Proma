'use client';

import React from 'react';

export default function HrReportContent() {
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const data = [3, 5, 2, 4, 6, 8, 5, 7, 9, 12, 3, 0];
  const maxVal = Math.max(...data);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">รายงาน</h2>
          <p className="text-xs text-slate-400 mt-1">สรุปสถิติสวัสดิการประจำปี 2569</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          ส่งออก CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'คำขอทั้งหมด', value: '64', sub: 'รายการ ปี 2569' },
          { label: 'ยอดจ่ายรวม', value: '฿1.2M', sub: 'จาก ฿2M งบประมาณ' },
          { label: 'อัตราอนุมัติ', value: '85%', sub: '41/48 รายการ' },
          { label: 'เฉลี่ยต่อคน', value: '฿18K', sub: 'ต่อปี' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm">
            <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">จำนวนคำขอรายเดือน</h3>
          <p className="text-xs text-slate-400 mb-5">ปี 2569</p>
          <div className="flex items-end gap-1.5 h-36">
            {data.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-[#2563eb] transition-all"
                  style={{ height: `${(val / maxVal) * 100}%`, minHeight: val > 0 ? '4px' : '0' }} />
                <span className="text-[10px] text-slate-400">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">สัดส่วนตามประเภท</h3>
          <p className="text-xs text-slate-400 mb-5">ปี 2569</p>
          <div className="space-y-3.5">
            {[
              { label: 'ภัยพิบัติ', count: 28, pct: 58, color: '#2563eb' },
              { label: 'ค่ารักษาพยาบาล (ตนเอง)', count: 12, pct: 25, color: '#16a34a' },
              { label: 'ค่ารักษาพยาบาล (ครอบครัว)', count: 8, pct: 17, color: '#d97706' },
            ].map(({ label, count, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="text-slate-400">{count} รายการ ({pct}%)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-5">พนักงานที่เบิกสวัสดิการสูงสุด (ปี 2569)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 font-medium">
                <th className="pb-3 px-3">อันดับ</th>
                <th className="pb-3 px-3">พนักงาน</th>
                <th className="pb-3 px-3">แผนก</th>
                <th className="pb-3 px-3">จำนวนครั้ง</th>
                <th className="pb-3 px-3">ยอดรวม</th>
                <th className="pb-3 px-3">% ของเพดาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {[
                { rank: 1, name: 'จันทร์ เพ็งพงศ์', dept: 'บัญชี', count: 6, total: 22000, pct: 73 },
                { rank: 2, name: 'ธนา พานทอง', dept: 'ขาย', count: 7, total: 18000, pct: 60 },
                { rank: 3, name: 'มาลี สุขสวัสดิ์', dept: 'บัญชี', count: 5, total: 10000, pct: 33 },
                { rank: 4, name: 'ศิริ วัฒนสุข', dept: 'HR', count: 4, total: 7500, pct: 25 },
                { rank: 5, name: 'สมหญิง ใจดี', dept: 'การตลาด', count: 3, total: 4500, pct: 15 },
              ].map((row) => (
                <tr key={row.rank}>
                  <td className="py-4 px-3">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-extrabold ${row.rank === 1 ? 'bg-amber-100 text-amber-700' : row.rank === 2 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'}`}>{row.rank}</span>
                  </td>
                  <td className="py-4 px-3 font-semibold text-slate-900">{row.name}</td>
                  <td className="py-4 px-3 text-slate-500">{row.dept}</td>
                  <td className="py-4 px-3">{row.count} ครั้ง</td>
                  <td className="py-4 px-3 font-semibold text-slate-900">฿{row.total.toLocaleString()}</td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${row.pct}%`, backgroundColor: row.pct > 60 ? '#ef4444' : row.pct > 30 ? '#d97706' : '#16a34a' }} />
                      </div>
                      <span className="text-slate-500">{row.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
