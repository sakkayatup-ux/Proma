import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { BudgetHistoryItem } from '@/types'; // นำเข้าโครงสร้างข้อมูลประวัติการปรับปรุงงบประมาณ

// กำหนดโครงสร้างข้อมูล (Props) ที่ตารางประวัติการปรับงบประมาณต้องรับมาจาก BudgetModule
interface BudgetHistoryTableProps {
  history: BudgetHistoryItem[]; // รายการประวัติการปรับเปลี่ยนงบประมาณทั้งหมดในระบบ
}

export const BudgetHistoryTable: React.FC<BudgetHistoryTableProps> = ({
  history,
}) => {
  return (
    // กล่องการ์ดสีขาว ขอบมน ครอบตารางประวัติการปรับงบประมาณทั้งหมด
    <div className="rounded-3xl bg-white p-7 shadow-xs border border-slate-100">
      {/* 1. ส่วนหัวการ์ด: ชื่อหัวข้อและคำอธิบาย */}
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-900">
          ประวัติการปรับงบประมาณ
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          บันทึกวัน/เดือน/ปี และรายละเอียดการแก้ไขวงเงินและเกณฑ์การจ่ายทั้งหมด
        </p>
      </div>

      {/* 2. ตารางแสดงประวัติการปรับงบ (รองรับการเลื่อนแนวนอนบนหน้าจอมือถือด้วย overflow-x-auto) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* หัวตาราง 4 คอลัมน์ */}
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
              <th className="py-3 pr-4">วัน / เดือน / ปี</th>
              <th className="py-3 px-4">รายการและรายละเอียดที่ปรับ</th>
              <th className="py-3 px-4 text-right">วงเงินสุทธิ</th>
              <th className="py-3 pl-4 text-right">ผู้อนุมัติ</th>
            </tr>
          </thead>

          {/* เนื้อหาตารางแต่ละแถว */}
          <tbody className="divide-y divide-slate-100 text-xs">
            {history.map((item) => {
              // แยกข้อความเหตุผล/รายละเอียดย่อยที่คั่นด้วยเครื่องหมาย '|' ออกเป็นป้าย Tag ย่อยๆ
              const tags = item.reason.split('|').map((t) => t.trim());

              return (
                // แถวรายการประวัติแต่ละรายการ (จัดข้อความชิดด้านบนสุดของแถวด้วย align-top)
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  {/* คอลัมน์ที่ 1: วันที่ดำเนินการปรับงบ */}
                  <td className="py-4 pr-4 text-slate-600 whitespace-nowrap align-top">
                    {item.date}
                  </td>

                  {/* คอลัมน์ที่ 2: ชื่อกองทุนที่ปรับ + ป้าย Tag แสดงรายละเอียดเกณฑ์ที่ตั้งค่า */}
                  <td className="py-4 px-4 align-top">
                    <p className="font-bold text-slate-900">{item.fundName}</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          • {tag}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* คอลัมน์ที่ 3: สรุปวงเงินสุทธิใหม่ที่ตั้งค่า */}
                  <td className="py-4 px-4 text-right font-bold text-slate-900 whitespace-nowrap align-top">
                    {item.changeSummary}
                  </td>

                  {/* คอลัมน์ที่ 4: ชื่อผู้บริหารที่อนุมัติการปรับงบ */}
                  <td className="py-4 pl-4 text-right font-semibold text-slate-700 whitespace-nowrap align-top">
                    {item.updatedBy}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};