import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { ApprovalRequest } from '@/types'; // นำเข้าโครงสร้างข้อมูลรายการคำขออนุมัติ

// กำหนดโครงสร้างข้อมูล (Props) ที่ตารางรายการค้างอนุมัติบนหน้า Dashboard ต้องรับเข้ามา
interface PendingListTableProps {
  requests: ApprovalRequest[]; // รายการคำขออนุมัติทั้งหมดในระบบ
  onInspectRequest: (requestId: string) => void; // ฟังก์ชันเมื่อกดปุ่ม "พิจารณา" เพื่อกระโดดไปเปิดเคสนั้นในหน้า Approval
  onViewAll: () => void; // ฟังก์ชันเมื่อกดปุ่ม "ดูทั้งหมด" เพื่อสลับไปยังหน้าเมนู Approval
}

export const PendingListTable: React.FC<PendingListTableProps> = ({
  requests,
  onInspectRequest,
  onViewAll,
}) => {
  // กรองเอาเฉพาะรายการคำขอที่ยังอยู่ในสถานะ "รออนุมัติ" (pending)
  const pendingList = requests.filter((r) => r.status === 'pending');

  // ฟังก์ชันแปลงระดับความรุนแรง (high / medium / low) เป็นข้อความภาษาไทยสำหรับแสดงในตาราง
  const getLevelLabel = (severity?: 'high' | 'medium' | 'low') => {
    if (severity === 'high') return 'ระดับ 3';
    if (severity === 'medium') return 'ระดับ 2';
    return 'ระดับ 1';
  };

  return (
    // กล่องการ์ดสีขาว ขอบมน ความสูงเต็มพื้นที่คอลัมน์ (h-full) เพื่อให้สมดุลกับการ์ดกราฟฝั่งซ้าย
    <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100 h-full">
      {/* 1. ส่วนหัวการ์ด: ชื่อหัวข้อ + คำอธิบาย + ปุ่มลัด "ดูทั้งหมด" */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            เคสที่ HR ส่งมารออนุมัติ
          </h3>
          <p className="text-xs text-slate-400">เรียงตามเวลาที่ HR ส่ง</p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          ดูทั้งหมด
        </button>
      </div>

      {/* 2. ตรวจสอบว่ามีรายการค้างอนุมัติหรือไม่ (ถ้าไม่มีให้แสดงกล่อง Empty State) */}
      {pendingList.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 py-10 text-center text-xs text-slate-400">
          ไม่มีรายการค้างอนุมัติในขณะนี้
        </div>
      ) : (
        /* 3. ตารางแสดงรายการคำขอที่รออนุมัติ (รองรับการเลื่อนแนวนอนบนหน้าจอมือถือ) */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* หัวตาราง 5 คอลัมน์ */}
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                <th className="py-3 pr-3">เลขที่</th>
                <th className="py-3 px-3">พนักงาน</th>
                <th className="py-3 px-3">ระดับ</th>
                <th className="py-3 px-3">HR เสนอ</th>
                <th className="py-3 pl-3 text-right"></th>
              </tr>
            </thead>

            {/* เนื้อหาตารางแต่ละแถว */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {pendingList.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition">
                  {/* คอลัมน์ที่ 1: เลขที่คำขอ */}
                  <td className="py-3.5 pr-3 font-bold text-slate-900">
                    {req.id}
                  </td>
                  {/* คอลัมน์ที่ 2: ชื่อ-นามสกุลพนักงาน */}
                  <td className="py-3.5 px-3 font-semibold text-slate-800">
                    {req.employeeName}
                  </td>
                  {/* คอลัมน์ที่ 3: ระดับความเสียหาย/ความเร่งด่วน */}
                  <td className="py-3.5 px-3 text-slate-500">
                    {getLevelLabel(req.severity)}
                  </td>
                  {/* คอลัมน์ที่ 4: ยอดเงินที่ HR ตรวจสอบและเสนอขออนุมัติ */}
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    ฿{req.proposedAmount.toLocaleString()}
                  </td>
                  {/* คอลัมน์ที่ 5: ปุ่มกดเข้าไปพิจารณาเคสนี้ทันที */}
                  <td className="py-3.5 pl-3 text-right">
                    <button
                      type="button"
                      onClick={() => onInspectRequest(req.id)}
                      className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                    >
                      พิจารณา
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};