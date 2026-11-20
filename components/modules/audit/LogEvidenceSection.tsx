import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { AuditLogItem } from '@/types'; // นำเข้าโครงสร้างข้อมูลรายการประวัติการพิจารณาคำขอ
import { getLogEvidenceConfig } from '../../../data/portalHelpers'; // นำเข้าฟังก์ชันช่วยดึงชุดการ์ดรูปภาพและเช็กลิสต์เอกสารตามประเภทกองทุน

// กำหนดโครงสร้างข้อมูล (Props) ที่ส่วนแสดงหลักฐานใน Modal ประวัติย้อนหลังต้องรับเข้ามา
interface LogEvidenceSectionProps {
  log: AuditLogItem; // ข้อมูลประวัติคำขอที่เลือกดูอยู่
  onPreviewDoc: (docName: string) => void; // ฟังก์ชันส่งชื่อเอกสาร/รูปภาพกลับไปเปิดแถบพรีวิวใน LogDetailModal
}

export const LogEvidenceSection: React.FC<LogEvidenceSectionProps> = ({ log, onPreviewDoc }) => {
  // ตรวจสอบว่าเป็นคำขอประเภทกองทุนภัยพิบัติหรือไม่
  const isDisaster = log.type === 'disaster';
  // ดึงชุดข้อมูลรูปถ่าย 3 ใบ และรายการเอกสารแนบตามประเภทคำขอมาจากไฟล์ Helper
  const { photoCards, documentChecklist } = getLogEvidenceConfig(isDisaster);

  return (
    // กล่องครอบหลัก จัดเรียงองค์ประกอบแนวตั้งระยะห่างเท่ากัน
    <div className="space-y-4">
      {/* หัวข้อส่วนหลักฐานประกอบคำขอ */}
      <h4 className="text-xs font-bold text-slate-900">
        รายละเอียดคำขอและหลักฐานที่ผู้ขอเบิกแนบมาทั้งหมด
      </h4>

      {/* 1. กล่องข้อมูลที่อยู่ ช่วงเวลา และคำอธิบายรายละเอียด */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4 space-y-3 text-xs">
        {/* ตาราง 2 คอลัมน์เทียบที่อยู่ตามทะเบียนประวัติกับที่อยู่ที่ยื่นขอเบิก */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <span className="block text-[11px] text-slate-400">ที่อยู่ตามทะเบียนประวัติ</span>
            <span className="mt-0.5 block font-medium text-slate-700">
              88/9 ต.หัวรอ อ.พระนครศรีอยุธยา จ.อยุธยา 13000
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400">ที่พักอาศัยที่ยื่นขอเบิก</span>
            <span className="mt-0.5 block font-bold text-slate-900">
              88/9 ต.หัวรอ อ.พระนครศรีอยุธยา จ.อยุธยา 13000
            </span>
          </div>
        </div>

        {/* แถวแสดงช่วงเวลาประสบเหตุ และปุ่มกดเปิดดูไฟล์สำเนาทะเบียนบ้าน */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="font-bold text-slate-800">ช่วงเวลา: 15-26 ต.ค. 2569 (11 วัน)</span>
          <button
            type="button"
            onClick={() => onPreviewDoc('สำเนาทะเบียนบ้าน.pdf')}
            className="font-bold text-blue-600 hover:underline"
          >
            📎 สำเนาทะเบียนบ้าน.pdf
          </button>
        </div>

        {/* กล่องข้อความคำบรรยายรายละเอียดความเสียหายหรือหมายเหตุคำขอ */}
        <div className="rounded-2xl border border-slate-100 bg-white p-3.5 text-slate-600">
          {isDisaster ? '“น้ำท่วมสูงเข้าตัวบ้านชั้นล่าง เสียหายหนัก”' : `“${log.note}”`}
        </div>
      </div>

      {/* 2. ตารางการ์ดรูปถ่ายหลักฐาน 3 ใบ (คลิกแต่ละใบเพื่อพรีวิวรูปภาพด้านล่าง Modal) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {photoCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => onPreviewDoc(`${card.title} (${card.subtitle})`)}
            className={`cursor-pointer rounded-2xl border p-3.5 transition hover:shadow-xs ${card.style}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-block rounded-md border border-blue-200 bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                รูปภาพ
              </span>
              <span className="text-[11px] font-semibold text-blue-600 underline">เปิดดู</span>
            </div>
            <p className="text-xs font-bold text-slate-900">{card.title}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* 3. รายการเอกสารแนบที่ตรวจสอบแล้ว (Checklist) */}
      <div className="space-y-1.5 text-xs text-slate-700">
        {documentChecklist.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-blue-400 text-[10px] font-bold text-blue-600">
              ✓
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};