'use client';

import React, { useState } from 'react';
import { Check, X, Eye } from 'lucide-react';

type Request = {
  id: string; name: string; empId: string; type: string; subtype: string;
  date: string; amount: string; docs: number;
  status: 'รอ HR ตรวจสอบ' | 'รอผู้บริหารอนุมัติ' | 'อนุมัติ' | 'ไม่อนุมัติ';
  level?: string;
};

const REQUESTS: Request[] = [
  { id: 'DR-0124', name: 'ขจร จิตงาม', empId: 'EMP-001', type: 'ภัยพิบัติ', subtype: 'อุทกภัย รอบ 2/2569', date: '25 ต.ค. 69', amount: '—', docs: 4, status: 'รอ HR ตรวจสอบ', level: 'ระดับ 2' },
  { id: 'GW-0412', name: 'สมหญิง ใจดี', empId: 'EMP-012', type: 'สวัสดิการทั่วไป', subtype: 'ค่ารักษา (ครอบครัว•บุตร)', date: '20 ธ.ค. 69', amount: '฿2,000', docs: 3, status: 'รอ HR ตรวจสอบ' },
  { id: 'DR-0123', name: 'วิชัย พงษ์สุข', empId: 'EMP-034', type: 'ภัยพิบัติ', subtype: 'แผ่นดินไหว รอบ 2/2569', date: '18 ต.ค. 69', amount: '—', docs: 5, status: 'รอ HR ตรวจสอบ', level: 'ระดับ 1' },
  { id: 'DR-0122', name: 'มาลี สุขสวัสดิ์', empId: 'EMP-008', type: 'ภัยพิบัติ', subtype: 'ไฟป่า รอบ 1/2569', date: '10 ก.ย. 69', amount: '฿10,000', docs: 6, status: 'รอผู้บริหารอนุมัติ', level: 'ระดับ 3' },
  { id: 'GW-0388', name: 'ธนา พานทอง', empId: 'EMP-021', type: 'สวัสดิการทั่วไป', subtype: 'ค่ารักษา (ตนเอง)', date: '2 ก.ค. 69', amount: '฿850', docs: 2, status: 'อนุมัติ' },
  { id: 'GW-0361', name: 'ศิริ วัฒนสุข', empId: 'EMP-055', type: 'สวัสดิการทั่วไป', subtype: 'ค่ารักษา (ภรรยา•ผู้ป่วยนอก)', date: '14 ก.ย. 69', amount: '฿2,000', docs: 3, status: 'อนุมัติ' },
  { id: 'DR-0119', name: 'จันทร์ เพ็งพงศ์', empId: 'EMP-067', type: 'ภัยพิบัติ', subtype: 'อุทกภัย รอบ 1/2569', date: '5 มิ.ย. 69', amount: '฿0', docs: 1, status: 'ไม่อนุมัติ' },
];

const STATUS_STYLES: Record<string, string> = {
  'รอ HR ตรวจสอบ': 'bg-[#fef3c7] text-[#d97706] border-amber-200/60',
  'รอผู้บริหารอนุมัติ': 'bg-[#eff6ff] text-[#2563eb] border-blue-200/60',
  'อนุมัติ': 'bg-[#dcfce7] text-[#16a34a] border-green-200/60',
  'ไม่อนุมัติ': 'bg-[#fee2e2] text-[#ef4444] border-red-200/60',
};

