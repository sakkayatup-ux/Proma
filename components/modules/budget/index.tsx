import React, { useState } from 'react'; // นำเข้า React และ useState สำหรับควบคุมการเปิด/ปิด Modal ตั้งงบ
import { BudgetConfig, BudgetExtra, BudgetHistoryItem } from '@/types'; // นำเข้าโครงสร้างข้อมูลการตั้งค่างบประมาณและประวัติการปรับงบ
import { MasterBudgetBanner } from './MasterBudgetBanner'; // นำเข้าแบนเนอร์สรุปภาพรวมงบประมาณรวมทั้งปีด้านบนสุด
import { BudgetCards } from './BudgetCards'; // นำเข้าการ์ดเปรียบเทียบงบ 2 กองทุน (สวัสดิการทั่วไป vs ภัยพิบัติ)
import { BudgetHistoryTable } from './BudgetHistoryTable'; // นำเข้าตารางประวัติการปรับปรุงงบประมาณย้อนหลัง
import { SetWelfareModal } from './modals/SetWelfareModal'; // นำเข้า Modal ตั้งค่างบสวัสดิการทั่วไป
import { SetDisasterModal } from './modals/SetDisasterModal'; // นำเข้า Modal ตั้งค่างบช่วยเหลือภัยพิบัติ

// กำหนดโครงสร้างข้อมูล (Props) ที่โมดูล Budget ต้องรับมาจากหน้าหลัก (page.tsx)
interface BudgetModuleProps {
  budgetConfig: BudgetConfig; // การตั้งค่าวงเงินรวมและเพดานต่อคนต่อปีปัจจุบัน
  budgetHistory: BudgetHistoryItem[]; // รายการประวัติการปรับเปลี่ยนงบประมาณทั้งหมด
  usedDisaster: number; // ยอดเงินกองทุนภัยพิบัติที่อนุมัติจ่ายไปแล้ว
  usedWelfare: number; // ยอดเงินกองทุนสวัสดิการทั่วไปที่อนุมัติจ่ายไปแล้ว
  pendingDisaster: number; // ยอดเงินกองทุนภัยพิบัติที่รออนุมัติ
  pendingWelfare: number; // ยอดเงินกองทุนสวัสดิการทั่วไปที่รออนุมัติ
  onUpdateBudget: (
    fundType: 'welfare' | 'disaster',
    newPool: number,
    newCap: number,
    reason: string,
    extra?: BudgetExtra
  ) => void; // ฟังก์ชันส่งค่าที่แก้ไขใหม่ขึ้นไปอัปเดต State กลางและบันทึกประวัติที่ page.tsx
}

export const BudgetModule: React.FC<BudgetModuleProps> = ({
  budgetConfig,
  budgetHistory,
  usedDisaster,
  usedWelfare,
  pendingDisaster,
  pendingWelfare,
  onUpdateBudget,
}) => {
  // เก็บสถานะเปิด/ปิดหน้าต่าง Modal ตั้งงบสวัสดิการทั่วไป
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  // เก็บสถานะเปิด/ปิดหน้าต่าง Modal ตั้งงบช่วยเหลือภัยพิบัติ
  const [showDisasterModal, setShowDisasterModal] = useState(false);

  return (
    // กล่องครอบหลักของโมดูล Budget จัดเรียงแต่ละส่วนแนวตั้งระยะห่างเท่ากัน
    <div className="space-y-6">
      {/* 1. แบนเนอร์สรุปงบประมาณรวมทั้งหมดของปีงบประมาณ */}
      <MasterBudgetBanner
        budgetConfig={budgetConfig}
        usedDisaster={usedDisaster}
        usedWelfare={usedWelfare}
        pendingDisaster={pendingDisaster}
        pendingWelfare={pendingWelfare}
      />

      {/* 2. การ์ดเปรียบเทียบ 2 กองทุนหลัก พร้อมปุ่มกดเปิด Modal ตั้งค่าของแต่ละกองทุน */}
      <BudgetCards
        budgetConfig={budgetConfig}
        usedWelfare={usedWelfare}
        pendingWelfare={pendingWelfare}
        usedDisaster={usedDisaster}
        pendingDisaster={pendingDisaster}
        onOpenWelfareModal={() => setShowWelfareModal(true)}
        onOpenDisasterModal={() => setShowDisasterModal(true)}
      />

      {/* 3. ตารางบันทึกประวัติการปรับปรุงงบประมาณย้อนหลัง */}
      <BudgetHistoryTable history={budgetHistory} />

      {/* 4. หน้าต่างป๊อปอัปตั้งค่างบประมาณสวัสดิการทั่วไป */}
      <SetWelfareModal
        isOpen={showWelfareModal}
        budgetConfig={budgetConfig}
        onSave={(newPool, newCap, reason, extra) => {
          onUpdateBudget('welfare', newPool, newCap, reason, extra); // บันทึกค่าใหม่ขึ้นไปที่ตัวแม่
          setShowWelfareModal(false); // ปิดหน้าต่าง Modal
        }}
        onClose={() => setShowWelfareModal(false)}
      />

      {/* 5. หน้าต่างป๊อปอัปตั้งค่างบประมาณช่วยเหลือภัยพิบัติ */}
      <SetDisasterModal
        isOpen={showDisasterModal}
        budgetConfig={budgetConfig}
        onSave={(newPool, newCap, reason, extra) => {
          onUpdateBudget('disaster', newPool, newCap, reason, extra); // บันทึกค่าใหม่ขึ้นไปที่ตัวแม่
          setShowDisasterModal(false); // ปิดหน้าต่าง Modal
        }}
        onClose={() => setShowDisasterModal(false)}
      />
    </div>
  );
};