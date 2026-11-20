import React from 'react'; // นำเข้า React สำหรับสร้าง Component

// กำหนดโครงสร้างข้อมูล (Props) ที่หน้าต่างดูตัวอย่างหลักฐานต้องรับเข้ามา
interface EvidencePreviewModalProps {
  title: string | null; // ชื่อหัวข้อหลักฐานหรือรูปภาพที่กดเลือก (ถ้าเป็น null คือยังไม่เปิด Modal)
  onClose: () => void; // ฟังก์ชันสำหรับปิดหน้าต่าง Modal (รีเซ็ต title กลับเป็น null)
}

export const EvidencePreviewModal: React.FC<EvidencePreviewModalProps> = ({
  title,
  onClose,
}) => {
  // ถ้ายังไม่มีการเลือกดูหลักฐาน (title เป็น null หรือค่าว่าง) ให้ไม่ต้องแสดงผลอะไรเลย
  if (!title) return null;

  return (
    // ฉากหลังสีดำโปร่งแสงแบบเบลอ ครอบเต็มหน้าจอและจัดกล่อง Modal ให้อยู่กึ่งกลาง
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      {/* กล่องเนื้อหา Modal สีขาว ขอบมน จัดข้อความกึ่งกลาง */}
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-slate-100 text-center">
        {/* ป้ายกำกับด้านบนสีฟ้าอ่อน */}
        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
          หลักฐานประกอบคำขอ
        </span>

        {/* แสดงชื่อไฟล์เอกสารหรือหัวข้อรูปภาพที่ผู้ใช้คลิกเข้ามาดู */}
        <h4 className="text-base font-bold text-slate-900">{title}</h4>

        {/* กล่องพื้นที่จำลองการแสดงตัวอย่างรูปภาพ/ไฟล์เอกสาร */}
        <div className="my-5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 py-14 px-4 text-xs text-slate-500">
          ตรวจสอบหลักฐานเรียบร้อยแล้ว • ตรงตามเงื่อนไขของบริษัท
        </div>

        {/* ปุ่มปิดหน้าต่างด้านล่างสุด */}
        <button
          type="button"
          onClick={onClose} // กดแล้วเรียกฟังก์ชันปิด Modal
          className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
};