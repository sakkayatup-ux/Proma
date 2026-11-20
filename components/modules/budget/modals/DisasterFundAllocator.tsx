import React, { useState } from 'react'; // นำเข้า React และ useState สำหรับเก็บค่าฟอร์มเพิ่มกองทุนใหม่
import { DISASTER_TYPES, DisasterFundItem } from '../../../../data/portalHelpers'; // นำเข้ารายชื่อประเภทภัยพิบัติมาตรฐาน และโครงสร้างข้อมูลกองทุนย่อย

// กำหนดโครงสร้างข้อมูล (Props) ที่ตัวจัดสรรวงเงินภัยพิบัติต้องรับมาจาก BudgetModule
interface DisasterFundAllocatorProps {
  funds: DisasterFundItem[]; // รายการกองทุนภัยพิบัติที่จัดสรรไว้ทั้งหมดในปัจจุบัน
  onChangeFunds: React.Dispatch<React.SetStateAction<DisasterFundItem[]>>; // ฟังก์ชันอัปเดต State รายการกองทุนในตัวแม่
}

export const DisasterFundAllocator: React.FC<DisasterFundAllocatorProps> = ({
  funds,
  onChangeFunds,
}) => {
  // เก็บค่าประเภทภัยพิบัติที่เลือกในฟอร์มเพิ่มรายการใหม่ (ค่าเริ่มต้น 'วาตภัย')
  const [newType, setNewType] = useState<string>('วาตภัย');
  // เก็บค่ารอบประกาศภัยพิบัติที่กรอกในฟอร์มเพิ่มรายการใหม่ (ค่าเริ่มต้น '1/2569')
  const [newRound, setNewRound] = useState<string>('1/2569');
  // เก็บตัวเลขวงเงินที่พิมพ์ในช่องเพิ่มกองทุนใหม่ (เก็บเป็น string เพื่อให้ช่องกรอกว่างได้ตอนยังไม่พิมพ์)
  const [newAmount, setNewAmount] = useState<string>('');

  // 1. ฟังก์ชันเพิ่มกองทุนภัยพิบัติรายการใหม่เข้าไปในรายการ
  const handleAddFund = () => {
    const amt = Number(newAmount); // แปลงข้อความตัวเลขเป็นชนิด Number
    if (!amt || amt <= 0) return; // ถ้ายอดเงินเป็น 0 หรือไม่ถูกต้อง ให้หยุดทำงาน (ไม่เพิ่มรายการว่าง)

    // เพิ่มรายการใหม่ต่อท้าย Array เดิม โดยสร้าง id ไม่ซ้ำจากเวลาปัจจุบัน (Date.now())
    onChangeFunds((prev) => [
      ...prev,
      {
        id: `f-${Date.now()}`,
        type: newType,
        round: newRound.trim() || '1/2569', // ถ้าไม่ได้พิมพ์รอบภัย ให้ใช้ '1/2569' เป็นค่าเริ่มต้น
        amount: amt,
      },
    ]);
    setNewAmount(''); // ล้างช่องกรอกวงเงินกลับเป็นค่าว่างหลังเพิ่มสำเร็จ
  };

  // 2. ฟังก์ชันลบกองทุนตามรหัส id ที่คลิกปุ่ม "ลบ"
  const handleRemoveFund = (id: string) => {
    onChangeFunds((prev) => prev.filter((f) => f.id !== id));
  };

  // 3. ฟังก์ชันแก้ไขข้อมูลกองทุนที่มีอยู่แล้วแบบ Real-time (แก้ได้ทั้งประเภทภัย, รอบภัย และวงเงิน)
  const handleUpdateFund = (
    id: string,
    field: 'type' | 'round' | 'amount',
    value: string | number
  ) => {
    onChangeFunds((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  return (
    // ใช้ Fragment (<>) ครอบ 2 ส่วนย่อยเพื่อให้อยู่ในโครงสร้าง space-y ของการ์ดแม่ได้โดยตรง
    <>
      {/* ส่วนที่ 1: รายการกองทุนภัยพิบัติที่จัดสรรไว้แล้ว (แก้ไขหรือลบได้ทันที) */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-slate-800">
          2. จัดสรรวงเงินแยกตามประเภทภัย ({funds.length} กองทุน)
        </label>

        {/* วนลูปแสดงแต่ละกองทุนในตารางกริด 12 คอลัมน์ (4 + 3 + 4 + 1 = 12) */}
        {funds.map((fund) => (
          <div key={fund.id} className="grid grid-cols-12 gap-2 items-center">
            {/* คอลัมน์ 1-4: ตัวเลือกประเภทภัยพิบัติ */}
            <select
              value={fund.type}
              onChange={(e) => handleUpdateFund(fund.id, 'type', e.target.value)}
              className="col-span-4 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 focus:border-orange-500 focus:outline-none"
            >
              {DISASTER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* คอลัมน์ 5-7: ช่องกรอกรอบประกาศภัยพิบัติ (เช่น 1/2569) */}
            <input
              type="text"
              value={fund.round}
              onChange={(e) => handleUpdateFund(fund.id, 'round', e.target.value)}
              className="col-span-3 rounded-2xl border border-slate-200 px-3 py-2.5 text-center text-xs font-medium text-slate-700 focus:border-orange-500 focus:outline-none"
            />

            {/* คอลัมน์ 8-11: ช่องกรอกวงเงินจัดสรร (เพิ่ม/ลดทีละ 10,000 บาท และห้ามติดลบ) */}
            <input
              type="number"
              min={0}
              step={10000}
              value={fund.amount}
              onChange={(e) =>
                handleUpdateFund(fund.id, 'amount', Math.max(0, Number(e.target.value)))
              }
              className="col-span-4 rounded-2xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-orange-500 focus:outline-none"
            />

            {/* คอลัมน์ 12: ปุ่มลบกองทุนรายการนี้ออก */}
            <button
              type="button"
              onClick={() => handleRemoveFund(fund.id)}
              className="col-span-1 text-center text-xs font-bold text-slate-400 hover:text-rose-600 transition"
              title="ลบกองทุน"
            >
              ลบ
            </button>
          </div>
        ))}
      </div>

      {/* ส่วนที่ 2: ฟอร์มสำหรับเพิ่มประเภทภัยพิบัติใหม่เข้ากองทุน */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-slate-800">
          + เพิ่มประเภทภัยพิบัติใหม่
        </label>

        {/* แถวช่องกรอกข้อมูลกองทุนใหม่แบ่ง 3 ช่องเท่ากัน (4 + 4 + 4 = 12 คอลัมน์) */}
        <div className="grid grid-cols-12 gap-2">
          {/* เลือกประเภทภัยพิบัติ */}
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="col-span-4 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 focus:border-orange-500 focus:outline-none"
          >
            {DISASTER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* กรอกรอบประกาศภัย */}
          <input
            type="text"
            value={newRound}
            onChange={(e) => setNewRound(e.target.value)}
            className="col-span-4 rounded-2xl border border-slate-200 px-3 py-2.5 text-center text-xs font-medium text-slate-700 focus:border-orange-500 focus:outline-none"
          />

          {/* กรอกจำนวนวงเงิน (บาท) */}
          <input
            type="number"
            min={0}
            step={10000}
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="วงเงิน (บาท)"
            className="col-span-4 rounded-2xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* ปุ่มยืนยันการเพิ่มรายการเข้าสู่กองทุนด้านบน */}
        <button
          type="button"
          onClick={handleAddFund}
          className="w-full rounded-2xl border border-orange-200 bg-orange-50/80 py-2.5 text-xs font-bold text-orange-700 hover:bg-orange-100 transition"
        >
          + เพิ่มเข้ากองทุน
        </button>
      </div>
    </>
  );
};