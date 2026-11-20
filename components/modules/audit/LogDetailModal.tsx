import React, { useState } from 'react'; // นำเข้า React และ useState สำหรับเก็บสถานะการพรีวิวไฟล์ย่อย
import { AuditLogItem } from '@/types'; // นำเข้าโครงสร้างข้อมูลรายการประวัติการพิจารณาคำขอ
import { LogEvidenceSection } from './LogEvidenceSection'; // นำเข้าส่วนแสดงหลักฐานรูปถ่ายและเอกสารของประวัติย้อนหลัง

// กำหนดโครงสร้างข้อมูล (Props) ที่หน้าต่างดูรายละเอียดประวัติย้อนหลังต้องรับเข้ามา
interface LogDetailModalProps {
  log: AuditLogItem | null; // ข้อมูลประวัติคำขอที่คลิกเลือกมาจากตาราง AuditLogTable (null = ปิด Modal อยู่)
  onClose: () => void; // ฟังก์ชันสำหรับปิดหน้าต่าง Modal
}

export const LogDetailModal: React.FC<LogDetailModalProps> = ({ log, onClose }) => {
  // เก็บชื่อไฟล์เอกสารหรือรูปถ่ายที่ผู้ใช้คลิกดูตัวอย่างภายใน Modal นี้ (null = ยังไม่ได้กดดูไฟล์ไหน)
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  // ถ้ายังไม่มีรายการประวัติที่ถูกเลือก (log เป็น null) ให้ไม่ต้องแสดงผลอะไรเลย
  if (!log) return null;

  // เช็กว่าเป็นคำขอประเภทกองทุนภัยพิบัติหรือไม่
  const isDisaster = log.type === 'disaster';
  // ตัดเอาเฉพาะชื่อจริงหรือคำนำหน้าสั้นๆ ของผู้อนุมัติมาแสดง
  const shortApprover = log.approverName.split(' ')[0] || log.approverName;
  // แปลงสถานะคำขอเป็นข้อความภาษาไทยสำหรับแสดงใต้หัวข้อ
  const statusLabel =
    log.status === 'approved' ? 'อนุมัติเมื่อ' : log.status === 'rejected' ? 'ไม่อนุมัติเมื่อ' : 'ส่งคืนเมื่อ';

  // จัดเตรียมข้อมูลสรุป 6 แถวในรูปแบบ Array เพื่อให้วนลูปแสดงผลได้กระชับไม่ซ้ำซ้อน
  const summaryRows = [
    { label: 'ระดับ / ประเภทสิทธิ์', value: isDisaster ? 'ระดับ 3' : 'สวัสดิการทั่วไป' },
    { label: 'HR เสนอ', value: `฿${log.proposedAmount.toLocaleString()}` },
    { label: 'ผู้บริหารอนุมัติ', value: `฿${log.approvedAmount.toLocaleString()}` },
    { label: 'เหตุผลปรับลด / หมายเหตุ', value: log.note, rightAlign: true },
    {
      label: 'สิทธิ์หลังอนุมัติ',
      value: isDisaster ? 'ครบเพดาน ฿30,000 / ฿30,000' : 'คงเหลือตามสิทธิ์ประจำปี',
      color: isDisaster ? 'text-rose-600' : 'text-emerald-600',
    },
    {
      label: 'สถานะจ่ายเงิน',
      value: log.status === 'approved' ? 'โอนแล้ว 30 ต.ค. 69' : 'ไม่มีการโอนเงิน',
      color: log.status === 'approved' ? 'text-emerald-600' : 'text-rose-600',
    },
  ];

  return (
    // ฉากหลังสีดำโปร่งแสงแบบเบลอ ครอบเต็มหน้าจอและรองรับการเลื่อนแนวตั้ง (overflow-y-auto) กรณีเนื้อหายาว
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      {/* กล่องเนื้อหา Modal สีขาว ขอบมน ใส่เงา จัดกึ่งกลางแนวตั้งด้วย my-auto */}
      <div className="w-full max-w-xl rounded-3xl bg-white p-7 shadow-2xl border border-slate-100 my-auto">
        {/* 1. ส่วนหัวของ Modal: รหัสคำขอ + ชื่อพนักงาน + วันที่และผู้อนุมัติ + ปุ่มปิดมุมขวาบน */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {log.requestId} • {log.employeeName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {log.category} • {statusLabel} {log.actionDate.split('•')[0].trim()} โดย {shortApprover}
            </p>
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

        {/* 2. กล่องสรุปข้อมูลการอนุมัติ 6 บรรทัด (วนลูปจากตัวแปร summaryRows) */}
        <div className="rounded-2xl bg-slate-50/80 p-4 space-y-2.5 mb-5 border border-slate-100 text-xs">
          {summaryRows.map((row, idx) => (
            <div key={idx} className="flex justify-between gap-4">
              <span className="text-slate-500 shrink-0">{row.label}</span>
              <span className={`font-bold ${row.color || 'text-slate-900'} ${row.rightAlign ? 'text-right' : ''}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* 3. ส่วนแสดงรายการหลักฐานรูปถ่ายและเอกสารแนบย้อนหลัง */}
        <LogEvidenceSection log={log} onPreviewDoc={setPreviewDoc} />

        {/* 4. ปุ่มดำเนินการคู่ด้านล่าง (ดาวน์โหลดหลักฐานทั้งหมด / ปิดหน้าต่าง) */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {/* ปุ่มซ้าย: จำลองการดาวน์โหลดไฟล์หลักฐานรวมเป็น .zip */}
          <button
            type="button"
            onClick={() => alert(`กำลังดาวน์โหลดชุดหลักฐานทั้งหมดของคำขอ ${log.requestId} (.zip)`)}
            className="rounded-full border border-slate-200 bg-white py-3 text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
          >
            ดาวน์โหลดหลักฐาน
          </button>
          {/* ปุ่มขวา: ปิดหน้าต่าง Modal */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-orange-600 py-3 text-xs font-bold text-white hover:bg-orange-700 transition shadow-sm"
          >
            ปิด
          </button>
        </div>

        {/* 5. แถบแจ้งเตือนสีเข้มด้านล่างสุด (แสดงเฉพาะเมื่อกดคลิกดูตัวอย่างไฟล์เอกสารใน LogEvidenceSection) */}
        {previewDoc && (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-2.5 text-xs text-white">
            <span>กำลังแสดงตัวอย่าง: {previewDoc} (ผ่านการรับรองจาก HR แล้ว)</span>
            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="font-bold text-orange-400 hover:underline ml-3"
            >
              ปิดตัวอย่าง
            </button>
          </div>
        )}
      </div>
    </div>
  );
};