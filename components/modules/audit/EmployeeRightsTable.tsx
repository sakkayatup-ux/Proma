import React from 'react'; // นำเข้า React สำหรับสร้าง Component
import { AuditLogItem, BudgetConfig, EmployeeRight } from '@/types'; // นำเข้าโครงสร้างข้อมูลประวัติคำขอ, การตั้งค่างบ และสิทธิ์รายบุคคล

// กำหนดโครงสร้างข้อมูล (Props) ที่ตารางสรุปสิทธิ์รายพนักงานต้องรับมาจาก AuditModule
interface EmployeeRightsTableProps {
  employeeRights: EmployeeRight[]; // รายชื่อและยอดใช้สิทธิ์สะสมรายบุคคลของพนักงานทุกคน
  selectedEmployeeId: string; // รหัสพนักงานที่กำลังคลิกเลือกดูรายละเอียดอยู่
  onSelectEmployee: (employeeId: string) => void; // ฟังก์ชันเมื่อคลิกแถวพนักงานเพื่อสลับดูข้อมูลฝั่งขวา
  logs: AuditLogItem[]; // รายการประวัติการอนุมัติทั้งหมด (ใช้ดึงประวัติย่อยของพนักงานคนที่เลือก)
  budgetConfig: BudgetConfig; // การตั้งค่าปีงบประมาณและเพดานสิทธิ์สูงสุดต่อคนต่อปี
}

