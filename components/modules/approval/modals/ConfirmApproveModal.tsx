import React, { useState } from 'react'; // นำเข้า React และ useState สำหรับเก็บสถานะ Checkbox
import { ApprovalRequest } from '@/types'; // นำเข้าโครงสร้างข้อมูลคำขอเบิกเงิน

// กำหนดโครงสร้างข้อมูล (Props) ที่ Modal ยืนยันการอนุมัติต้องรับเข้ามา
interface ConfirmApproveModalProps {
  isOpen: boolean; // สถานะเปิด/ปิดหน้าต่าง Modal (true = แสดง, false = ซ่อน)
  request: ApprovalRequest | null; // ข้อมูลคำขอที่กำลังจะกดอนุมัติ
  approveAmount: number; // ยอดเงินที่ผู้บริหารเคาะอนุมัติจริง
  remainingBudget: number; // งบประมาณคงเหลือของกองทุนนี้ก่อนอนุมัติ
  usedThisYear: number; // ยอดเงินที่พนักงานคนนี้เบิกไปแล้วในปีนี้
  annualCap: number; // เพดานสิทธิ์สูงสุดต่อคนต่อปี
  onConfirm: () => void; // ฟังก์ชันทำงานเมื่อกดปุ่ม "ยืนยันอนุมัติ"
  onCancel: () => void; // ฟังก์ชันทำงานเมื่อกดปุ่ม "ยกเลิก" หรือ "✕"
}

export const ConfirmApproveModal: React.FC<ConfirmApproveModalProps> = ({
  isOpen,
  request,
  approveAmount,
  remainingBudget,
  usedThisYear,
  annualCap,
  onConfirm,
  onCancel,
}) => {
  // เก็บสถานะการติ๊กเลือก "ส่งเข้าระบบจ่ายเงิน และแจ้งเตือนพนักงาน + HR" (ค่าเริ่มต้นเป็นติ๊กถูก)
  const [notifySystem, setNotifySystem] = useState(true);

  // ถ้า Modal ไม่ได้ถูกสั่งเปิด หรือไม่มีข้อมูลคำขอ ให้ไม่ต้องแสดงผลอะไรเลย (คืนค่า null)
  if (!isOpen || !request) return null;

  // คำนวณงบประมาณกองทุนที่จะเหลืออยู่หลังจากหักยอดอนุมัติรอบนี้ (ป้องกันติดลบด้วย Math.max)
  const afterApproveBudget = Math.max(0, remainingBudget - approveAmount);
  // คำนวณยอดเงินสะสมทั้งหมดที่พนักงานคนนี้จะได้รับในปีนี้ (ยอดเก่า + ยอดอนุมัติใหม่)
  const totalReceivedThisYear = usedThisYear + approveAmount;

  return (
    // ฉากหลังสีดำโปร่งแสงแบบเบลอ ครอบเต็มหน้าจอและจัดกล่อง Modal ให้อยู่กึ่งกลาง
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      {/* กล่องเนื้อหา Modal สีขาว ขอบมน ใส่เงา */}
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-slate-100">
        {/* 1. ส่วนหัวของ Modal: ไอคอนติ๊กถูกสีเขียว + หัวข้อ + ปุ่มปิดมุมขวาบน */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3.5">
            {/* วงกลมสีเขียวแสดงสัญลักษณ์ยืนยัน */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white shadow-sm">
              ✓
            </div>
            {/* ข้อความแจ้งยอดที่จะอนุมัติ พร้อมรหัสคำขอ ชื่อพนักงาน และรอบภัยพิบัติ */}
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                ยืนยันอนุมัติวงเงิน ฿{approveAmount.toLocaleString()}?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {request.id} • {request.employeeName} • {request.roundTitle}
              </p>
            </div>
          </div>

          {/* ปุ่มกากบาท (✕) สำหรับปิดหน้าต่าง */}
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none px-1"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>

        {/* 2. กล่องสรุปตัวเลขเปรียบเทียบ 4 แถว ก่อนกดยืนยัน */}
        <div className="rounded-2xl bg-slate-50/80 p-4 space-y-2.5 mb-4 border border-slate-100 text-xs">
          {/* แถวที่ 1: ยอดเงินที่ HR เสนอมาในตอนแรก */}
          <div className="flex justify-between">
            <span className="text-slate-500">HR เสนอ</span>
            <span className="font-bold text-slate-900">
              ฿{request.proposedAmount.toLocaleString()}
            </span>
          </div>
          {/* แถวที่ 2: ยอดเงินจริงที่ผู้บริหารกำลังจะอนุมัติ */}
          <div className="flex justify-between">
            <span className="text-slate-500">ผู้บริหารอนุมัติ</span>
            <span className="font-bold text-slate-900">
              ฿{approveAmount.toLocaleString()}
            </span>
          </div>
          {/* แถวที่ 3: ยอดเงินกองทุนที่เหลืออยู่หลังหักรายการนี้ */}
          <div className="flex justify-between">
            <span className="text-slate-500">งบรอบนี้หลังอนุมัติ</span>
            <span className="font-bold text-emerald-600">
              ฿{afterApproveBudget.toLocaleString()} คงเหลือ
            </span>
          </div>
          {/* แถวที่ 4: ยอดใช้สิทธิ์สะสมของพนักงานเทียบกับเพดานต่อปี */}
          <div className="flex justify-between">
            <span className="text-slate-500">สิทธิ์พนักงานปีนี้</span>
            <span className="font-bold text-slate-900">
              ได้รับรวม ฿{totalReceivedThisYear.toLocaleString()} / เพดาน ฿
              {annualCap.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 3. Checkbox ตัวเลือกการแจ้งเตือนและส่งต่อระบบจ่ายเงิน */}
        <label className="flex items-center gap-2.5 mb-6 cursor-pointer select-none text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={notifySystem}
            onChange={(e) => setNotifySystem(e.target.checked)}
            className="h-4 w-4 rounded accent-orange-600"
          />
          <span>ส่งเข้าระบบจ่ายเงิน และแจ้งเตือนพนักงาน + HR</span>
        </label>

        {/* 4. ปุ่มดำเนินการคู่ด้านล่าง (ยกเลิก / ยืนยันอนุมัติ) */}
        <div className="grid grid-cols-2 gap-3">
          {/* ปุ่มยกเลิก: ปิด Modal กลับไปหน้าเดิม */}
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            ยกเลิก
          </button>
          {/* ปุ่มยืนยันอนุมัติ: บันทึกผลอนุมัติและตัดงบประมาณจริง */}
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
          >
            ยืนยันอนุมัติ
          </button>
        </div>
      </div>
    </div>
  );
};