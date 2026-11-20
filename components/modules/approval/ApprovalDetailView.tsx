import React, { useState, useEffect } from 'react'; // นำเข้า React, useState (เก็บค่าฟอร์ม) และ useEffect (รีเซ็ตค่าเมื่อเปลี่ยนเคส)
import { ApprovalRequest } from '@/types'; // นำเข้าโครงสร้างข้อมูลคำขอเบิกเงิน
import { ApprovalDetailInfo } from './ApprovalDetailInfo'; // นำเข้ากล่องแสดงรายละเอียดคำขอและหลักฐานฝั่งซ้าย
import { ApprovalActionPanel } from './ApprovalActionPanel'; // นำเข้ากล่องเคาะวงเงินช่วยเหลือฝั่งขวา
import { EvidencePreviewModal } from './modals/EvidencePreviewModal'; // นำเข้าหน้าต่างป๊อปอัปสำหรับดูตัวอย่างรูป/เอกสาร

// กำหนดโครงสร้างข้อมูล (Props) ที่หน้ารายละเอียดคำขอต้องรับมาจาก ApprovalModule (index.tsx)
interface ApprovalDetailViewProps {
  request: ApprovalRequest; // ข้อมูลคำขอเบิกเงินของเคสที่กำลังเปิดดู
  annualCap: number; // เพดานสิทธิ์สูงสุดต่อคนต่อปี (ส่งเผื่อไว้สำหรับคำนวณเพิ่มเติม)
  usedThisYear: number; // ยอดเงินที่พนักงานใช้สิทธิ์ไปแล้วในปีนี้
  remainingQuota: number; // ยอดสิทธิ์คงเหลือรายบุคคลของพนักงานคนนี้
  remainingPool: number; // งบประมาณรวมของกองทุนที่เหลืออยู่
  onBack: () => void; // ฟังก์ชันเมื่อกดปุ่ม "← ย้อนกลับไปเลือกคำขออื่น"
  onTriggerApprove: (amount: number, note: string) => void; // ฟังก์ชันส่งยอดอนุมัติและหมายเหตุกลับไปให้ตัวแม่จัดการต่อ
  onTriggerReject: () => void; // ฟังก์ชันสั่งเปิดหน้าต่าง Modal ไม่อนุมัติคำขอ
}

export const ApprovalDetailView: React.FC<ApprovalDetailViewProps> = ({
  request,
  remainingQuota,
  remainingPool,
  onBack,
  onTriggerApprove,
  onTriggerReject,
}) => {
  // เก็บตัวเลขยอดเงินที่ผู้บริหารพิมพ์ในช่องอนุมัติ (ตั้งค่าเริ่มต้นให้ตรงกับยอดที่ HR เสนอมา)
  const [amountInput, setAmountInput] = useState<number>(request.proposedAmount);
  // เก็บข้อความหมายเหตุของผู้บริหารที่เลือกจาก Dropdown
  const [executiveNote, setExecutiveNote] = useState<string>('อนุมัติตาม HR เสนอ');
  // เก็บชื่อหัวข้อรูปภาพ/เอกสารที่กดเปิดดู (ถ้าเป็น null คือปิดหน้าต่าง Modal อยู่)
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);

  // เมื่อมีการเปลี่ยนไปดูคำขอเคสอื่น (request เปลี่ยน) ให้รีเซ็ตยอดเงินและหมายเหตุกลับเป็นค่าตั้งต้นของเคสใหม่ทันที
  useEffect(() => {
    setAmountInput(request.proposedAmount);
    setExecutiveNote('อนุมัติตาม HR เสนอ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id]);

  // เช็กว่ายอดที่กรอก หรือยอดที่ HR เสนอ เกินสิทธิ์คงเหลือของพนักงานคนนี้หรือไม่
  const isOverQuota = amountInput > remainingQuota || request.proposedAmount > remainingQuota;

  return (
    // กล่องครอบหลักของหน้ารายละเอียด จัดเรียงแนวตั้งระยะห่างเท่ากัน
    <div className="space-y-5">
      {/* 1. แถวปุ่มย้อนกลับด้านบนสุด */}
      <div>
        <button
          type="button"
          onClick={onBack} // กดแล้วล้างรหัสคำขอที่เลือก กลับไปหน้ารวมรายการ
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          ← ย้อนกลับไปเลือกคำขออื่น
        </button>
      </div>

      {/* 2. พื้นที่เนื้อหาแบ่ง 3 คอลัมน์บนจอใหญ่ (ซ้าย 2 ส่วน: รายละเอียด, ขวา 1 ส่วน: เคาะวงเงิน) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        {/* คอลัมน์ซ้าย: แสดงข้อมูลที่อยู่ ความเสียหาย รูปถ่ายหลักฐาน และผลตรวจ HR */}
        <ApprovalDetailInfo
          request={request}
          isOverQuota={isOverQuota}
          onPreview={setPreviewTitle} // ส่งฟังก์ชันเปิดดูหลักฐานไปให้ปุ่มดูเอกสารและรูปถ่าย
        />

        {/* คอลัมน์ขวา: แผงควบคุมการกรอกวงเงินอนุมัติ ปุ่มลัด และปุ่มตัดสินใจ */}
        <ApprovalActionPanel
          proposedAmount={request.proposedAmount}
          amountInput={amountInput}
          onChangeAmount={setAmountInput}
          executiveNote={executiveNote}
          onChangeNote={setExecutiveNote}
          remainingQuota={remainingQuota}
          remainingPool={remainingPool}
          onApprove={() => onTriggerApprove(amountInput, executiveNote)} // ส่งยอดเงินและหมายเหตุขึ้นไปให้ตัวแม่เช็กสิทธิ์และเปิด Modal
          onReject={onTriggerReject}
        />
      </div>

      {/* 3. หน้าต่างป๊อปอัปแสดงตัวอย่างรูปถ่าย/เอกสารแนบ (แสดงเฉพาะเมื่อ previewTitle ไม่ใช่ null) */}
      <EvidencePreviewModal title={previewTitle} onClose={() => setPreviewTitle(null)} />
    </div>
  );
};