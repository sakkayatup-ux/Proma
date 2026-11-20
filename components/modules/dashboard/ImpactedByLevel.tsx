import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { ApprovalRequest } from '@/types'; // นำเข้าโครงสร้างข้อมูลรายการคำขออนุมัติ

// กำหนดโครงสร้างข้อมูล (Props) ที่การ์ดแสดงผู้ได้รับผลกระทบตามระดับต้องรับเข้ามา
interface ImpactedByLevelProps {
  requests: ApprovalRequest[]; // รายการคำขออนุมัติทั้งหมด (ใช้กรองนับจำนวนตามระดับความรุนแรง)
}

export const ImpactedByLevel: React.FC<ImpactedByLevelProps> = ({ requests }) => {
  // 1. จัดกลุ่มข้อมูลคำขอตามระดับความรุนแรง 3 ระดับ พร้อมกำหนดสีแถบกราฟของแต่ละระดับ
  const levels = [
    {
      label: 'ระดับ 1', // ผลกระทบเล็กน้อย
      count: requests.filter((r) => r.severity === 'low').length, // นับจำนวนคำขอระดับ low
      barColor: 'bg-slate-300', // สีเทาอ่อน
    },
    {
      label: 'ระดับ 2', // ผลกระทบปานกลาง
      count: requests.filter((r) => r.severity === 'medium').length, // นับจำนวนคำขอระดับ medium
      barColor: 'bg-blue-600', // สีน้ำเงิน
    },
    {
      label: 'ระดับ 3', // ผลกระทบรุนแรงมาก
      count: requests.filter((r) => r.severity === 'high').length, // นับจำนวนคำขอระดับ high
      barColor: 'bg-slate-900', // สีดำเข้มเน้นความสำคัญสูงสุด
    },
  ];

  // 2. หาจำนวนคนสูงสุดใน 3 ระดับเพื่อใช้เป็นฐาน 100% ของความยาวแท่งกราฟ (ใช้ Math.max(1, ...) ป้องกันการหารด้วย 0)
  const maxCount = Math.max(1, ...levels.map((l) => l.count));

  return (
    // กล่องการ์ดสีขาว ขอบมน ความสูงเต็มพื้นที่คอลัมน์ (h-full) เพื่อให้เท่ากับการ์ดข้างเคียง
    <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100 h-full">
      {/* หัวข้อการ์ด */}
      <h3 className="text-base font-bold text-slate-900 mb-5">
        ผู้ได้รับผลกระทบแยกตามระดับ
      </h3>

      {/* รายการแถบกราฟแนวนอนทั้ง 3 ระดับ */}
      <div className="space-y-5">
        {levels.map((lvl) => {
          // คำนวณความยาวแท่งกราฟเป็นเปอร์เซ็นต์เทียบกับกลุ่มที่มีจำนวนคนมากที่สุด
          const pct = lvl.count === 0 ? 0 : Math.round((lvl.count / maxCount) * 100);

          return (
            <div key={lvl.label}>
              {/* แถวบน: ชื่อระดับทางซ้าย และจำนวนคนทางขวา */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                <span>{lvl.label}</span>
                <span>{lvl.count} คน</span>
              </div>

              {/* แถวล่าง: หลอดกราฟแท่งแนวนอนแสดงสัดส่วน */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  style={{ width: `${pct}%` }}
                  className={`h-full rounded-full ${lvl.barColor} transition-all duration-300`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};