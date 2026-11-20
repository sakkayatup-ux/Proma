import React from 'react'; // นำเข้า React สำหรับสร้าง Component

// กำหนดโครงสร้างข้อมูล (Props) ที่แผงเคาะวงเงินช่วยเหลือต้องรับมาจาก ApprovalDetailView
interface ApprovalActionPanelProps {
  proposedAmount: number; // ยอดเงินที่ HR เสนอมาในคำขอ
  amountInput: number; // ยอดเงินปัจจุบันที่อยู่ในช่องกรอกของฝั่งผู้บริหาร
  onChangeAmount: (value: number) => void; // ฟังก์ชันอัปเดตตัวเลขเมื่อพิมพ์หรือกดปุ่มลัดเลือกวงเงิน
  executiveNote: string; // ข้อความหมายเหตุของผู้บริหารที่เลือกอยู่
  onChangeNote: (value: string) => void; // ฟังก์ชันเปลี่ยนข้อความหมายเหตุผู้บริหาร
  remainingQuota: number; // ยอดสิทธิ์คงเหลือรายบุคคลของพนักงานคนนี้ในปีนี้
  remainingPool: number; // งบประมาณรวมของกองทุนที่เหลืออยู่
  onApprove: () => void; // ฟังก์ชันทำงานเมื่อกดปุ่ม "อนุมัติ"
  onReject: () => void; // ฟังก์ชันทำงานเมื่อกดปุ่ม "ไม่อนุมัติ"
}

export const ApprovalActionPanel: React.FC<ApprovalActionPanelProps> = ({
  proposedAmount,
  amountInput,
  onChangeAmount,
  executiveNote,
  onChangeNote,
  remainingQuota,
  remainingPool,
  onApprove,
  onReject,
}) => {
  // ตรวจสอบว่ายอดที่ผู้บริหารระบุ เกินเพดานสิทธิ์ที่พนักงานคนนี้เหลืออยู่หรือไม่
  const isOverIndividualCap = amountInput > remainingQuota;
  // คำนวณยอดงบกองทุนที่จะเหลืออยู่หลังจากหักเคสนี้ (ป้องกันติดลบด้วย Math.max)
  const afterThisCase = Math.max(0, remainingPool - amountInput);

  // ชุดปุ่มทางลัดสำหรับกดเลือกวงเงินอย่างรวดเร็ว (เริ่มด้วยยอดตาม HR เสนอ ตามด้วยยอดมาตรฐาน)
  const quickPresets = [
    { label: `ตาม HR ฿${proposedAmount.toLocaleString()}`, value: proposedAmount },
    { label: '฿10,000', value: 10000 },
    { label: '฿20,000', value: 20000 },
    { label: '฿25,000', value: 25000 },
  ];

  return (
    // กล่องการ์ดสีขาว ขอบมน วางเรียงองค์ประกอบแนวตั้งระยะห่างเท่ากัน
    <div className="rounded-3xl bg-white p-7 shadow-xs border border-slate-100 space-y-5">
      {/* หัวข้อหลักของแผงควบคุม */}
      <h4 className="text-base font-bold text-slate-900">เคาะวงเงินช่วยเหลือ</h4>

      {/* 1. แถวแสดงยอดเงินอ้างอิงที่ HR เสนอเข้ามา */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">HR เสนอ</span>
        <span className="text-base font-bold text-slate-900">
          ฿{proposedAmount.toLocaleString()}
        </span>
      </div>

      {/* 2. ช่องกรอกจำนวนเงินอนุมัติ + ชุดปุ่มทางลัดเลือกวงเงิน */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">
          จำนวนเงินที่อนุมัติ (บาท)
        </label>
        {/* ช่องกรอกตัวเลข (เพิ่ม/ลดทีละ 500 บาท และเปลี่ยนขอบเป็นสีแดงอัตโนมัติถ้าเกินสิทธิ์) */}
        <input
          type="number"
          min={0}
          step={500}
          value={amountInput}
          onChange={(e) => onChangeAmount(Math.max(0, Number(e.target.value)))} // แปลงค่าเป็นตัวเลขและห้ามติดลบ
          className={`w-full rounded-2xl border-2 px-4 py-3 text-lg font-bold focus:outline-none ${
            isOverIndividualCap
              ? 'border-rose-400 text-rose-600' // สไตล์เตือนสีแดงเมื่อยอดเกินสิทธิ์รายบุคคล
              : 'border-slate-200 text-slate-900 focus:border-blue-500' // สไตล์ปกติ
          }`}
        />

        {/* แถวปุ่มทางลัดเลือกวงเงิน (กดแล้วใส่ตัวเลขลงช่องกรอกทันที พร้อมไฮไลต์สีส้มปุ่มที่ตรงกับยอดปัจจุบัน) */}
        <div className="mt-3 flex flex-wrap gap-2">
          {quickPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChangeAmount(preset.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                amountInput === preset.value
                  ? 'bg-orange-500 text-white' // ไฮไลต์สีส้มถ้ายอดตรงกับปุ่มนี้
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70' // สีเทาอ่อนปกติ
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. กล่องแจ้งเตือนสีแดง (แสดงเฉพาะตอนที่กรอกยอดเงินเกินสิทธิ์คงเหลือรายบุคคล) */}
      {isOverIndividualCap && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-xs font-semibold text-rose-600">
          ยอดที่ระบุเกินเพดานสิทธิ์ของพนักงานที่เหลือ ฿{remainingQuota.toLocaleString()}
        </div>
      )}

      {/* 4. สรุปตัวเลขงบประมาณ 3 บรรทัด (สิทธิ์รายบุคคล, งบกองทุน, ยอดคงเหลือหลังอนุมัติ) */}
      <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">สิทธิ์คงเหลือรายบุคคล</span>
          <span className="font-bold text-slate-900">฿{remainingQuota.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">งบกองทุนคงเหลือ</span>
          <span className="font-bold text-slate-900">฿{remainingPool.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">หลังอนุมัติเคสนี้</span>
          <span className="font-bold text-emerald-600">฿{afterThisCase.toLocaleString()}</span>
        </div>
      </div>

      {/* 5. ตัวเลือกหมายเหตุผู้บริหาร (Dropdown) */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">หมายเหตุผู้บริหาร</label>
        <select
          value={executiveNote}
          onChange={(e) => onChangeNote(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
        >
          <option value="อนุมัติตาม HR เสนอ">อนุมัติตาม HR เสนอ</option>
          <option value="อนุมัติตามสิทธิ์คงเหลือประจำปี">อนุมัติตามสิทธิ์คงเหลือประจำปี</option>
          <option value="อนุมัติกรณีเร่งด่วน">อนุมัติกรณีเร่งด่วน</option>
        </select>
      </div>

      {/* 6. ปุ่มตัดสินใจคู่ด้านล่างสุด (ไม่อนุมัติ / อนุมัติตามยอดที่กรอก) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* ปุ่มซ้าย: เปิด Modal ปฏิเสธคำขอ */}
        <button
          type="button"
          onClick={onReject}
          className="rounded-full bg-rose-50 py-3 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
        >
          ไม่อนุมัติ
        </button>
        {/* ปุ่มขวา: ตรวจสอบและเปิด Modal ยืนยันอนุมัติ (ล็อกปุ่มถ้ายอดเงินเป็น 0) */}
        <button
          type="button"
          disabled={amountInput <= 0}
          onClick={onApprove}
          className="rounded-full bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:bg-slate-300 transition shadow-xs"
        >
          อนุมัติ ฿{amountInput.toLocaleString()}
        </button>
      </div>
    </div>
  );
};