import React, { useState, useEffect } from 'react'; // นำเข้า React, useState (เก็บค่าฟอร์ม) และ useEffect (ซิงก์ค่าตั้งต้นเมื่อเปิด Modal)
import { BudgetConfig, BudgetExtra } from '@/types'; // นำเข้าโครงสร้างข้อมูลการตั้งค่างบประมาณหลัก

// กำหนดโครงสร้างข้อมูล (Props) ที่หน้าต่างตั้งงบประมาณสวัสดิการทั่วไปต้องรับเข้ามา
interface SetWelfareModalProps {
  isOpen: boolean; // สถานะเปิด/ปิดหน้าต่าง Modal (true = แสดง, false = ซ่อน)
  budgetConfig: BudgetConfig; // ค่าตั้งต้นงบประมาณปัจจุบันในระบบ
  onSave: (newPool: number, newCap: number, reason: string, extra?: BudgetExtra) => void; // ฟังก์ชันบันทึกวงเงินรวม, เพดานต่อปี และสรุปรายละเอียดเกณฑ์
  onClose: () => void; // ฟังก์ชันปิดหน้าต่าง Modal
}

export const SetWelfareModal: React.FC<SetWelfareModalProps> = ({
  isOpen,
  budgetConfig,
  onSave,
  onClose,
}) => {
  // เก็บตัวเลขวงเงินรวมกองทุนสวัสดิการทั่วไปทั้งปี
  const [pool, setPool] = useState<number>(budgetConfig.welfarePool);
  // เก็บเกณฑ์ค่ารักษาพยาบาลตนเองสูงสุดต่อครั้ง (บาท/ครั้ง)
  const [selfPerVisit, setSelfPerVisit] = useState<number>(1000);
  // เก็บจำนวนครั้งสูงสุดที่พนักงานเบิกค่ารักษาตนเองได้ต่อปี (ครั้ง/ปี)
  const [selfVisitsPerYear, setSelfVisitsPerYear] = useState<number>(30);
  // เก็บเกณฑ์ค่ารักษาผู้ป่วยนอก (OPD) ของครอบครัวสูงสุดต่อครั้ง
  const [familyOpd, setFamilyOpd] = useState<number>(2000);
  // เก็บเกณฑ์ค่ารักษาผู้ป่วยใน (IPD) ของครอบครัวสูงสุดต่อครั้ง
  const [familyIpd, setFamilyIpd] = useState<number>(20000);
  // เก็บเพดานวงเงินสวัสดิการรวมสูงสุดต่อคนต่อปี
  const [familyCap, setFamilyCap] = useState<number>(budgetConfig.welfareAnnualCap);

  // ทุกครั้งที่เปิด Modal ใหม่ หรือค่า budgetConfig เปลี่ยน ให้ดึงค่าล่าสุดมาใส่ในฟอร์มเสมอ
  useEffect(() => {
    if (!isOpen) return;
    setPool(budgetConfig.welfarePool);
    setFamilyCap(budgetConfig.welfareAnnualCap);
    setSelfPerVisit(budgetConfig.selfPerVisit ?? 1000);
    setSelfVisitsPerYear(budgetConfig.selfMaxTimes ?? 30);
    setFamilyOpd(budgetConfig.familyOpd ?? 2000);
    setFamilyIpd(budgetConfig.familyIpd ?? 20000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ถ้า Modal ไม่ได้ถูกสั่งเปิด (isOpen เป็น false) ให้ไม่ต้องแสดงผลอะไรเลย
  if (!isOpen) return null;

  // ฟังก์ชันทำงานเมื่อกดปุ่ม "บันทึกงบประมาณ"
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันเบราว์เซอร์รีเฟรชหน้าจอเมื่อกด Submit ฟอร์ม
    if (pool <= 0 || familyCap <= 0) return; // ตรวจสอบว่าวงเงินรวมและเพดานต่อปีต้องมากกว่า 0

    // รวมรายละเอียดเกณฑ์ย่อยทั้งหมดเป็นข้อความสรุป 1 บรรทัดเพื่อส่งไปบันทึกในประวัติการปรับงบ
    const summaryText = `ค่ารักษาตนเอง: ฿${selfPerVisit.toLocaleString()}/ครั้ง (${selfVisitsPerYear} ครั้ง/ปี) | OPD ครอบครัว: ฿${familyOpd.toLocaleString()} | IPD ครอบครัว: ฿${familyIpd.toLocaleString()}`;
    onSave(pool, familyCap, summaryText, { selfPerVisit, selfMaxTimes: selfVisitsPerYear, familyOpd, familyIpd }); // ส่งค่าใหม่ทั้งหมดขึ้นไปบันทึกที่ BudgetModule
    onClose(); // ปิดหน้าต่าง Modal
  };

  return (
    // ฉากหลังสีดำโปร่งแสงแบบเบลอ ครอบเต็มหน้าจอและรองรับการเลื่อนแนวตั้ง (overflow-y-auto)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      {/* กล่องฟอร์มเนื้อหา Modal สีขาว ขอบมน ใส่เงา */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-slate-100 my-auto space-y-4"
      >
        {/* 1. ส่วนหัวของ Modal */}
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            ตั้งงบประมาณสวัสดิการทั่วไป
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            กำหนดวงเงินรวมทั้งปีและเกณฑ์ค่ารักษาพยาบาลรายบุคคล/ครอบครัว
          </p>
        </div>

        {/* 2. ช่องกรอกวงเงินกองทุนสวัสดิการทั่วไปรวมทั้งปี (เพิ่ม/ลดทีละ 10,000 บาท) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">
            วงเงินรวมทั้งปี {budgetConfig.fiscalYear} (บาท)
          </label>
          <input
            type="number"
            min={0}
            step={10000}
            value={pool || ''}
            onChange={(e) => setPool(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-2xl border-2 border-blue-500 px-4 py-3 text-base font-bold text-slate-900 focus:outline-none"
          />
        </div>

        {/* 3. แถวตั้งค่าสิทธิ์ค่ารักษาตนเอง (วงเงินต่อครั้ง + จำนวนครั้งสูงสุดต่อปี) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              ค่ารักษาตนเอง (บาท/ครั้ง)
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={selfPerVisit || ''}
              onChange={(e) => setSelfPerVisit(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              จำนวนสิทธิ์ (ครั้ง/ปี)
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={selfVisitsPerYear || ''}
              onChange={(e) =>
                setSelfVisitsPerYear(Math.max(0, Number(e.target.value)))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 4. แถวตั้งค่าสิทธิ์ครอบครัว (ผู้ป่วยนอก OPD + ผู้ป่วยใน IPD) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              ครอบครัว OPD (บาท/ครั้ง)
            </label>
            <input
              type="number"
              min={0}
              step={500}
              value={familyOpd || ''}
              onChange={(e) => setFamilyOpd(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              ครอบครัว IPD (บาท/ครั้ง)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={familyIpd || ''}
              onChange={(e) => setFamilyIpd(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 5. ช่องกรอกเพดานวงเงินสวัสดิการครอบครัวรวมสูงสุดต่อคนต่อปี */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            เพดานครอบครัวรวม (บาท/คน/ปี)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={familyCap || ''}
            onChange={(e) => setFamilyCap(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* 6. ปุ่มดำเนินการคู่ด้านล่าง (ยกเลิก / บันทึกงบประมาณ) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200/70 transition"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="rounded-full bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
          >
            บันทึกงบประมาณ
          </button>
        </div>
      </form>
    </div>
  );
};