import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { ApprovalRequest, BudgetConfig } from '@/types'; // นำเข้าโครงสร้างข้อมูลรายการคำขออนุมัติและการตั้งค่างบประมาณ

// กำหนดโครงสร้างข้อมูล (Props) ที่การ์ดสรุปสถิติทั้ง 4 ใบต้องรับมาจาก DashboardModule
interface StatCardsProps {
  requests: ApprovalRequest[]; // รายการคำขออนุมัติทั้งหมดในรอบนี้
  budgetConfig: BudgetConfig; // การตั้งค่างบประมาณหลักทั้งปี
  usedDisaster: number; // ยอดเงินกองทุนภัยพิบัติที่อนุมัติจ่ายไปแล้ว
  pendingDisaster: number; // ยอดเงินกองทุนภัยพิบัติที่กำลังรออนุมัติ
}

export const StatCards: React.FC<StatCardsProps> = ({
  requests,
  budgetConfig,
  usedDisaster,
  pendingDisaster,
}) => {
  // 1. แยกนับจำนวนคำขอตามประเภทกองทุน (สวัสดิการทั่วไป vs ภัยพิบัติ) สำหรับแสดงในการ์ดใบที่ 1
  const welfareCount = requests.filter((r) => r.type === 'welfare').length;
  const disasterCount = requests.filter((r) => r.type === 'disaster').length;

  // 2. กรองรายการที่รออนุมัติและรวมยอดเงินที่ HR เสนอเข้ามาทั้งหมด
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const pendingTotalAmount = pendingRequests.reduce(
    (sum, r) => sum + r.proposedAmount,
    0
  );

  // 3. รวมยอดเงินที่ผู้บริหารอนุมัติไปแล้วในรอบนี้ (ใช้ approvedAmount ถ้ามี ไม่งั้นใช้ proposedAmount)
  const approvedTotalAmount = requests
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + (r.approvedAmount ?? r.proposedAmount), 0);

  // 4. คำนวณยอดเงินรวมทั้งหมดที่ต้องใช้ในรอบนี้ (อนุมัติแล้ว + รออนุมัติ)
  const roundTotalAmount = approvedTotalAmount + pendingTotalAmount;

  // 5. คำนวณงบคงเหลือสุทธิของกองทุนภัยพิบัติและเปอร์เซ็นต์คงเหลือ (ป้องกันติดลบ)
  const remainingDisaster = Math.max(
    0,
    budgetConfig.disasterPool - usedDisaster - pendingDisaster
  );
  const remainingPercent =
    budgetConfig.disasterPool > 0
      ? Math.round((remainingDisaster / budgetConfig.disasterPool) * 100)
      : 0;

  return (
    // ตารางแสดงการ์ดสรุปสถิติ 4 ใบ (1 คอลัมน์บนมือถือ, 2 บนแท็บเล็ต, 4 บนจอใหญ่)
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* การ์ดใบที่ 1: จำนวนพนักงานที่ยื่นเบิกทั้งหมด แยกตามประเภทกองทุน */}
      <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
        <p className="text-xs font-medium text-slate-500">
          พนักงานที่ได้รับผลกระทบ / ยื่นเบิก
        </p>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          {requests.length} คน
        </p>
        <p className="mt-1.5 text-xs font-medium text-slate-400">
          สวัสดิการทั่วไป {welfareCount} คน • ภัยพิบัติ {disasterCount} คน
        </p>
      </div>

      {/* การ์ดใบที่ 2: ยอดงบประมาณรวมที่ต้องใช้ในรอบการพิจารณาปัจจุบัน */}
      <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
        <p className="text-xs font-medium text-slate-500">
          งบรวมที่ต้องใช้ (รอบนี้)
        </p>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          ฿{roundTotalAmount.toLocaleString()}
        </p>
        <p className="mt-1.5 text-xs font-semibold text-amber-600">
          อนุมัติแล้ว ฿{approvedTotalAmount.toLocaleString()} + รออนุมัติ ฿
          {pendingTotalAmount.toLocaleString()}
        </p>
      </div>

      {/* การ์ดใบที่ 3: ยอดงบประมาณภัยพิบัติคงเหลือสุทธิเทียบกับวงเงินทั้งปี */}
      <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
        <p className="text-xs font-medium text-slate-500">
          งบคงเหลือ (ภัยพิบัติ)
        </p>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          ฿{remainingDisaster.toLocaleString()}
        </p>
        <p className="mt-1.5 text-xs font-semibold text-emerald-600">
          จาก Budget Pool ฿{budgetConfig.disasterPool.toLocaleString()} (
          {remainingPercent}%)
        </p>
      </div>

      {/* การ์ดใบที่ 4: จำนวนเคสที่รอผู้บริหารกดอนุมัติพร้อมยอดเงินรวม */}
      <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
        <p className="text-xs font-medium text-slate-500">รออนุมัติจากคุณ</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          {pendingRequests.length} เคส
        </p>
        <p className="mt-1.5 text-xs font-semibold text-rose-600">
          HR เสนอรวม ฿{pendingTotalAmount.toLocaleString()}
        </p>
      </div>
    </div>
  );
};