import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { ModuleTab } from '@/types'; // นำเข้าประเภทข้อมูลชื่อแท็บเมนู ('dashboard' | 'approval' | 'audit' | 'budget')
import { useStore } from '@/lib/store'; // ชื่อผู้บริหารจากบัญชีที่เข้าสู่ระบบ

// กำหนดโครงสร้างข้อมูล (Props) ที่ Header ต้องรับมาจากหน้าหลัก (page.tsx)
interface HeaderProps {
  activeTab: ModuleTab; // ชื่อแท็บเมนูที่กำลังเปิดใช้งานอยู่
  pendingCount: number; // จำนวนเคสที่กำลังรออนุมัติ
  onJumpToApproval: () => void; // ฟังก์ชันเมื่อกดปุ่มแจ้งเตือน เพื่อกระโดดไปหน้าอนุมัติคำขอ
}

// ชุดข้อมูลหัวข้อหลัก (title) และคำอธิบายย่อย (subtitle) แยกตามแต่ละหน้า
const HEADER_INFO: Record<ModuleTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard ภาพรวมสวัสดิการและภัยพิบัติ',
    subtitle: 'สรุปผู้ได้รับผลกระทบและงบประมาณ • อัปเดตเรียลไทม์',
  },
  approval: {
    title: 'อนุมัติวงเงินช่วยเหลือ',
    subtitle: 'พิจารณาอนุมัติคำขอและตรวจสอบเพดานสิทธิ์รายบุคคล',
  },
  audit: {
    title: 'ประวัติการอนุมัติ',
    subtitle: 'ตรวจสอบว่าพนักงานแต่ละคนเบิกไปแล้วกี่ครั้ง และเบิกครบเพดานหรือยัง',
  },
  budget: {
    title: 'กำหนดงบประมาณ',
    subtitle: 'ตั้งวงเงินและเกณฑ์การจ่ายสำหรับสวัสดิการทั่วไปและช่วยเหลือภัยพิบัติ',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  pendingCount,
  onJumpToApproval,
}) => {
  // ดึงข้อความหัวข้อและคำอธิบายย่อยให้ตรงกับแท็บที่กำลังเปิดอยู่
  const current = HEADER_INFO[activeTab];
  const { session } = useStore();
  const APPROVER_NAME = session?.name || 'ผู้บริหาร';

  return (
    // แถบส่วนหัวด้านบน จัดวางหัวข้อทางซ้าย และปุ่มแจ้งเตือน/โปรไฟล์ทางขวา
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* ส่วนที่ 1: แสดงชื่อหน้าปัจจุบันและคำอธิบายย่อย */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {current.title}
        </h2>
        <p className="mt-1 text-xs text-slate-500">{current.subtitle}</p>
      </div>

      {/* ส่วนที่ 2: ปุ่มแจ้งเตือนเคสรออนุมัติ และการ์ดโปรไฟล์ผู้บริหาร */}
      <div className="flex items-center gap-3">
        {/* ปุ่มแจ้งเตือนสีชมพูอมแดง แสดงจำนวนเคสรออนุมัติ กดแล้วข้ามไปหน้าอนุมัติทันที */}
        <button
          type="button"
          onClick={onJumpToApproval}
          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
        >
          แจ้งเตือน {pendingCount}
        </button>

        {/* กล่องแสดงข้อมูลผู้ใช้งานปัจจุบัน (ผู้บริหาร) */}
        <div className="flex items-center gap-3 rounded-full bg-white py-1.5 pl-2 pr-4 shadow-xs border border-slate-100">
          {/* ไอคอนวงกลมตัวอักษรย่อตัวแรกของชื่อผู้บริหาร */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
            {APPROVER_NAME.charAt(0)}
          </div>
          {/* ชื่อเต็มและตำแหน่ง */}
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {APPROVER_NAME}
            </p>
            <p className="text-[11px] text-slate-400">ผู้บริหาร / Management</p>
          </div>
        </div>
      </div>
    </header>
  );
};