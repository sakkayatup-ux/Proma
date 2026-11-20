import React from 'react'; // นำเข้า React สำหรับสร้าง Component

// กำหนดโครงสร้างข้อมูล (Props) ที่แถบค้นหาและตัวกรองหน้าตรวจสอบประวัติต้องรับมาจาก AuditModule
interface AuditFilterBarProps {
  searchQuery: string; // ข้อความที่พิมพ์อยู่ในช่องค้นหา (ชื่อ หรือ รหัสพนักงาน)
  onSearchChange: (val: string) => void; // ฟังก์ชันอัปเดตข้อความค้นหาเมื่อผู้ใช้พิมพ์
  yearFilter: string; // ปีงบประมาณที่เลือกกรอง ('2569' | '2568')
  onYearFilterChange: (val: string) => void; // ฟังก์ชันเปลี่ยนปีงบประมาณ
  typeFilter: 'all' | 'disaster' | 'welfare'; // ประเภทกองทุนที่เลือกกรอง ('all' = ทั้งหมด)
  onTypeFilterChange: (val: 'all' | 'disaster' | 'welfare') => void; // ฟังก์ชันเปลี่ยนประเภทกองทุน
  rightStatusFilter: 'all' | 'maxed' | 'near' | 'available'; // สถานะสิทธิ์คงเหลือที่เลือกกรอง
  onRightStatusFilterChange: (val: 'all' | 'maxed' | 'near' | 'available') => void; // ฟังก์ชันเปลี่ยนสถานะสิทธิ์
  onExportExcel: () => void; // ฟังก์ชันทำงานเมื่อกดปุ่ม "ส่งออก Excel"
}

export const AuditFilterBar: React.FC<AuditFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  yearFilter,
  onYearFilterChange,
  typeFilter,
  onTypeFilterChange,
  rightStatusFilter,
  onRightStatusFilterChange,
  onExportExcel,
}) => {
  return (
    // กล่องครอบแถบเครื่องมือค้นหาและตัวกรอง จัดวางเรียงแนวนอนบนจอใหญ่ (lg:flex-row)
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      {/* 1. ช่องค้นหาข้อความ (ขยายเต็มพื้นที่ที่เหลือทางฝั่งซ้ายด้วย flex-1) */}
      <div className="relative flex-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)} // ส่งค่าที่พิมพ์กลับไปอัปเดต State ทันที
          placeholder="ค้นหาชื่อ หรือรหัสพนักงาน"
          className="w-full rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
        />
      </div>

      {/* 2. กลุ่มตัวเลือกตัวกรอง (Dropdown 3 ตัว) และปุ่มส่งออกไฟล์ทางฝั่งขวา */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* ตัวกรองที่ 1: เลือกปีงบประมาณ */}
        <select
          value={yearFilter}
          onChange={(e) => onYearFilterChange(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="2569">ปี 2569</option>
          <option value="2568">ปี 2568</option>
        </select>

        {/* ตัวกรองที่ 2: เลือกประเภทแบบฟอร์มกองทุน */}
        <select
          value={typeFilter}
          onChange={(e) =>
            onTypeFilterChange(e.target.value as 'all' | 'disaster' | 'welfare')
          }
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">ทุกแบบฟอร์ม</option>
          <option value="disaster">ภัยพิบัติ</option>
          <option value="welfare">สวัสดิการทั่วไป</option>
        </select>

        {/* ตัวกรองที่ 3: เลือกกรองตามสถานะการใช้สิทธิ์ของพนักงาน */}
        <select
          value={rightStatusFilter}
          onChange={(e) =>
            onRightStatusFilterChange(
              e.target.value as 'all' | 'maxed' | 'near' | 'available'
            )
          }
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">สถานะสิทธิ์</option>
          <option value="maxed">เบิกครบแล้ว</option>
          <option value="near">ใกล้ครบ</option>
          <option value="available">ยังเบิกได้</option>
        </select>

        {/* ปุ่มสั่งดาวน์โหลดรายงานข้อมูลออกเป็นไฟล์ Excel / CSV */}
        <button
          type="button"
          onClick={onExportExcel}
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
        >
          ส่งออก Excel
        </button>
      </div>
    </div>
  );
};