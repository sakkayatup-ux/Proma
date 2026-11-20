import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { BudgetConfig } from '@/types'; // นำเข้าโครงสร้างข้อมูลการตั้งค่างบประมาณหลัก

// กำหนดโครงสร้างข้อมูล (Props) ที่การ์ดแสดงงบประมาณ 2 กองทุนต้องรับมาจาก BudgetModule
interface BudgetCardsProps {
  budgetConfig: BudgetConfig; // การตั้งค่างบประมาณรวมและเพดานต่อคนต่อปี
  usedWelfare: number; // ยอดเงินกองทุนสวัสดิการทั่วไปที่อนุมัติจ่ายไปแล้ว
  pendingWelfare: number; // ยอดเงินกองทุนสวัสดิการทั่วไปที่รออนุมัติ (รับเผื่อไว้แสดงเพิ่มเติม)
  usedDisaster: number; // ยอดเงินกองทุนภัยพิบัติที่อนุมัติจ่ายไปแล้ว
  pendingDisaster: number; // ยอดเงินกองทุนภัยพิบัติที่รออนุมัติ (รับเผื่อไว้แสดงเพิ่มเติม)
  onOpenWelfareModal: () => void; // ฟังก์ชันเปิด Modal ตั้งงบสวัสดิการทั่วไป
  onOpenDisasterModal: () => void; // ฟังก์ชันเปิด Modal ตั้งงบภัยพิบัติ
}

