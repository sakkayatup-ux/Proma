import React, { useState } from 'react'; // นำเข้า React และ useState สำหรับเก็บค่าฟอร์มเหตุผล
import { ApprovalRequest } from '@/types'; // นำเข้าโครงสร้างข้อมูลคำขอเบิกเงิน

// กำหนดโครงสร้างข้อมูล (Props) ที่หน้าต่าง "ไม่อนุมัติคำขอ" ต้องรับเข้ามา
interface RejectModalProps {
  isOpen: boolean; // สถานะเปิด/ปิดหน้าต่าง Modal (true = แสดง, false = ซ่อน)
  request: ApprovalRequest | null; // ข้อมูลคำขอที่กำลังจะกดไม่อนุมัติ
  onConfirmReject: (reason: string) => void; // ฟังก์ชันส่งข้อความเหตุผลทั้งหมดกลับไปบันทึกตอนกดยืนยัน
  onCancel: () => void; // ฟังก์ชันสำหรับปิดหน้าต่าง Modal (กดยกเลิก หรือ ✕)
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  request,
  onConfirmReject,
  onCancel,
}) => {
  // เก็บหัวข้อเหตุผลหลักที่เลือกจาก Dropdown
  const [reasonCategory, setReasonCategory] = useState('จำนวนเงินไม่สมเหตุสมผล');
  // เก็บข้อความรายละเอียดเพิ่มเติม (ใส่ข้อความตัวอย่างตั้งต้นไว้ให้แก้ไขได้ทันที)
  const [detail, setDetail] = useState(
    'ประเมินจากความเสียหายของพนักงานแล้วพบว่าความเสียหายยังไม่สมเหตุสมผลกับจำนวนเงินที่ได้ขอเบิกสวัสดิการมา'
  );
  // เก็บสถานะการติ๊กเลือก "อนุญาตให้ยื่นใหม่ในรอบนี้" (ค่าเริ่มต้นคือไม่ติ๊ก)
  const [allowResubmit, setAllowResubmit] = useState(false);

  // ถ้า Modal ไม่ได้ถูกสั่งเปิด หรือไม่มีข้อมูลคำขอ ให้ไม่ต้องแสดงผลอะไรเลย
  if (!isOpen || !request) return null;

  // ฟังก์ชันทำงานเมื่อกดปุ่ม "ยืนยันไม่อนุมัติ"
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันเบราว์เซอร์รีเฟรชหน้าเว็บตอนกด Submit ฟอร์ม
    // รวมหัวข้อเหตุผล + รายละเอียด + หมายเหตุสิทธิ์ยื่นใหม่ (ถ้าติ๊กเลือก) เข้าเป็นข้อความเดียว
    const fullReason = `${reasonCategory}: ${detail.trim()}${
      allowResubmit ? ' (อนุญาตให้ยื่นใหม่ในรอบนี้)' : ''
    }`;
    // ส่งข้อความเหตุผลที่รวมเสร็จแล้วกลับไปให้ Component แม่บันทึกผล
    onConfirmReject(fullReason);
  };

  return (
    // ฉากหลังสีดำโปร่งแสงแบบเบลอ ครอบเต็มหน้าจอและจัดกล่องฟอร์มให้อยู่กึ่งกลาง
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      {/* กล่องฟอร์มสีขาว ขอบมน ใส่เงา */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-slate-100"
      >
        {/* 1. ส่วนหัวของ Modal: ไอคอนกากบาทสีแดง + รหัสคำขอ + ปุ่มปิดมุมขวาบน */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3.5">
            {/* วงกลมสีแดงแสดงสัญลักษณ์ไม่อนุมัติ (✕) */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-600 text-lg font-bold text-white shadow-sm">
              ✕
            </div>
            {/* หัวข้อแสดงรหัสคำขอที่จะไม่อนุมัติ */}
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                ไม่อนุมัติคำขอ {request.id}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                พนักงานและ HR จะได้รับแจ้งพร้อมเหตุผล
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

        {/* 2. ตัวเลือกหัวข้อเหตุผลหลัก (Dropdown) */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-800 mb-2">
            เหตุผล
          </label>
          <select
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-rose-500 focus:outline-none"
          >
            <option value="จำนวนเงินไม่สมเหตุสมผล">จำนวนเงินไม่สมเหตุสมผล</option>
            <option value="เอกสารหลักฐานไม่ครบถ้วน">เอกสารหลักฐานไม่ครบถ้วน</option>
            <option value="ไม่อยู่ในเงื่อนไขประกาศภัยพิบัติ">
              ไม่อยู่ในเงื่อนไขประกาศภัยพิบัติ
            </option>
          </select>
        </div>

        {/* 3. ช่องพิมพ์รายละเอียดคำอธิบายเพิ่มเติม */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-800 mb-2">
            รายละเอียดเพิ่มเติม
          </label>
          <textarea
            rows={3}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-700 leading-relaxed focus:border-rose-500 focus:outline-none"
          />
        </div>

        {/* 4. Checkbox ตัวเลือกอนุญาตให้พนักงานส่งคำขอใหม่ได้ในรอบนี้ */}
        <label className="flex items-center gap-2.5 mb-6 cursor-pointer select-none text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={allowResubmit}
            onChange={(e) => setAllowResubmit(e.target.checked)}
            className="h-4 w-4 rounded accent-rose-600"
          />
          <span>อนุญาตให้ยื่นใหม่ในรอบนี้</span>
        </label>

        {/* 5. ปุ่มดำเนินการคู่ด้านล่าง (ยกเลิก / ยืนยันไม่อนุมัติ) */}
        <div className="grid grid-cols-2 gap-3">
          {/* ปุ่มยกเลิก: ปิด Modal กลับไปหน้าเดิม */}
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            ยกเลิก
          </button>
          {/* ปุ่มยืนยันไม่อนุมัติ: ส่งฟอร์ม (onSubmit) เพื่อบันทึกสถานะ rejected */}
          <button
            type="submit"
            className="rounded-full bg-rose-600 py-3 text-xs font-bold text-white hover:bg-rose-700 transition shadow-sm"
          >
            ยืนยันไม่อนุมัติ
          </button>
        </div>
      </form>
    </div>
  );
};