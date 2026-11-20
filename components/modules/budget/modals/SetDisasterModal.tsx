import React, { useState, useEffect } from 'react'; // นำเข้า React, useState (เก็บค่าฟอร์ม) และ useEffect (ซิงก์ค่าตั้งต้นเมื่อเปิด Modal)
import { BudgetConfig, BudgetExtra } from '@/types'; // นำเข้าโครงสร้างข้อมูลการตั้งค่างบประมาณหลัก
import { DisasterFundItem } from '../../../../data/portalHelpers'; // นำเข้าโครงสร้างข้อมูลกองทุนย่อยแต่ละประเภทภัย
import { DisasterFundAllocator } from './DisasterFundAllocator'; // นำเข้าส่วนเพิ่ม/ลบ/แก้ไขวงเงินแยกตามประเภทภัย

// กำหนดโครงสร้างข้อมูล (Props) ที่หน้าต่างตั้งงบประมาณภัยพิบัติต้องรับเข้ามา
interface SetDisasterModalProps {
  isOpen: boolean; // สถานะเปิด/ปิดหน้าต่าง Modal (true = แสดง, false = ซ่อน)
  budgetConfig: BudgetConfig; // ค่าตั้งต้นงบประมาณปัจจุบันในระบบ
  onSave: (newPool: number, newCap: number, reason: string, extra?: BudgetExtra) => void; // ฟังก์ชันบันทึกวงเงินรวม, เพดานต่อปี และสรุปรายการจัดสรร
  onClose: () => void; // ฟังก์ชันปิดหน้าต่าง Modal
}

