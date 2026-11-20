import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { AuditLogItem, BudgetConfig, EmployeeRight } from '@/types'; // นำเข้าโครงสร้างข้อมูลประวัติคำขอ, การตั้งค่างบ และสิทธิ์รายบุคคล

// กำหนดโครงสร้างข้อมูล (Props) ที่การ์ดสรุปสถิติหน้าตรวจสอบประวัติต้องรับเข้ามา
interface AuditStatCardsProps {
  logs: AuditLogItem[]; // รายการประวัติการพิจารณาคำขอทั้งหมดในระบบ
  employeeRights: EmployeeRight[]; // ข้อมูลยอดใช้สิทธิ์สะสมรายบุคคลของพนักงานทุกคน
  budgetConfig: BudgetConfig; // การตั้งค่าปีงบประมาณและเพดานสิทธิ์สูงสุดต่อคนต่อปี
}

export const AuditStatCards: React.FC<AuditStatCardsProps> = ({
  logs,
  employeeRights,
  budgetConfig,
}) => {
  // 1. ดึงเพดานวงเงินภัยพิบัติสูงสุดต่อคนต่อปีมาเป็นเกณฑ์คำนวณ
  const cap = budgetConfig.disasterAnnualCap;

  // 2. แยกรายการประวัติออกเป็นกลุ่ม "อนุมัติแล้ว" และ "ไม่อนุมัติ"
  const approvedLogs = logs.filter((l) => l.status === 'approved');
  const rejectedLogs = logs.filter((l) => l.status === 'rejected');

  // 3. คำนวณยอดเงินรวมทั้งหมดที่อนุมัติจ่ายออกไปแล้ว
  const totalApprovedAmount = approvedLogs.reduce(
    (sum, item) => sum + item.approvedAmount,
    0
  );

  // 4. นับจำนวนพนักงานที่เบิกใช้สิทธิ์จนเต็มเพดานแล้ว (ใช้ไปมากกว่าหรือเท่ากับ 100% ของเพดาน)
  const maxedOutCount = employeeRights.filter(
    (emp) => emp.disasterUsed >= cap
  ).length;

  // 5. นับจำนวนพนักงานที่ใกล้เบิกครบเพดาน (ใช้ไปแล้วตั้งแต่ 80% ขึ้นไป แต่ยังไม่ถึง 100%)
  const nearMaxCount = employeeRights.filter(
    (emp) => emp.disasterUsed < cap && emp.disasterUsed >= cap * 0.8
  ).length;

  // 6. คำนวณเกณฑ์วงเงินคงเหลือสูงสุดของกลุ่ม "ใกล้ครบเพดาน" (20% ที่เหลือของเพดานทั้งหมด)
  const nearMaxThreshold = Math.max(0, Math.round(cap * 0.2));

  return (
    // กล่องครอบหลัก จัดเรียงการ์ดสถิติด้านบนและแถบเงื่อนไขด้านล่างแนวตั้ง
    <div className="space-y-4">
      {/* ตารางแสดงการ์ดสรุปตัวเลข 4 ใบ (1 คอลัมน์บนมือถือ, 2 บนแท็บเล็ต, 4 บนจอใหญ่) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* การ์ดใบที่ 1: จำนวนเคสที่อนุมัติแล้ว + ยอดเงินจ่ายรวม */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
          <p className="text-xs font-medium text-slate-500">
            อนุมัติแล้ว (ปี {budgetConfig.fiscalYear})
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {approvedLogs.length} เคส
          </p>
          <p className="mt-1.5 text-xs font-semibold text-emerald-600">
            ยอดรวม ฿{totalApprovedAmount.toLocaleString()}
          </p>
        </div>

        {/* การ์ดใบที่ 2: จำนวนเคสที่ไม่อนุมัติ + สรุปสาเหตุเบื้องต้น */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
          <p className="text-xs font-medium text-slate-500">ไม่อนุมัติ</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {rejectedLogs.length} เคส
          </p>
          <p className="mt-1.5 text-xs font-semibold text-rose-600">
            ยื่นซ้ำ 1 • เอกสารไม่ครบ {Math.max(0, rejectedLogs.length - 1)}
          </p>
        </div>

        {/* การ์ดใบที่ 3: จำนวนพนักงานที่เบิกเต็มสิทธิ์ประจำปีแล้ว */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
          <p className="text-xs font-medium text-slate-500">เบิกครบเพดานแล้ว</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {maxedOutCount} คน
          </p>
          <p className="mt-1.5 text-xs font-semibold text-rose-600">
            ระบบเตือนถ้ามีคำขอใหม่
          </p>
        </div>

        {/* การ์ดใบที่ 4: จำนวนพนักงานที่ใกล้เบิกครบเพดาน (ใช้สิทธิ์ไปแล้ว 80% ขึ้นไป) */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
          <p className="text-xs font-medium text-slate-500">ใกล้ครบเพดาน (≥80%)</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {nearMaxCount} คน
          </p>
          <p className="mt-1.5 text-xs font-semibold text-amber-600">
            เหลือไม่เกิน ฿{nearMaxThreshold.toLocaleString()}/คน
          </p>
        </div>
      </div>

      {/* แถบแบนเนอร์สีเหลืองอำพัน สรุปกติกาและเพดานการเบิกสิทธิ์ให้ผู้บริหารเห็นชัดเจน */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-3 text-xs font-semibold text-amber-800">
        เงื่อนไขสิทธิ์: ยื่นได้ 1 ครั้งต่อรอบ • เพดาน ฿{cap.toLocaleString()} / คน / ปี (ทุกภัยรวมกัน) • ถ้าอนุมัติเกินเพดาน ระบบจะไม่ให้กดอนุมัติ
      </div>
    </div>
  );
};