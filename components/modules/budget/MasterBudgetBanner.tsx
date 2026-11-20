import React, { useState } from 'react'; // นำเข้า React และ useState สำหรับเก็บปีงบประมาณที่เลือกดู
import { BudgetConfig } from '@/types'; // นำเข้าโครงสร้างข้อมูลการตั้งค่างบประมาณหลัก

// กำหนดโครงสร้างข้อมูล (Props) ที่แบนเนอร์สรุปงบประมาณรวมต้องรับมาจาก BudgetModule
interface MasterBudgetBannerProps {
  budgetConfig: BudgetConfig; // การตั้งค่าวงเงินรวมทั้งปีและปีงบประมาณปัจจุบัน
  usedDisaster: number; // ยอดเงินกองทุนภัยพิบัติที่อนุมัติจ่ายไปแล้ว
  usedWelfare: number; // ยอดเงินกองทุนสวัสดิการทั่วไปที่อนุมัติจ่ายไปแล้ว
  pendingDisaster: number; // ยอดเงินกองทุนภัยพิบัติที่รออนุมัติ (รับเผื่อไว้คำนวณเพิ่มเติม)
  pendingWelfare: number; // ยอดเงินกองทุนสวัสดิการทั่วไปที่รออนุมัติ (รับเผื่อไว้คำนวณเพิ่มเติม)
}

export const MasterBudgetBanner: React.FC<MasterBudgetBannerProps> = ({
  budgetConfig,
  usedDisaster,
  usedWelfare,
}) => {
  // เก็บปีงบประมาณที่เลือกจาก Dropdown มุมขวาบน (ตั้งต้นตามปีงบประมาณในระบบ)
  const [selectedYear, setSelectedYear] = useState(budgetConfig.fiscalYear);

  // 1. คำนวณงบประมาณรวมทั้ง 2 กองทุน (ภัยพิบัติ + สวัสดิการทั่วไป)
  const totalPool = budgetConfig.disasterPool + budgetConfig.welfarePool;
  // 2. คำนวณยอดเงินที่อนุมัติใช้ไปแล้วทั้งหมด
  const totalUsed = usedDisaster + usedWelfare;
  // 3. คำนวณงบประมาณคงเหลือสุทธิทั้งปี (ป้องกันติดลบ)
  const totalRemaining = Math.max(0, totalPool - totalUsed);
  // 4. คำนวณเปอร์เซ็นต์การใช้งบประมาณเทียบกับงบรวมทั้งปี
  const usedPercent = totalPool > 0 ? Math.round((totalUsed / totalPool) * 100) : 0;

  return (
    // กล่องครอบหลัก จัดเรียงแถบเลือกปีด้านบนและการ์ดสรุป 4 ใบด้านล่างแนวตั้ง
    <div className="space-y-4">
      {/* 1. แถบตัวเลือกปีงบประมาณชิดมุมขวาบน */}
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs shadow-2xs">
          <span className="text-slate-400 font-medium">ปีงบประมาณ:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="2569">ปี 2569</option>
            <option value="2568">ปี 2568</option>
          </select>
        </div>
      </div>

      {/* 2. ตารางแสดงการ์ดสรุปตัวเลขงบประมาณรวม 4 ใบ (1 คอลัมน์บนมือถือ, 2 บนแท็บเล็ต, 4 บนจอใหญ่) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* การ์ดใบที่ 1: ยอดงบประมาณรวมทั้งหมดประจำปี */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
          <p className="text-xs font-medium text-slate-500">
            งบรวมทั้งปี {selectedYear}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            ฿{totalPool.toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs font-semibold text-blue-600">
            ตั้งโดยผู้บริหาร
          </p>
        </div>

        {/* การ์ดใบที่ 2: ยอดงบประมาณที่จัดสรรแบ่งให้ 2 กองทุนแล้ว */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
          <p className="text-xs font-medium text-slate-500">จัดสรรแล้ว</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            ฿{totalPool.toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs font-medium text-slate-400">
            สวัสดิการ + ภัยพิบัติ
          </p>
        </div>

        {/* การ์ดใบที่ 3: ยอดเงินที่เบิกใช้ไปแล้วจริง + คิดเป็นกี่เปอร์เซ็นต์ */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
          <p className="text-xs font-medium text-slate-500">ใช้ไปทั้งหมด</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            ฿{totalUsed.toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs font-semibold text-amber-600">
            {usedPercent}% ของงบทั้งปี
          </p>
        </div>

        {/* การ์ดใบที่ 4: งบประมาณคงเหลือรวมทั้งหมดที่ยังเบิกจ่ายได้ */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
          <p className="text-xs font-medium text-slate-500">งบคงเหลือรวม</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            ฿{totalRemaining.toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs font-semibold text-emerald-600">
            ใช้ได้ถึง ธ.ค. {selectedYear}
          </p>
        </div>
      </div>
    </div>
  );
};