import React, { useState } from 'react'; // นำเข้า React และ useState สำหรับเก็บค่าตัวกรองและรายการที่เลือก
import { AuditLogItem, BudgetConfig, EmployeeRight } from '@/types'; // นำเข้าโครงสร้างข้อมูลประวัติคำขอ, สิทธิ์รายบุคคล และการตั้งค่างบ
import { AuditStatCards } from './AuditStatCards'; // นำเข้าการ์ดสรุปสถิติ 4 ใบด้านบนสุด
import { AuditFilterBar } from './AuditFilterBar'; // นำเข้าแถบค้นหาและตัวกรองข้อมูล
import { EmployeeRightsTable } from './EmployeeRightsTable'; // นำเข้าตารางสรุปสิทธิ์รายพนักงานคู่กับการ์ดรายบุคคล
import { AuditLogTable } from './AuditLogTable'; // นำเข้าตารางบันทึกประวัติการอนุมัติย้อนหลัง (Audit Log)
import { LogDetailModal } from './LogDetailModal'; // นำเข้าหน้าต่างป๊อปอัปแสดงรายละเอียดประวัติย้อนหลังรายเคส

// กำหนดโครงสร้างข้อมูล (Props) ที่โมดูล Audit ต้องรับมาจากหน้าหลัก (page.tsx)
interface AuditModuleProps {
  logs: AuditLogItem[]; // รายการประวัติการพิจารณาคำขอทั้งหมดในระบบ
  employeeRights: EmployeeRight[]; // ข้อมูลยอดใช้สิทธิ์สะสมรายบุคคลของพนักงานทุกคน
  budgetConfig: BudgetConfig; // การตั้งค่าปีงบประมาณและเพดานสิทธิ์สูงสุดต่อคนต่อปี
}

export const AuditModule: React.FC<AuditModuleProps> = ({
  logs,
  employeeRights,
  budgetConfig,
}) => {
  // เก็บข้อความค้นหาจากแถบ Filter ด้านบน (ค้นหาชื่อหรือรหัสพนักงาน)
  const [searchQuery, setSearchQuery] = useState('');
  // เก็บปีงบประมาณที่เลือกดูข้อมูล (ค่าเริ่มต้น '2569')
  const [yearFilter, setYearFilter] = useState('2569');
  // เก็บประเภทแบบฟอร์มที่เลือกกรอง ('all' = ทั้งหมด, 'disaster' = ภัยพิบัติ, 'welfare' = สวัสดิการ)
  const [typeFilter, setTypeFilter] = useState<'all' | 'disaster' | 'welfare'>('all');
  // เก็บสถานะการใช้สิทธิ์ที่เลือกกรอง ('all' | 'maxed' | 'near' | 'available')
  const [rightStatusFilter, setRightStatusFilter] = useState<
    'all' | 'maxed' | 'near' | 'available'
  >('all');
  // เก็บรหัสพนักงานที่กำลังคลิกเลือกในตารางเพื่อแสดงรายละเอียดการ์ดฝั่งขวา (ตั้งต้นเป็นคนแรกในตาราง)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employeeRights[0]?.employeeId || ''
  );
  // เก็บข้อมูลประวัติคำขอที่คลิกเลือกจากตาราง AuditLogTable (ถ้าเป็น null คือปิด Modal อยู่)
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // ดึงเพดานวงเงินภัยพิบัติสูงสุดต่อคนต่อปีมาเป็นเกณฑ์แบ่งกลุ่มสถานะสิทธิ์
  const cap = budgetConfig.disasterAnnualCap;

  // กรองรายชื่อพนักงานสำหรับส่งให้ตาราง EmployeeRightsTable ตามคำค้นหาและสถานะสิทธิ์ที่เลือก
  const filteredEmployees = employeeRights.filter((emp) => {
    const q = searchQuery.trim().toLowerCase(); // แปลงคำค้นหาเป็นตัวพิมพ์เล็ก
    const matchSearch =
      !q ||
      emp.employeeName.toLowerCase().includes(q) || // ตรงกับชื่อพนักงาน
      emp.employeeId.toLowerCase().includes(q); // หรือตรงกับรหัสพนักงาน

    const isMaxed = emp.disasterUsed >= cap; // เกณฑ์กลุ่ม "เบิกครบแล้ว" (ใช้ไป >= 100%)
    const isNear = !isMaxed && emp.disasterUsed >= cap * 0.8; // เกณฑ์กลุ่ม "ใกล้ครบ" (ใช้ไป 80% - 99%)

    // ตรวจสอบว่าพนักงานคนนี้ตรงกับตัวกรองสถานะสิทธิ์ที่เลือกอยู่หรือไม่
    const matchStatus =
      rightStatusFilter === 'all' ||
      (rightStatusFilter === 'maxed' && isMaxed) ||
      (rightStatusFilter === 'near' && isNear) ||
      (rightStatusFilter === 'available' && !isMaxed && !isNear);

    return matchSearch && matchStatus; // ต้องตรงทั้งคำค้นหาและสถานะสิทธิ์จึงจะแสดงผล
  });

  // ฟังก์ชันจำลองการส่งออกรายงานข้อมูลสรุปเป็นไฟล์ Excel
  const handleExportExcel = () => {
    alert('กำลังส่งออกรายงานสรุปสิทธิ์รายพนักงานและ Audit Log (ปี ' + yearFilter + ') เป็นไฟล์ Excel');
  };

  return (
    // กล่องครอบหลักของโมดูล Audit จัดเรียงแต่ละส่วนแนวตั้งระยะห่างเท่ากัน
    <div className="space-y-5">
      {/* 1. ส่วนการ์ดสรุปตัวเลขสถิติ 4 ใบด้านบน + แถบเงื่อนไขสิทธิ์ */}
      <AuditStatCards
        logs={logs}
        employeeRights={employeeRights}
        budgetConfig={budgetConfig}
      />

      {/* 2. แถบค้นหา ตัวกรองปี ประเภทกองทุน สถานะสิทธิ์ และปุ่มส่งออก Excel */}
      <AuditFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        yearFilter={yearFilter}
        onYearFilterChange={setYearFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        rightStatusFilter={rightStatusFilter}
        onRightStatusFilterChange={setRightStatusFilter}
        onExportExcel={handleExportExcel}
      />

      {/* 3. ตารางสรุปสิทธิ์รายพนักงาน (ส่งเฉพาะรายชื่อที่ผ่านการกรอง filteredEmployees) + การ์ดรายบุคคล */}
      <EmployeeRightsTable
        employeeRights={filteredEmployees}
        selectedEmployeeId={selectedEmployeeId}
        onSelectEmployee={setSelectedEmployeeId}
        logs={logs}
        budgetConfig={budgetConfig}
      />

      {/* 4. ตารางบันทึกประวัติการอนุมัติย้อนหลัง (Audit Log) */}
      <AuditLogTable logs={logs} onSelectLog={setSelectedLog} />

      {/* 5. หน้าต่างป๊อปอัปแสดงรายละเอียดประวัติคำขอย้อนหลัง (เปิดเมื่อคลิกแถวใน AuditLogTable) */}
      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};