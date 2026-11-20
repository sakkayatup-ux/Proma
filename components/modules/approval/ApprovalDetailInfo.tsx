import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { ApprovalRequest } from '@/types'; // นำเข้าโครงสร้างข้อมูลคำขอเบิกเงิน

// กำหนดโครงสร้างข้อมูล (Props) ที่กล่องรายละเอียดคำขอฝั่งซ้ายต้องรับเข้ามา
interface ApprovalDetailInfoProps {
  request: ApprovalRequest; // ข้อมูลคำขอเบิกเงินของเคสที่เลือกดูอยู่
  isOverQuota: boolean; // สถานะว่ายอดที่กำลังจะอนุมัติเกินสิทธิ์รายบุคคลหรือไม่
  onPreview: (title: string) => void; // ฟังก์ชันเปิด Modal ดูตัวอย่างหลักฐาน/รูปภาพเมื่อคลิก
}

export const ApprovalDetailInfo: React.FC<ApprovalDetailInfoProps> = ({
  request,
  isOverQuota,
  onPreview,
}) => {
  // ฟังก์ชันช่วยเลือกโทนสีพื้นหลังและเส้นขอบให้การ์ดรูปถ่ายแต่ละใบ ('blue' | 'indigo' | 'sky')
  const getCardStyle = (color: 'blue' | 'indigo' | 'sky') => {
    if (color === 'indigo') return 'bg-indigo-50/70 border-indigo-100';
    if (color === 'sky') return 'bg-sky-50/70 border-sky-100';
    return 'bg-blue-50/70 border-blue-100';
  };

  return (
    // คอลัมน์ฝั่งซ้าย (กินพื้นที่ 2 ใน 3 บนหน้าจอใหญ่) แบ่งเป็น 2 การ์ดหลักเรียงแนวตั้ง
    <div className="lg:col-span-2 space-y-5">
      {/* การ์ดใบที่ 1: ข้อมูลคำขอและหลักฐานทั้งหมด (แบ่งเป็น 3 ส่วนย่อย) */}
      <div className="rounded-3xl bg-white p-7 shadow-xs border border-slate-100 space-y-6">
        {/* ส่วนหัวข้อคำขอ: รหัสเคส + ชื่อพนักงาน + ป้ายระดับความรุนแรง */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              รายละเอียดคำขอ {request.id}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {request.employeeName} • {request.employeeId} • {request.department} • {request.roundTitle}
            </p>
          </div>

          {/* ป้ายแสดงระดับความรุนแรง (เปลี่ยนเป็นสีแดงพร้อมแจ้งเตือนทันทีถ้ายอดเกินสิทธิ์) */}
          <span
            className={`rounded-full px-3.5 py-1 text-xs font-semibold ${
              isOverQuota ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {request.severityLabel}
            {isOverQuota ? ' • ยอดเกินสิทธิ์' : ''}
          </span>
        </div>

        {/* ส่วนที่ 1: ข้อมูลที่พักอาศัยเปรียบเทียบระหว่างทะเบียนประวัติกับที่อยู่ปัจจุบัน */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-800">
            ส่วนที่ 1 • ข้อมูลที่พักอาศัยและเอกสารยืนยันที่อยู่
          </h4>

          {/* ตาราง 2 คอลัมน์เทียบที่อยู่ */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <span className="block text-[11px] text-slate-400">ที่อยู่ตามทะเบียนประวัติ</span>
              <span className="mt-1 block font-medium text-slate-700">{request.registeredAddress}</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">ที่พักอาศัยปัจจุบันที่ได้รับผลกระทบ</span>
              <span className="mt-1 block font-bold text-slate-900">{request.currentAddress}</span>
            </div>
          </div>

          {/* แถวล่างแสดงลักษณะที่พักอาศัย และปุ่มกดเปิดดูเอกสารยืนยันที่อยู่ */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
            <div>
              <span className="text-slate-400">ลักษณะที่พัก: </span>
              <span className="font-bold text-slate-900">{request.houseType}</span>
            </div>
            <button
              type="button"
              onClick={() => onPreview(request.houseDocName)} // กดแล้วส่งชื่อเอกสารไปเปิดใน EvidencePreviewModal
              className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
            >
              เปิดดู {request.houseDocName}
            </button>
          </div>
        </div>

        {/* ส่วนที่ 2: รายละเอียดคำอธิบายความเสียหายและช่วงเวลาที่ได้รับผลกระทบ */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-800">
              ส่วนที่ 2 • รายละเอียดผลกระทบและช่วงเวลา
            </h4>
            {/* ป้ายแสดงระยะเวลาที่ประสบเหตุ */}
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
              {request.impactDuration}
            </span>
          </div>
          {/* กล่องข้อความบรรยายรายละเอียดความเสียหาย */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 text-xs text-slate-700">
            {request.description}
          </div>
        </div>

        {/* ส่วนที่ 3: หลักฐานรูปถ่าย (การ์ด 3 ใบ) และรายการเอกสารแนบ (Checklist) */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-800">
            ส่วนที่ 3 • หลักฐานรูปถ่ายและเอกสารที่ผู้ขอเบิกแนบมา ({request.photoCards.length} รายการ)
          </h4>

          {/* ตารางการ์ดรูปถ่ายหลักฐาน (คลิกแต่ละใบเพื่อเปิดดูตัวอย่างรูปใน Modal) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {request.photoCards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => onPreview(`${card.title} (${card.subtitle})`)}
                className={`cursor-pointer rounded-2xl border p-4 transition hover:shadow-xs ${getCardStyle(card.bgColor)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block rounded-lg border border-blue-200 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                    ภาพถ่าย
                  </span>
                  <span className="text-[11px] font-semibold text-blue-600 underline">คลิกดูรูป</span>
                </div>
                <p className="text-xs font-bold text-slate-900">{card.title}</p>
                <p className="mt-1 text-[11px] text-slate-500">{card.subtitle}</p>
              </div>
            ))}
          </div>

          {/* รายการเอกสารประกอบที่แนบมาครบถ้วน */}
          <div className="space-y-1.5 pt-1 text-xs text-slate-700">
            {request.documentChecklist.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-blue-400 text-[10px] font-bold text-blue-600">
                  ✓
                </span>
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* การ์ดใบที่ 2: ผลการตรวจสอบเบื้องต้นจากฝ่ายบุคคล (HR Screening) */}
      <div className="rounded-3xl bg-white p-7 shadow-xs border border-slate-100">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-base font-bold text-slate-900">ผลการกลั่นกรองจาก HR</h4>
          {/* ป้ายสรุปจำนวนข้อที่ผ่านการตรวจสอบ */}
          <span className="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700">
            ✓ ผ่านการตรวจสอบ {request.hrScreeningChecks.length}/{request.hrScreeningChecks.length}
          </span>
        </div>

        {/* รายการหัวข้อที่ HR ตรวจสอบผ่านแล้ว */}
        <div className="space-y-2.5 text-xs font-semibold text-emerald-700">
          {request.hrScreeningChecks.map((check, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-emerald-500 text-[10px]">
                ✓
              </span>
              <span>{check}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};