export const SetDisasterModal: React.FC<SetDisasterModalProps> = ({
  isOpen,
  budgetConfig,
  onSave,
  onClose,
}) => {
  // เก็บตัวเลขวงเงินกองทุนภัยพิบัติรวมทั้งปี (ขั้นตอนที่ 1)
  const [pool, setPool] = useState<number>(budgetConfig.disasterPool);
  // เก็บรายการกองทุนย่อยที่จัดสรรแยกตามประเภทภัยพิบัติ (ขั้นตอนที่ 2)
  const [funds, setFunds] = useState<DisasterFundItem[]>([
  ]);

  // เก็บอัตราเงินช่วยเหลือมาตรฐานตามระดับความเสียหาย 3 ระดับ (ขั้นตอนที่ 3)
  const [levels, setLevels] = useState({ l1: 0, l2: 0, l3: 0 });
  // เก็บเพดานวงเงินเบิกสูงสุดต่อคนต่อปี (ขั้นตอนที่ 3)
  const [annualCap, setAnnualCap] = useState<number>(budgetConfig.disasterAnnualCap);

  // ทุกครั้งที่เปิด Modal ใหม่ หรือค่า budgetConfig เปลี่ยน ให้ดึงค่าล่าสุดมาใส่ในฟอร์มเสมอ
  useEffect(() => {
    if (!isOpen) return;
    setPool(budgetConfig.disasterPool);
    setAnnualCap(budgetConfig.disasterAnnualCap);
    setFunds((budgetConfig.disasterFunds ?? []).map((f) => ({ ...f })) as DisasterFundItem[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ถ้า Modal ไม่ได้ถูกสั่งเปิด (isOpen เป็น false) ให้ไม่ต้องแสดงผลอะไรเลย
  if (!isOpen) return null;

  // คำนวณยอดเงินรวมที่จัดสรรให้กองทุนย่อยไปแล้วทั้งหมด
  const allocatedTotal = funds.reduce((sum, f) => sum + f.amount, 0);
  // คำนวณงบสำรองกลางที่ยังเหลืออยู่ (ถ้ายอดจัดสรรย่อยเกินวงเงินรวม ค่านี้จะติดลบและขึ้นเตือนสีแดง)
  const unallocatedRemain = pool - allocatedTotal;

  // ฟังก์ชันทำงานเมื่อกดปุ่ม "บันทึกกองทุน"
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันเบราว์เซอร์รีเฟรชหน้าจอเมื่อกด Submit ฟอร์ม
    if (pool <= 0 || annualCap <= 0) return; // ตรวจสอบว่าวงเงินรวมและเพดานต่อปีต้องมากกว่า 0

    // รวมรายละเอียดกองทุนย่อยทั้งหมดเป็นข้อความสรุป 1 บรรทัดเพื่อส่งไปบันทึกในประวัติการปรับงบ
    const summaryText = funds
      .map((f) => `${f.type} รอบ ${f.round}: ฿${f.amount.toLocaleString()}`)
      .join(' | ');

    onSave(pool, annualCap, summaryText || `เพดานต่อคน ฿${annualCap.toLocaleString()}`, { disasterFunds: funds.map((f) => ({ id: f.id, type: f.type, round: f.round, amount: f.amount })) }); // ส่งค่าใหม่ทั้งหมดขึ้นไปบันทึกที่ BudgetModule
    onClose(); // ปิดหน้าต่าง Modal
  };

  return (
    // ฉากหลังสีดำโปร่งแสงแบบเบลอ ครอบเต็มหน้าจอและรองรับการเลื่อนแนวตั้ง (overflow-y-auto)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      {/* กล่องฟอร์มเนื้อหา Modal สีขาว ขอบมน ใส่เงา */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-slate-100 my-auto space-y-5"
      >
        {/* ส่วนหัวของ Modal */}
        <div>
          <h3 className="text-lg font-bold text-slate-900">ตั้งงบประมาณภัยพิบัติ</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ขั้นตอนที่ 1 กำหนดวงเงินรวมทั้งปี • ขั้นตอนที่ 2 จัดสรรแยกตามประเภทภัยพิบัติ
          </p>
        </div>

        {/* 1. ขั้นตอนที่ 1: กำหนดวงเงินกองทุนภัยพิบัติรวมทั้งปี + แสดงยอดจัดสรรเทียบงบสำรองคงเหลือ */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">
            1. กำหนดวงเงินกองทุนภัยพิบัติรวมทั้งปี {budgetConfig.fiscalYear} (บาท)
          </label>
          <input
            type="number"
            min={0}
            step={10000}
            value={pool || ''}
            onChange={(e) => setPool(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-2xl border-2 border-orange-400 px-4 py-3 text-base font-bold text-slate-900 focus:outline-none"
          />
          {/* แถบสรุปยอดจัดสรรแยก vs งบสำรองกลางคงเหลือ (เปลี่ยนเป็นสีแดงถ้าจัดสรรเกินงบรวม) */}
          <div className="mt-2 flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-500">
              จัดสรรแยกแล้ว: <strong className="text-slate-800">฿{allocatedTotal.toLocaleString()}</strong>
            </span>
            <span className={unallocatedRemain < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
              งบสำรองกลางคงเหลือ ฿{unallocatedRemain.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 2. ขั้นตอนที่ 2: ส่วนจัดสรรวงเงินแยกตามประเภทภัยพิบัติ (Component ย่อย) */}
        <DisasterFundAllocator funds={funds} onChangeFunds={setFunds} />

        {/* 3. ขั้นตอนที่ 3: กำหนดวงเงินตามระดับความเสียหาย 3 ระดับ และเพดานต่อคนต่อปี */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800">
            3. วงเงินตามระดับความเสียหาย (บาท)
          </label>

          {/* ช่องกรอกวงเงิน 3 ระดับเรียงแนวนอน 3 คอลัมน์ */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { key: 'l1' as const, label: 'ระดับ 1 (เล็กน้อย)' },
              { key: 'l2' as const, label: 'ระดับ 2 (ปานกลาง)' },
              { key: 'l3' as const, label: 'ระดับ 3 (หนักมาก)' },
            ].map((item) => (
              <div key={item.key}>
                <span className="block text-[11px] text-slate-400 mb-1">{item.label}</span>
                <input
                  type="number"
                  value={levels[item.key] || ''}
                  onChange={(e) => setLevels((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))}
                  className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-orange-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* ช่องกรอกเพดานวงเงินสูงสุดต่อคนต่อปี */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              เพดานต่อคนต่อปี (บาท)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={annualCap || ''}
              onChange={(e) => setAnnualCap(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 4. ปุ่มดำเนินการคู่ด้านล่าง (ยกเลิก / บันทึกกองทุน) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200/70 transition"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="rounded-full bg-orange-600 py-3 text-xs font-bold text-white hover:bg-orange-700 transition shadow-sm"
          >
            บันทึกกองทุน
          </button>
        </div>
      </form>
    </div>
  );
};