export default function HrRequestsContent() {
  const [filterStatus, setFilterStatus] = useState<string>('ทั้งหมด');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const statuses = ['ทั้งหมด', 'รอ HR ตรวจสอบ', 'รอผู้บริหารอนุมัติ', 'อนุมัติ', 'ไม่อนุมัติ'];
  const filtered = filterStatus === 'ทั้งหมด' ? REQUESTS : REQUESTS.filter(r => r.status === filterStatus);
  const selected = REQUESTS.find(r => r.id === selectedId);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">คำขอสวัสดิการ</h2>
        <p className="text-xs text-slate-400 mt-1">ตรวจสอบและดำเนินการคำขอสวัสดิการของพนักงาน</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${filterStatus === s ? 'bg-[#1d4ed8] text-white border-blue-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            {s}{s !== 'ทั้งหมด' && <span className="ml-1.5 opacity-60">({REQUESTS.filter(r => r.status === s).length})</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={selected ? 'xl:col-span-2' : 'xl:col-span-3'}>
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 font-medium bg-slate-50/70">
                    <th className="pb-3 pt-4 px-4">เลขที่</th>
                    <th className="pb-3 pt-4 px-4">พนักงาน</th>
                    <th className="pb-3 pt-4 px-4">ประเภท</th>
                    <th className="pb-3 pt-4 px-4">วันที่</th>
                    <th className="pb-3 pt-4 px-4">เอกสาร</th>
                    <th className="pb-3 pt-4 px-4">สถานะ</th>
                    <th className="pb-3 pt-4 px-4">ดู</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filtered.map((row) => (
                    <tr key={row.id} onClick={() => setSelectedId(selectedId === row.id ? null : row.id)}
                      className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${selectedId === row.id ? 'bg-blue-50/40' : ''}`}>
                      <td className="py-4 px-4 font-semibold text-slate-900">{row.id}</td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{row.name}</div>
                        <div className="text-[10px] text-slate-400">{row.empId}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div>{row.subtype}</div>
                        {row.level && <div className="text-[10px] text-slate-400">{row.level}</div>}
                      </td>
                      <td className="py-4 px-4 text-slate-500">{row.date}</td>
                      <td className="py-4 px-4">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">{row.docs} ไฟล์</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${STATUS_STYLES[row.status]}`}>{row.status}</span>
                      </td>
                      <td className="py-4 px-4">
                        <button className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"><Eye size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <div className="py-16 text-center text-slate-400 text-sm">ไม่มีคำขอในสถานะนี้</div>}
          </div>
        </div>

        {selected && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900">{selected.id}</h3>
                <button onClick={() => setSelectedId(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><X size={16} /></button>
              </div>

              <div className="space-y-3 text-xs mb-5">
                {[
                  ['พนักงาน', `${selected.name} (${selected.empId})`],
                  ['ประเภท', selected.type],
                  ['รายละเอียด', selected.subtype],
                  ['วันที่ยื่น', selected.date],
                  ['เอกสาร', `${selected.docs} ไฟล์`],
                  ...(selected.level ? [['ระดับ', selected.level]] : []),
                  ['ยอดที่ขอ', selected.amount],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-semibold text-slate-800 text-right">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-700 mb-2">เอกสารแนบ</p>
                <div className="space-y-1.5">
                  {Array.from({ length: selected.docs }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                      <svg className="w-4 h-4 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs text-slate-600 font-medium">เอกสาร_{i + 1}.pdf</span>
                      <button className="ml-auto text-[10px] text-[#2563eb] hover:underline font-semibold">ดู</button>
                    </div>
                  ))}
                </div>
              </div>

              {selected.status === 'รอ HR ตรวจสอบ' && (
                <div className="space-y-2.5">
                  <button className="w-full bg-[#1d4ed8] hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm">
                    <Check size={16} /><span>ผ่านการตรวจสอบ → ส่งผู้บริหาร</span>
                  </button>
                  <button className="w-full bg-white hover:bg-red-50 text-[#ef4444] font-semibold py-3 rounded-xl transition-colors border border-red-200 flex items-center justify-center gap-2 text-sm">
                    <X size={16} /><span>ไม่ผ่าน • คืนผู้ยื่น</span>
                  </button>
                </div>
              )}
              {selected.status === 'รอผู้บริหารอนุมัติ' && (
                <div className="p-3 bg-[#eff6ff] rounded-xl text-xs text-[#2563eb] font-medium text-center border border-blue-100">อยู่ระหว่างรอผู้บริหารพิจารณา</div>
              )}
              {selected.status === 'อนุมัติ' && (
                <div className="p-3 bg-[#dcfce7] rounded-xl text-xs text-[#16a34a] font-medium text-center border border-green-200/60">อนุมัติและโอนเงินแล้ว</div>
              )}
              {selected.status === 'ไม่อนุมัติ' && (
                <div className="p-3 bg-[#fee2e2] rounded-xl text-xs text-[#ef4444] font-medium text-center border border-red-200/60">ไม่ผ่านการอนุมัติ</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