export const EmployeeRightsTable: React.FC<EmployeeRightsTableProps> = ({
  employeeRights,
  selectedEmployeeId,
  onSelectEmployee,
  logs,
  budgetConfig,
}) => {
  // 1. ดึงเพดานวงเงินภัยพิบัติสูงสุดต่อคนต่อปีมาเป็นเกณฑ์คำนวณ
  const cap = budgetConfig.disasterAnnualCap;

  // 2. ฟังก์ชันกรองประวัติเฉพาะเคสที่ "อนุมัติแล้ว" ของพนักงานรหัสที่ระบุ
  const getEmployeeClaimLogs = (empId: string) =>
    logs.filter((l) => l.employeeId === empId && l.status === 'approved');

  // 3. ค้นหาข้อมูลพนักงานคนที่กำลังเลือกดูรายละเอียด (ถ้าไม่เจอให้ดึงคนแรกในรายการเป็นค่าเริ่มต้น)
  const selectedEmp =
    employeeRights.find((e) => e.employeeId === selectedEmployeeId) ||
    employeeRights[0];

  // 4. คำนวณข้อมูลสถิติเฉพาะของพนักงานคนที่เลือกแสดงในการ์ดฝั่งขวา
  const selectedEmpLogs = selectedEmp ? getEmployeeClaimLogs(selectedEmp.employeeId) : []; // รายการประวัติที่อนุมัติแล้ว
  const selectedUsed = selectedEmp ? selectedEmp.disasterUsed : 0; // ยอดเงินที่เบิกใช้ไปแล้วทั้งหมดในปีนี้
  const selectedIsMaxed = selectedUsed >= cap; // เช็กว่าเบิกครบเพดาน 100% หรือยัง
  const selectedPct = cap > 0 ? Math.min(100, (selectedUsed / cap) * 100) : 0; // คำนวณเปอร์เซ็นต์หลอดพลังการใช้สิทธิ์

  return (
    // แบ่งพื้นที่ 3 คอลัมน์บนจอใหญ่ (ซ้าย 2 ส่วน: ตารางรายชื่อ, ขวา 1 ส่วน: การ์ดรายละเอียดรายบุคคล)
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 items-start">
      {/* ฝั่งซ้าย (2 คอลัมน์): ตารางสรุปสิทธิ์รายพนักงาน */}
      <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-xs border border-slate-100">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          สรุปสิทธิ์รายพนักงาน (ปี {budgetConfig.fiscalYear})
        </h3>

        {/* ตารางรองรับการเลื่อนแนวนอนบนหน้าจอมือถือ */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* หัวตาราง 5 คอลัมน์ */}
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                <th className="py-3 pr-3">พนักงาน</th>
                <th className="py-3 px-3">เบิก (ครั้ง)</th>
                <th className="py-3 px-3">ได้รับรวม</th>
                <th className="py-3 px-3">คงเหลือ/เพดาน</th>
                <th className="py-3 pl-3 text-right">สถานะสิทธิ์</th>
              </tr>
            </thead>

            {/* เนื้อหาตารางรายชื่อพนักงานแต่ละแถว */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {employeeRights.map((emp) => {
                const used = emp.disasterUsed; // ยอดเงินที่ใช้ไปแล้ว
                const remain = Math.max(0, cap - used); // ยอดสิทธิ์คงเหลือ (ป้องกันติดลบ)
                const pct = cap > 0 ? Math.min(100, (used / cap) * 100) : 0; // เปอร์เซ็นต์การใช้สิทธิ์สำหรับหลอด Progress Bar
                const isMaxed = used >= cap; // สถานะเบิกครบเพดาน (100%)
                const isNear = !isMaxed && used >= cap * 0.8; // สถานะใกล้ครบเพดาน (80% - 99%)
                const isSelected = selectedEmp?.employeeId === emp.employeeId; // เช็กว่าแถวนี้กำลังถูกคลิกเลือกอยู่หรือไม่
                const claimCount = Math.max(
                  getEmployeeClaimLogs(emp.employeeId).length,
                  used > 0 ? 1 : 0
                ); // นับจำนวนครั้งที่เบิกสำเร็จ

                return (
                  // แถวข้อมูลพนักงาน (คลิกเพื่อดูรายละเอียดฝั่งขวา และไฮไลต์พื้นหลังสีเหลืองอ่อนเมื่อถูกเลือก)
                  <tr
                    key={emp.employeeId}
                    onClick={() => onSelectEmployee(emp.employeeId)}
                    className={`cursor-pointer transition ${
                      isSelected ? 'bg-amber-50/60' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* คอลัมน์ที่ 1: ชื่อพนักงาน และ รหัสประจำตัว */}
                    <td className="py-3.5 pr-3">
                      <p className="font-bold text-slate-900">{emp.employeeName}</p>
                      <p className="text-[11px] text-slate-400">{emp.employeeId}</p>
                    </td>
                    {/* คอลัมน์ที่ 2: จำนวนครั้งที่เบิก */}
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {claimCount} ครั้ง
                    </td>
                    {/* คอลัมน์ที่ 3: ยอดเงินที่ได้รับรวมในปีนี้ */}
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      ฿{used.toLocaleString()}
                    </td>
                    {/* คอลัมน์ที่ 4: หลอด Progress Bar + ตัวเลขสิทธิ์คงเหลือ */}
                    <td className="py-3.5 px-3">
                      <div className="w-28">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 mb-1.5">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full ${
                              isMaxed
                                ? 'bg-rose-500' // สีแดงเมื่อครบเพดาน
                                : isNear
                                ? 'bg-amber-500' // สีเหลืองอำพันเมื่อใกล้ครบ
                                : 'bg-emerald-500' // สีเขียวเมื่อยังเหลือสิทธิ์เยอะ
                            }`}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          เหลือ ฿{remain.toLocaleString()}
                        </p>
                      </div>
                    </td>
                    {/* คอลัมน์ที่ 5: ป้ายสถานะสิทธิ์ด้านขวาสุด */}
                    <td className="py-3.5 pl-3 text-right">
                      {isMaxed ? (
                        <span className="inline-block rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-600">
                          เบิกครบแล้ว
                        </span>
                      ) : isNear ? (
                        <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-600">
                          ใกล้ครบ
                        </span>
                      ) : (
                        <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
                          ยังเบิกได้
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ฝั่งขวา (1 คอลัมน์): การ์ดเจาะลึกรายละเอียดการใช้สิทธิ์ของพนักงานคนที่คลิกเลือก */}
      {selectedEmp && (
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-slate-100 space-y-4">
          {/* 1. ส่วนหัวการ์ด: ชื่อพนักงาน + รหัส + แผนก + ป้ายสถานะ */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {selectedEmp.employeeName} • {selectedEmp.employeeId}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {selectedEmp.department} •{' '}
                {selectedIsMaxed
                  ? `เบิกครบแล้วปี ${budgetConfig.fiscalYear}`
                  : `เหลือสิทธิ์ ฿${Math.max(0, cap - selectedUsed).toLocaleString()}`}
              </p>
            </div>

            {selectedIsMaxed ? (
              <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">
                เบิกครบแล้ว
              </span>
            ) : (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                ยังเบิกได้
              </span>
            )}
          </div>

          {/* 2. หลอดแสดงสัดส่วนวงเงินที่ใช้ไปเทียบกับเพดานประจำปี */}
          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-2">
              <div
                style={{ width: `${selectedPct}%` }}
                className={`h-full rounded-full ${
                  selectedIsMaxed ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              />
            </div>
            <p className="text-xs font-bold text-slate-800">
              ได้รับรวม ฿{selectedUsed.toLocaleString()} / เพดาน ฿
              {cap.toLocaleString()}
            </p>
          </div>

          {/* 3. รายการประวัติคำขอทั้งหมดของพนักงานคนนี้ที่ได้รับการอนุมัติแล้ว */}
          <div className="space-y-3 border-t border-slate-100 pt-3">
            {selectedEmpLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">
                ยังไม่มีประวัติการอนุมัติในรอบปีนี้
              </p>
            ) : (
              selectedEmpLogs.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-2 text-xs"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                    <div>
                      <p className="font-bold text-slate-800">
                        {item.requestId} • {item.category}
                      </p>
                      <p className="text-[11px] text-slate-400">{item.actionDate}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    ฿{item.approvedAmount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* 4. กล่องแจ้งเตือนสีแดง (แสดงเฉพาะกรณีที่พนักงานคนนี้ใช้สิทธิ์เต็มเพดานแล้ว) */}
          {selectedIsMaxed && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 text-[11px] font-semibold text-rose-600 leading-relaxed">
              ถ้ามีคำขอใหม่ของพนักงานคนนี้ ระบบจะติดป้าย &quot;ครบเพดาน&quot; ให้ HR และผู้บริหารเห็นก่อนพิจารณา
            </div>
          )}
        </div>
      )}
    </div>
  );
};