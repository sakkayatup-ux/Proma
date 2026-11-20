import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { ApprovalRequest } from '@/types'; // นำเข้าโครงสร้างข้อมูลคำขอเบิกเงิน

// กำหนดโครงสร้างข้อมูล (Props) ที่หน้าต่างแจ้งเตือน "ยอดเกินสิทธิ์" ต้องรับเข้ามา
interface OverLimitModalProps {
  isOpen: boolean; // สถานะเปิด/ปิดหน้าต่าง Modal (true = แสดง, false = ซ่อน)
  request: ApprovalRequest | null; // ข้อมูลคำขอที่กำลังพิจารณา
  requestedAmount: number; // ยอดเงินที่ผู้บริหารกรอกเพื่อจะอนุมัติ (ซึ่งเกินสิทธิ์)
  remainingQuota: number; // ยอดสิทธิ์คงเหลือรายบุคคลของพนักงานคนนี้
  remainingPool: number; // งบประมาณรวมของกองทุนที่เหลืออยู่
  onReturnToHR: () => void; // ฟังก์ชันเมื่อกดปุ่ม "ส่งคืน" กลับไปให้ HR แก้ไขยอด
  onApproveWithinLimit: (maxAllowedAmount: number) => void; // ฟังก์ชันเมื่อกดปุ่ม "ใช้ยอดสูงสุด" เพื่อปรับยอดลงมาเท่าที่สิทธิ์เหลือ
  onClose: () => void; // ฟังก์ชันสำหรับปิดหน้าต่าง Modal
}

export const OverLimitModal: React.FC<OverLimitModalProps> = ({
  isOpen,
  request,
  requestedAmount,
  remainingQuota,
  remainingPool,
  onReturnToHR,
  onApproveWithinLimit,
  onClose,
}) => {
  // ถ้า Modal ไม่ได้ถูกสั่งเปิด หรือไม่มีข้อมูลคำขอ ให้ไม่ต้องแสดงผลอะไรเลย
  if (!isOpen || !request) return null;

  // ตรวจสอบว่างบประมาณรวมของกองทุนยังมีเงินพอจ่ายสำหรับยอดที่ขอหรือไม่
  const isPoolEnough = remainingPool >= requestedAmount;

  return (
    // ฉากหลังสีดำโปร่งแสงแบบเบลอ ครอบเต็มหน้าจอและจัดกล่อง Modal ให้อยู่กึ่งกลาง
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      {/* กล่องเนื้อหา Modal สีขาว ขอบมน ใส่เงา */}
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-slate-100">
        {/* 1. ส่วนหัวของ Modal: ไอคอนตกใจสีแดง + ข้อความแจ้งเตือน + ปุ่มปิดมุมขวาบน */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3.5">
            {/* วงกลมสีแดงแสดงสัญลักษณ์แจ้งเตือน (!) */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-600 text-xl font-bold text-white shadow-sm">
              !
            </div>
            {/* หัวข้อแจ้งเหตุผลที่อนุมัติไม่ได้ */}
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                อนุมัติไม่ได้: ยอดเกินสิทธิ์
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ระบบล็อกอัตโนมัติเพื่อไม่ให้เกินวงเงินที่บริษัทจัดสรร
              </p>
            </div>
          </div>

          {/* ปุ่มกากบาท (✕) สำหรับปิดหน้าต่าง */}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none px-1"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>

        {/* 2. กล่องแสดงตัวเลขยอดเงินที่ขออนุมัติในกรอบสีแดง พร้อมระบุยอดสิทธิ์ที่เหลือจริง */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            จำนวนเงินที่อนุมัติ
          </label>
          <div className="rounded-2xl border-2 border-rose-400 bg-white px-5 py-3.5 text-2xl font-bold text-rose-600">
            ฿{requestedAmount.toLocaleString()}
          </div>
          <p className="mt-2 text-xs font-bold text-rose-600">
            เกินเพดานสิทธิ์ของพนักงานที่เหลือ ฿{remainingQuota.toLocaleString()}
          </p>
        </div>

        {/* 3. กล่องสรุปรายละเอียดงบกองทุนเทียบกับสิทธิ์คงเหลือรายบุคคล (พื้นหลังสีชมพูอ่อน) */}
        <div className="rounded-2xl bg-rose-50/70 p-4 space-y-2.5 mb-6 text-xs">
          {/* แถวที่ 1: เช็กงบกองทุนส่วนกลางว่ามีพอหรือไม่ */}
          <div className="flex justify-between">
            <span className="font-semibold text-slate-600">งบรอบนี้คงเหลือ</span>
            <span
              className={`font-bold ${
                isPoolEnough ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              ฿{remainingPool.toLocaleString()} ({isPoolEnough ? 'พอ' : 'ไม่พอ'})
            </span>
          </div>
          {/* แถวที่ 2: แสดงสิทธิ์คงเหลือของพนักงานคนนี้ (ระบุว่าไม่พอ) */}
          <div className="flex justify-between">
            <span className="font-semibold text-slate-600">สิทธิ์พนักงานคงเหลือ</span>
            <span className="font-bold text-rose-600">
              ฿{remainingQuota.toLocaleString()} (ไม่พอ)
            </span>
          </div>
          {/* แถวที่ 3: สรุปยอดเพดานสูงสุดที่ระบบอนุญาตให้จ่ายได้ */}
          <div className="border-t border-rose-200/60 pt-2.5 flex justify-between">
            <span className="font-semibold text-slate-600">ยอดสูงสุดที่อนุมัติได้</span>
            <span className="font-bold text-slate-900">
              ฿{remainingQuota.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 4. ปุ่มทางเลือกแก้ไขปัญหา 2 ปุ่มด้านล่าง */}
        <div className="grid grid-cols-2 gap-3">
          {/* ปุ่มซ้าย: ส่งเรื่องกลับไปให้ HR ปรับแก้ตัวเลขคำขอ */}
          <button
            type="button"
            onClick={onReturnToHR}
            className="rounded-full border border-slate-200 bg-white py-3 text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
          >
            ส่งคืน
          </button>
          {/* ปุ่มขวา: ปรับยอดอนุมัติลงมาเท่ากับยอดสูงสุดที่สิทธิ์เหลือทันที (ปุ่มกดไม่ได้ถ้าสิทธิ์เหลือ 0) */}
          <button
            type="button"
            disabled={remainingQuota <= 0}
            onClick={() => onApproveWithinLimit(remainingQuota)}
            className="rounded-full bg-orange-600 py-3 text-xs font-bold text-white hover:bg-orange-700 disabled:bg-slate-300 transition shadow-sm"
          >
            ใช้ยอดสูงสุด ฿{remainingQuota.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
};