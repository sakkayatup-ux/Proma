import React, { useState } from 'react'; // นำเข้า React และ useState สำหรับเก็บคำค้นหาและแท็บตัวกรองในตาราง
import { AuditLogItem } from '@/types'; // นำเข้าโครงสร้างข้อมูลรายการประวัติการพิจารณาคำขอ

// กำหนดโครงสร้างข้อมูล (Props) ที่ตาราง Audit Log ต้องรับเข้ามา
interface AuditLogTableProps {
  logs: AuditLogItem[]; // รายการประวัติการอนุมัติ/ปฏิเสธทั้งหมดในระบบ
  onSelectLog: (log: AuditLogItem) => void; // ฟังก์ชันเมื่อคลิกที่แถวรายการ เพื่อเปิดดูรายละเอียดประวัติย้อนหลัง
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  onSelectLog,
}) => {
  // เก็บข้อความค้นหาเฉพาะในส่วนตาราง Audit Log (ค้นหาเลขที่คำขอ หรือ ชื่อพนักงาน)
  const [logSearch, setLogSearch] = useState('');
  // เก็บสถานะแท็บตัวกรองประเภทกองทุน ('all' = ทั้งหมด, 'welfare' = สวัสดิการทั่วไป, 'disaster' = ภัยพิบัติ)
  const [logTypeTab, setLogTypeTab] = useState<'all' | 'welfare' | 'disaster'>('all');

  // กรองรายการประวัติตามประเภทกองทุนและข้อความค้นหาที่ผู้ใช้เลือก
  const filtered = logs.filter((l) => {
    const matchType = logTypeTab === 'all' || l.type === logTypeTab; // เช็กว่าตรงกับแท็บประเภทที่เลือกหรือไม่
    const q = logSearch.trim().toLowerCase(); // แปลงคำค้นหาเป็นตัวพิมพ์เล็กและตัดช่องว่างหัวท้าย
    const matchQ =
      !q || // ถ้าช่องค้นหาว่าง ให้ผ่านทั้งหมด
      l.requestId.toLowerCase().includes(q) || // ค้นหาจากเลขที่คำขอ (เช่น REQ-001)
      l.employeeName.toLowerCase().includes(q); // ค้นหาจากชื่อพนักงาน
    return matchType && matchQ; // ต้องตรงทั้งประเภทและคำค้นหาจึงจะแสดงผล
  });

  return (
    // กล่องการ์ดสีขาว ขอบมน ครอบส่วนตารางบันทึกการอนุมัติทั้งหมด
    <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
      {/* 1. ส่วนหัวการ์ด: ชื่อหัวข้อ + ช่องค้นหา + แท็บสลับประเภทกองทุน */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            บันทึกการอนุมัติ (Audit log)
          </h3>
          <p className="text-xs text-slate-400">
            ทุกการตัดสินใจถูกบันทึกเพื่อตรวจสอบย้อนหลัง (คลิกที่แถบเพื่อดูประวัติและหลักฐานทั้งหมด)
          </p>
        </div>

        {/* แถบเครื่องมือด้านขวา: ช่องค้นหาและปุ่มเลือกแท็บ */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* ช่องค้นหาเลขที่คำขอหรือชื่อพนักงาน */}
          <input
            type="text"
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            placeholder="ค้นหาเลขที่คำขอ, ชื่อพนักงาน..."
            className="w-full sm:w-56 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />

          {/* กลุ่มปุ่มสลับประเภทกองทุน 3 ตัวเลือก */}
          <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs font-semibold">
            {[
              { key: 'all', label: 'ทั้งหมด' },
              { key: 'welfare', label: 'สวัสดิการทั่วไป' },
              { key: 'disaster', label: 'ภัยพิบัติ' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setLogTypeTab(tab.key as 'all' | 'welfare' | 'disaster')
                }
                className={`rounded-full px-3.5 py-1 transition ${
                  logTypeTab === tab.key
                    ? 'bg-white text-blue-600 shadow-2xs' // ไฮไลต์พื้นขาวตัวหนังสือน้ำเงินเมื่อถูกเลือก
                    : 'text-slate-600 hover:text-slate-900' // สีเทาปกติเมื่อไม่ได้เลือก
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. ตารางแสดงข้อมูลประวัติย้อนหลัง (รองรับการเลื่อนแนวนอนบนหน้าจอมือถือด้วย overflow-x-auto) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* หัวตาราง 7 คอลัมน์ */}
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
              <th className="py-3 pr-3">วันที่</th>
              <th className="py-3 px-3">เลขที่</th>
              <th className="py-3 px-3">พนักงาน</th>
              <th className="py-3 px-3">แบบฟอร์ม</th>
              <th className="py-3 px-3">HR เสนอ</th>
              <th className="py-3 px-3">อนุมัติ</th>
              <th className="py-3 pl-3 text-right">ผล</th>
            </tr>
          </thead>

          {/* เนื้อหาตารางแต่ละแถว */}
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.map((log) => {
              // เช็กว่าเคสนี้ได้รับการอนุมัติแบบ "ปรับลดวงเงินลงจากที่ HR เสนอ" หรือไม่
              const isReduced =
                log.status === 'approved' &&
                log.approvedAmount < log.proposedAmount;

              return (
                // แถวรายการ (คลิกได้ทั้งแถวเพื่อเปิด Modal ดูรายละเอียดประวัติ และไฮไลต์พื้นหลังสีฟ้าอ่อนถ้ามีการปรับลดวงเงิน)
                <tr
                  key={log.id}
                  onClick={() => onSelectLog(log)}
                  className={`cursor-pointer transition ${
                    isReduced ? 'bg-blue-50/40' : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* คอลัมน์ที่ 1: วันที่ดำเนินการ (ตัดเอาเฉพาะส่วนวันที่ก่อนเครื่องหมาย •) */}
                  <td className="py-3.5 pr-3 text-slate-500 whitespace-nowrap">
                    {log.actionDate.split('•')[0].trim()}
                  </td>
                  {/* คอลัมน์ที่ 2: เลขที่คำขอ */}
                  <td className="py-3.5 px-3 font-bold text-blue-600">
                    {log.requestId}
                  </td>
                  {/* คอลัมน์ที่ 3: ชื่อ-นามสกุลพนักงาน */}
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    {log.employeeName}
                  </td>
                  {/* คอลัมน์ที่ 4: ป้ายประเภทกองทุน + หมวดหมู่คำขอ */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`mr-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        log.type === 'disaster'
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {log.type === 'disaster' ? 'ภัยพิบัติ' : 'สวัสดิการทั่วไป'}
                    </span>
                    <span className="text-slate-700 font-medium">
                      {log.category}
                    </span>
                  </td>
                  {/* คอลัมน์ที่ 5: ยอดเงินที่ HR เสนอ (ถ้าปฏิเสธให้แสดงขีด —) */}
                  <td className="py-3.5 px-3 text-slate-600">
                    {log.status === 'rejected'
                      ? '—'
                      : `฿${log.proposedAmount.toLocaleString()}`}
                  </td>
                  {/* คอลัมน์ที่ 6: ยอดเงินที่อนุมัติจริง (ถ้าปฏิเสธให้แสดงขีด —) */}
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    {log.status === 'rejected'
                      ? '—'
                      : `฿${log.approvedAmount.toLocaleString()}`}
                  </td>
                  {/* คอลัมน์ที่ 7: ป้ายสถานะผลการพิจารณา (อนุมัติ / อนุมัติ* / ไม่อนุมัติ / ส่งคืน HR) */}
                  <td className="py-3.5 pl-3 text-right">
                    {log.status === 'approved' && (
                      <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
                        {isReduced ? 'อนุมัติ*' : 'อนุมัติ'}
                      </span>
                    )}
                    {log.status === 'rejected' && (
                      <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-600">
                        ไม่อนุมัติ
                      </span>
                    )}
                    {log.status === 'returned' && (
                      <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                        ส่งคืน HR
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. หมายเหตุด้านล่างตาราง อธิบายสัญลักษณ์ดอกจัน (*) */}
      <p className="mt-4 text-[11px] text-slate-400">
        * ปรับลดจาก HR เสนอ เพราะเหลือสิทธิ์เกินเพดานพอดี ฿10,000
      </p>
    </div>
  );
};