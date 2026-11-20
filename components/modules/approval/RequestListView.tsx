import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { ApprovalRequest, BudgetConfig, EmployeeRight } from '@/types'; // นำเข้าโครงสร้างข้อมูลคำขอ, การตั้งค่างบ และสิทธิ์รายบุคคล

// กำหนดโครงสร้างข้อมูล (Props) ที่หน้ารวมรายการคำขอต้องรับมาจาก ApprovalModule (index.tsx)
interface RequestListViewProps {
  requests: ApprovalRequest[]; // รายการคำขอเบิกเงินทั้งหมดในระบบ
  budgetConfig: BudgetConfig; // การตั้งค่าเพดานสิทธิ์สูงสุดต่อคนต่อปี (สำหรับเช็กยอดเกินสิทธิ์)
  employeeRights: EmployeeRight[]; // ประวัติยอดใช้สิทธิ์สะสมรายบุคคลของพนักงานทุกคน
  onSelectRequest: (request: ApprovalRequest) => void; // ฟังก์ชันเมื่อคลิกเลือกคำขอเพื่อเข้าไปพิจารณารายละเอียด
}

export const RequestListView: React.FC<RequestListViewProps> = ({
  requests,
  budgetConfig,
  employeeRights,
  onSelectRequest,
}) => {
  // กรองเอาเฉพาะคำขอที่ยังมีสถานะ "รออนุมัติ (pending)" มาแสดงในรายการ
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  // ฟังก์ชันตรวจสอบเบื้องต้นว่าคำขอรายการนี้มียอดที่ HR เสนอเกินสิทธิ์คงเหลือของพนักงานคนนั้นหรือไม่
  const checkIsOverLimit = (req: ApprovalRequest) => {
    // 1. หาเพดานสูงสุดต่อปีตามประเภทกองทุน (ภัยพิบัติ หรือ สวัสดิการ)
    const cap =
      req.type === 'disaster'
        ? budgetConfig.disasterAnnualCap
        : budgetConfig.welfareAnnualCap;
    // 2. ค้นหาประวัติการใช้สิทธิ์ในปีนี้ของพนักงานเจ้าของคำขอ
    const emp = employeeRights.find((e) => e.employeeId === req.employeeId);
    // 3. ดึงยอดเงินที่เคยเบิกไปแล้ว (ถ้าไม่เคยเบิกเลยให้เป็น 0)
    const used = emp
      ? req.type === 'disaster'
        ? emp.disasterUsed
        : emp.welfareUsed
      : 0;
    // 4. คำนวณสิทธิ์คงเหลือ (ป้องกันติดลบ) แล้วเทียบกับยอดที่ HR เสนอเข้ามา
    const remaining = Math.max(0, cap - used);
    return req.proposedAmount > remaining;
  };

  return (
    // กล่องการ์ดใหญ่สีขาว ขอบมน ครอบรายการคำขอทั้งหมด
    <div className="rounded-3xl bg-white p-7 shadow-xs border border-slate-100">
      {/* 1. ส่วนหัวการ์ดใหญ่: ชื่อหัวข้อ + คำอธิบาย + ป้ายสรุปจำนวนเคสรออนุมัติ */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            คำขอที่รอการพิจารณาอนุมัติ
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            โปรดเลือกรายการพนักงานที่ HR กลั่นกรองแล้วเพื่อพิจารณาเคาะวงเงิน
          </p>
        </div>

        {/* ป้ายสีแดงแสดงจำนวนคำขอที่ค้างพิจารณาทั้งหมด */}
        <span className="rounded-full bg-rose-500 px-4 py-1.5 text-xs font-bold text-white shadow-xs">
          รออนุมัติ {pendingRequests.length} รายการ
        </span>
      </div>

      {/* 2. ส่วนแสดงรายการคำขอ (ถ้าไม่มีเคสค้างอยู่ให้แสดงข้อความแจ้งเตือนแทน) */}
      {pendingRequests.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 py-14 text-center text-xs text-slate-400">
          ไม่มีรายการคำขอที่รอการพิจารณาอนุมัติในขณะนี้
        </div>
      ) : (
        <div className="space-y-3.5">
          {pendingRequests.map((item) => {
            const isOver = checkIsOverLimit(item); // เช็กว่าเคสนี้ขอเกินสิทธิ์หรือไม่
            const [prefix, num] = item.id.split('-'); // แยกรหัสคำขอ (เช่น "REQ-001" -> ["REQ", "001"]) เพื่อจัดวาง 2 บรรทัดในวงกลม

            return (
              // การ์ดรายการคำขอแต่ละแถว (คลิกได้ทั้งแถวเพื่อเปิดหน้ารายละเอียด)
              <div
                key={item.id}
                onClick={() => onSelectRequest(item)}
                className="group cursor-pointer rounded-2xl border border-slate-100 bg-white px-5 py-4 hover:border-blue-200 hover:bg-slate-50/50 transition flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* ฝั่งซ้ายของแถว: วงกลมรหัสเคส + ชื่อพนักงาน + ป้ายความรุนแรง + รายละเอียดสถานที่และเวลา */}
                <div className="flex items-center gap-4">
                  {/* วงกลมแสดงเลขรหัสคำขอ 2 บรรทัด */}
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold leading-tight text-slate-800">
                    <span>{prefix}-</span>
                    <span>{num}</span>
                  </div>

                  {/* ข้อมูลชื่อพนักงาน รหัส ป้ายสถานะ และหัวข้อคำขอ */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-blue-600">
                        {item.employeeName}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {item.employeeId}
                      </span>
                      {/* ป้ายแสดงระดับความรุนแรง (สีแดงถ้าความรุนแรงสูง สีเหลืองอำพันถ้าปานกลาง) */}
                      <span
                        className={`rounded-full px-3 py-0.5 text-[11px] font-semibold ${
                          item.severity === 'high'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {item.severityLabel}
                        {isOver ? ' • ยอดเกินสิทธิ์' : ''}
                      </span>
                    </div>

                    {/* บรรทัดรายละเอียดย่อย: ชื่อรอบกองทุน สถานที่ และเวลาที่ยื่นคำขอ */}
                    <p className="mt-1 text-xs text-slate-500">
                      {item.roundTitle} • {item.locationText} • {item.timeAgoText}
                    </p>
                  </div>
                </div>

                {/* ฝั่งขวาของแถว: ยอดเงินที่ HR เสนอ และปุ่มกดเข้าไปพิจารณา */}
                <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="block text-[11px] text-slate-400">
                      HR เสนอวงเงิน
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      ฿{item.proposedAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* ปุ่มเลือกพิจารณา (ใส่ stopPropagation กันอีเวนต์คลิกซ้อนกับกรอบนอก) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRequest(item);
                    }}
                    className="rounded-full bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-xs"
                  >
                    เลือกพิจารณา →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};