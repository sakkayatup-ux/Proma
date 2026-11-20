import React from 'react'; // นำเข้า React สำหรับสร้าง Component

// กำหนดโครงสร้างข้อมูล (Props) ที่หน้าต่างแจ้งเตือน "อนุมัติสำเร็จ" ต้องรับเข้ามา
interface SuccessApproveModalProps {
  isOpen: boolean; // สถานะเปิด/ปิดหน้าต่าง Modal (true = แสดง, false = ซ่อน)
  approvedAmount: number; // ยอดเงินที่เพิ่งกดอนุมัติไปเมื่อสักครู่
  remainingBudget: number; // งบประมาณคงเหลือล่าสุดของกองทุนหลังหักยอดนี้แล้ว
  onBackToApprovalList: () => void; // ฟังก์ชันเมื่อกดปุ่มกลับไปหน้ารวมรายการอนุมัติ
}

export const SuccessApproveModal: React.FC<SuccessApproveModalProps> = ({
  isOpen,
  approvedAmount,
  remainingBudget,
  onBackToApprovalList,
}) => {
  // ถ้า Modal ไม่ได้ถูกสั่งเปิด (isOpen เป็น false) ให้ไม่ต้องแสดงผลอะไรเลย
  if (!isOpen) return null;

  return (
    // ฉากหลังสีดำโปร่งแสงแบบเบลอ ครอบเต็มหน้าจอและจัดกล่อง Modal ให้อยู่กึ่งกลาง
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      {/* กล่องเนื้อหา Modal สีขาว ขอบมน จัดข้อความกึ่งกลางทั้งหมด */}
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl border border-slate-100">
        {/* 1. ป้ายกำกับด้านบนสีเขียวอ่อน แสดงสถานะความสำเร็จ */}
        <span className="inline-block rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 mb-4">
          ดำเนินการสำเร็จ
        </span>

        {/* 2. หัวข้อตัวใหญ่ แสดงยอดเงินที่อนุมัติเรียบร้อยพร้อมใส่ลูกน้ำคั่นหลักพัน */}
        <h3 className="text-2xl font-bold text-slate-900">
          อนุมัติเรียบร้อย ฿{approvedAmount.toLocaleString()}
        </h3>

        {/* 3. ข้อความสรุปการทำงานเบื้องหลังอัตโนมัติของระบบ */}
        <p className="mt-2 text-xs text-slate-500">
          ตัดงบอัตโนมัติแล้ว • ส่งเข้าระบบจ่ายเงิน • แจ้งเตือนพนักงานและ HR แล้ว
        </p>

        {/* 4. ป้ายสรุปยอดงบประมาณกองทุนที่เหลืออยู่ล่าสุดหลังตัดงบแล้ว */}
        <div className="my-5 inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">
          งบคงเหลือรอบนี้ ฿{remainingBudget.toLocaleString()}
        </div>

        {/* 5. ปุ่มกดปิดหน้าต่างและย้อนกลับไปหน้ารวมรายการคำขอที่รออนุมัติ */}
        <button
          type="button"
          onClick={onBackToApprovalList}
          className="w-full rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
        >
          กลับหน้าอนุมัติวงเงิน
        </button>
      </div>
    </div>
  );
};