import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { BudgetConfig } from '@/types'; // นำเข้าโครงสร้างข้อมูลการตั้งค่างบประมาณหลัก

// กำหนดโครงสร้างข้อมูล (Props) ที่แถบแสดงสัดส่วนงบประมาณต้องรับมาจาก DashboardModule
interface BudgetProgressBarProps {
  budgetConfig: BudgetConfig; // วงเงินตั้งต้นทั้งปีของแต่ละกองทุน
  usedDisaster: number; // ยอดเงินกองทุนภัยพิบัติที่อนุมัติจ่ายไปแล้ว
  pendingDisaster: number; // ยอดเงินกองทุนภัยพิบัติที่กำลังรออนุมัติ
  usedWelfare: number; // ยอดเงินกองทุนสวัสดิการทั่วไปที่อนุมัติจ่ายไปแล้ว
  pendingWelfare: number; // ยอดเงินกองทุนสวัสดิการทั่วไปที่กำลังรออนุมัติ
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  budgetConfig,
  usedDisaster,
  pendingDisaster,
  usedWelfare,
  pendingWelfare,
}) => {
  // 1. คำนวณงบคงเหลือสุทธิ และเปอร์เซ็นต์ของแถบสีสำหรับกองทุน "ช่วยเหลือภัยพิบัติ"
  const disasterRemain = Math.max(
    0,
    budgetConfig.disasterPool - usedDisaster - pendingDisaster
  ); // หักทั้งยอดที่อนุมัติแล้วและยอดที่รออนุมัติออก เพื่อดูงบว่างสุทธิที่เหลือจริง
  const disasterUsedPct =
    budgetConfig.disasterPool > 0
      ? Math.min(100, (usedDisaster / budgetConfig.disasterPool) * 100)
      : 0; // เปอร์เซ็นต์ส่วนที่อนุมัติแล้ว (จำกัดสูงสุด 100%)
  const disasterPendingPct =
    budgetConfig.disasterPool > 0
      ? Math.min(
          100 - disasterUsedPct,
          (pendingDisaster / budgetConfig.disasterPool) * 100
        )
      : 0; // เปอร์เซ็นต์ส่วนที่รออนุมัติ (จำกัดไม่ให้บวกกับส่วนแรกแล้วเกิน 100%)

  // 2. คำนวณงบคงเหลือสุทธิ และเปอร์เซ็นต์ของแถบสีสำหรับกองทุน "สวัสดิการทั่วไป"
  const welfareRemain = Math.max(
    0,
    budgetConfig.welfarePool - usedWelfare - pendingWelfare
  );
  const welfareUsedPct =
    budgetConfig.welfarePool > 0
      ? Math.min(100, (usedWelfare / budgetConfig.welfarePool) * 100)
      : 0;
  const welfarePendingPct =
    budgetConfig.welfarePool > 0
      ? Math.min(
          100 - welfareUsedPct,
          (pendingWelfare / budgetConfig.welfarePool) * 100
        )
      : 0;

  return (
    // ตารางแบ่ง 2 คอลัมน์เท่ากันบนจอใหญ่ (ซ้าย: กองทุนภัยพิบัติ, ขวา: กองทุนสวัสดิการทั่วไป)
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* การ์ดฝั่งซ้าย: งบประมาณช่วยเหลือภัยพิบัติ */}
      <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
        {/* ส่วนหัวการ์ด: ชื่อกองทุน + ป้ายแสดงวงเงินตั้งต้นทั้งปี (Budget Pool) */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              งบประมาณ: ช่วยเหลือภัยพิบัติ
            </h3>
            <p className="text-xs text-slate-400">
              ป้องกันการอนุมัติเกินวงเงินที่จัดสรร
            </p>
          </div>
          <span className="rounded-full bg-orange-50 px-3.5 py-1 text-xs font-semibold text-orange-700">
            Budget Pool ฿{budgetConfig.disasterPool.toLocaleString()}
          </span>
        </div>

        {/* หลอด Progress Bar แบบต่อกัน 3 สี (เขียว = อนุมัติแล้ว, เหลือง = รออนุมัติ, พื้นเทา = คงเหลือ) */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 flex">
          <div
            style={{ width: `${disasterUsedPct}%` }}
            className="bg-emerald-600 transition-all duration-300"
          />
          <div
            style={{ width: `${disasterPendingPct}%` }}
            className="bg-amber-500 transition-all duration-300"
          />
        </div>

        {/* คำอธิบายสัญลักษณ์สี (Legend) พร้อมตัวเลขยอดเงินทั้ง 3 สถานะ */}
        <div className="mt-4 flex flex-wrap gap-5 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <span className="text-slate-700">
              อนุมัติแล้ว ฿{usedDisaster.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-700">
              รออนุมัติ ฿{pendingDisaster.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="text-slate-700">
              งบคงเหลือ ฿{disasterRemain.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* การ์ดฝั่งขวา: งบประมาณสวัสดิการทั่วไป */}
      <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
        {/* ส่วนหัวการ์ด: ชื่อกองทุน + ป้ายแสดงวงเงินตั้งต้นทั้งปี (Budget Pool) */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              งบประมาณ: สวัสดิการทั่วไป
            </h3>
            <p className="text-xs text-slate-400">
              ค่ารักษาพยาบาลตนเองและครอบครัว (OPD / IPD)
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700">
            Budget Pool ฿{budgetConfig.welfarePool.toLocaleString()}
          </span>
        </div>

        {/* หลอด Progress Bar แบบต่อกัน 3 สี (น้ำเงิน = อนุมัติแล้ว, เหลือง = รออนุมัติ, พื้นเทา = คงเหลือ) */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 flex">
          <div
            style={{ width: `${welfareUsedPct}%` }}
            className="bg-blue-600 transition-all duration-300"
          />
          {welfarePendingPct > 0 && (
            <div
              style={{ width: `${welfarePendingPct}%` }}
              className="bg-amber-500 transition-all duration-300"
            />
          )}
        </div>

        {/* คำอธิบายสัญลักษณ์สี (Legend) พร้อมตัวเลขยอดเงินทั้ง 3 สถานะ */}
        <div className="mt-4 flex flex-wrap gap-5 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span className="text-slate-700">
              อนุมัติแล้ว ฿{usedWelfare.toLocaleString()}
            </span>
          </div>
          {pendingWelfare > 0 && (
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-700">
                รออนุมัติ ฿{pendingWelfare.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="text-slate-700">
              งบคงเหลือ ฿{welfareRemain.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};