export const BudgetCards: React.FC<BudgetCardsProps> = ({
  budgetConfig,
  usedWelfare,
  usedDisaster,
  onOpenWelfareModal,
  onOpenDisasterModal,
}) => {
  // 1. คำนวณยอดคงเหลือและเปอร์เซ็นต์ที่ใช้ไปของกองทุน "สวัสดิการทั่วไป"
  const welfareRemain = Math.max(0, budgetConfig.welfarePool - usedWelfare);
  const welfarePct =
    budgetConfig.welfarePool > 0
      ? Math.round((usedWelfare / budgetConfig.welfarePool) * 100)
      : 0;

  // 2. คำนวณยอดคงเหลือและเปอร์เซ็นต์ที่ใช้ไปของกองทุน "ช่วยเหลือภัยพิบัติ"
  const disasterRemain = Math.max(0, budgetConfig.disasterPool - usedDisaster);
  const disasterPct =
    budgetConfig.disasterPool > 0
      ? Math.round((usedDisaster / budgetConfig.disasterPool) * 100)
      : 0;

  return (
    // ตารางแบ่ง 2 คอลัมน์เท่ากันบนจอใหญ่ (ซ้าย: สวัสดิการทั่วไป, ขวา: ช่วยเหลือภัยพิบัติ)
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* การ์ดฝั่งซ้าย: กองทุนสวัสดิการทั่วไป (โทนสีน้ำเงิน) */}
      <div className="rounded-3xl bg-white p-7 shadow-xs border border-slate-100 flex flex-col justify-between">
        <div>
          {/* ส่วนหัวการ์ด: ชื่อกองทุน + ยอดงบรวม + ยอดใช้ไป */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                สวัสดิการทั่วไป
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ค่ารักษาพยาบาลตนเองและครอบครัว
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900">
                ฿{budgetConfig.welfarePool.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ใช้ไป ฿{usedWelfare.toLocaleString()}
              </p>
            </div>
          </div>

          {/* หลอด Progress Bar แสดงสัดส่วนงบที่ใช้ไป (จำกัดความกว้างสูงสุดไม่เกิน 100%) */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 mb-2">
            <div
              style={{ width: `${Math.min(100, welfarePct)}%` }}
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
            />
          </div>

          {/* แถวสรุปเปอร์เซ็นต์ที่ใช้ไปเทียบกับยอดเงินคงเหลือ */}
          <div className="flex justify-between text-xs font-semibold mb-5">
            <span className="text-slate-500">ใช้ไป {welfarePct}%</span>
            <span className="text-emerald-600">
              คงเหลือ ฿{welfareRemain.toLocaleString()}
            </span>
          </div>

          {/* รายละเอียดเกณฑ์การเบิกสวัสดิการ 4 บรรทัด */}
          <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">ค่ารักษาตนเอง</span>
              <span className="font-bold text-slate-900">
                ฿1,000 / ครั้ง • 30 ครั้ง / ปี
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ครอบครัว ผู้ป่วยนอก (OPD)</span>
              <span className="font-bold text-slate-900">฿2,000 / ครั้ง</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ครอบครัว ผู้ป่วยใน (IPD)</span>
              <span className="font-bold text-slate-900">฿20,000 / ครั้ง</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">เพดานครอบครัวรวม</span>
              <span className="font-bold text-slate-900">
                ฿30,000 / คน / ปี
              </span>
            </div>
          </div>
        </div>

        {/* ปุ่มเปิด Modal ตั้งงบสวัสดิการทั่วไป */}
        <button
          type="button"
          onClick={onOpenWelfareModal}
          className="mt-6 w-full rounded-full bg-blue-600 py-3.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
        >
          ตั้งงบสวัสดิการทั่วไป
        </button>
      </div>

      {/* การ์ดฝั่งขวา: กองทุนช่วยเหลือภัยพิบัติ (โทนสีส้ม) */}
      <div className="rounded-3xl bg-white p-7 shadow-xs border border-slate-100 flex flex-col justify-between">
        <div>
          {/* ส่วนหัวการ์ด: ชื่อกองทุน + ยอดงบรวม + ยอดใช้ไป */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                ช่วยเหลือภัยพิบัติ
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                กองทุนสำรองฉุกเฉินแยกตามประเภทภัย
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900">
                ฿{budgetConfig.disasterPool.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ใช้ไป ฿{usedDisaster.toLocaleString()}
              </p>
            </div>
          </div>

          {/* หลอด Progress Bar แสดงสัดส่วนงบที่ใช้ไป */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 mb-2">
            <div
              style={{ width: `${Math.min(100, disasterPct)}%` }}
              className="h-full rounded-full bg-orange-600 transition-all duration-300"
            />
          </div>

          {/* แถวสรุปเปอร์เซ็นต์ที่ใช้ไปเทียบกับยอดเงินคงเหลือ */}
          <div className="flex justify-between text-xs font-semibold mb-5">
            <span className="text-slate-500">ใช้ไป {disasterPct}%</span>
            <span className="text-emerald-600">
              คงเหลือ ฿{disasterRemain.toLocaleString()}
            </span>
          </div>

          {/* รายละเอียดการจัดสรรตามประเภทภัยและเกณฑ์ระดับความเสียหาย 4 บรรทัด */}
          <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">อุทกภัย รอบ 2/2569</span>
              <span className="font-bold text-slate-900">฿500,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ไฟป่า รอบ 1/2569</span>
              <span className="font-bold text-slate-900">฿300,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ระดับ 1 / ระดับ 2 / ระดับ 3</span>
              <span className="font-bold text-slate-900">
                ฿5,000 / ฿10,000 / ฿15,000
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">เพดานต่อคนต่อปี</span>
              <span className="font-bold text-slate-900">
                ฿{budgetConfig.disasterAnnualCap.toLocaleString()} / ปี
              </span>
            </div>
          </div>
        </div>

        {/* ปุ่มเปิด Modal ตั้งงบภัยพิบัติ */}
        <button
          type="button"
          onClick={onOpenDisasterModal}
          className="mt-6 w-full rounded-full bg-orange-600 py-3.5 text-xs font-bold text-white hover:bg-orange-700 transition shadow-xs"
        >
          ตั้งงบภัยพิบัติ
        </button>
      </div>
    </div>
  );
};