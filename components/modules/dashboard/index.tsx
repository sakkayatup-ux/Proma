import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { ApprovalRequest, BudgetConfig } from '@/types'; // นำเข้าโครงสร้างข้อมูลรายการคำขออนุมัติและการตั้งค่างบประมาณ
import { StatCards } from './StatCards'; // นำเข้าการ์ดสรุปตัวเลขสำคัญ 4 ใบด้านบนสุด
import { BudgetProgressBar } from './BudgetProgressBar'; // นำเข้าแถบแสดงสถานะงบประมาณ (อนุมัติแล้ว / รออนุมัติ / คงเหลือ)
import { ImpactedByLevel } from './ImpactedByLevel'; // นำเข้ากราฟแท่งแสดงจำนวนผู้ได้รับผลกระทบแยกตามระดับ 1-3
import { PendingListTable } from './PendingListTable'; // นำเข้าตารางรายการคำขอที่รออนุมัติด่วนด้านล่าง

// กำหนดโครงสร้างข้อมูล (Props) ที่หน้า Dashboard ต้องรับมาจากหน้าหลัก (page.tsx)
interface DashboardModuleProps {
  requests: ApprovalRequest[]; // รายการคำขออนุมัติทั้งหมดในระบบ
  budgetConfig: BudgetConfig; // การตั้งค่าวงเงินรวมทั้งปีและเพดานสิทธิ์
  usedDisaster: number; // ยอดเงินกองทุนภัยพิบัติที่อนุมัติจ่ายไปแล้ว
  pendingDisaster: number; // ยอดเงินกองทุนภัยพิบัติที่กำลังรออนุมัติ
  usedWelfare: number; // ยอดเงินกองทุนสวัสดิการทั่วไปที่อนุมัติจ่ายไปแล้ว
  pendingWelfare: number; // ยอดเงินกองทุนสวัสดิการทั่วไปที่กำลังรออนุมัติ
  onInspectRequest: (requestId: string) => void; // ฟังก์ชันเมื่อคลิกที่แถวคำขอ เพื่อกระโดดไปเปิดดูรายละเอียดในหน้า Approval
  onViewAllApproval: () => void; // ฟังก์ชันเมื่อกดปุ่ม "ดูทั้งหมด" เพื่อสลับไปยังหน้าเมนู Approval
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  requests,
  budgetConfig,
  usedDisaster,
  pendingDisaster,
  usedWelfare,
  pendingWelfare,
  onInspectRequest,
  onViewAllApproval,
}) => {
  return (
    // กล่องครอบหลักของหน้า Dashboard จัดเรียง 3 แถวหลักในแนวตั้งระยะห่างเท่ากัน
    <div className="space-y-5">
      {/* แถวที่ 1: การ์ดสรุปสถิติสำคัญ 4 ใบ (คำขอรออนุมัติ / เคสด่วน / ยอดรออนุมัติรวม / งบภัยพิบัติคงเหลือ) */}
      <StatCards
        requests={requests}
        budgetConfig={budgetConfig}
        usedDisaster={usedDisaster}
        pendingDisaster={pendingDisaster}
      />

      {/* แถวที่ 2: หลอดความคืบหน้าเปรียบเทียบงบประมาณทั้ง 2 กองทุน (ภัยพิบัติ vs สวัสดิการทั่วไป) */}
      <BudgetProgressBar
        budgetConfig={budgetConfig}
        usedDisaster={usedDisaster}
        pendingDisaster={pendingDisaster}
        usedWelfare={usedWelfare}
        pendingWelfare={pendingWelfare}
      />

      {/* แถวที่ 3: แบ่งสัดส่วน 1:2 บนจอใหญ่ (ซ้าย 1 ส่วน: กราฟระดับความรุนแรง, ขวา 2 ส่วน: ตารางคำขอรออนุมัติ) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* คอลัมน์ซ้าย (1/3): กราฟแท่งจำนวนผู้ได้รับผลกระทบแยกตามระดับ */}
        <div className="lg:col-span-1">
          <ImpactedByLevel requests={requests} />
        </div>

        {/* คอลัมน์ขวา (2/3): ตารางรายการคำขอที่รออนุมัติพร้อมปุ่มกดเข้าไปพิจารณา */}
        <div className="lg:col-span-2">
          <PendingListTable
            requests={requests}
            onInspectRequest={onInspectRequest}
            onViewAll={onViewAllApproval}
          />
        </div>
      </div>
    </div>
  );
};