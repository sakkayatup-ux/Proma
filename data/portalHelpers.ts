import {
  ApprovalRequest,
  AuditLogItem,
  BudgetConfig,
  BudgetHistoryItem,
  EmployeeRight,
} from '@/types'; // นำเข้าโครงสร้างข้อมูลมาตรฐานทั้งหมดของระบบ

// ชื่อผู้อนุมัติระดับบริหารเริ่มต้น (ใช้บันทึกในประวัติการพิจารณาคำขอและการปรับงบประมาณ)
export const APPROVER_NAME = 'ผู้บริหาร';
export const APPROVER_SHORT = 'ผู้บริหาร';

// ฟังก์ชันสร้างข้อความวันเวลาภาษาไทยปัจจุบัน (withSuffix = true จะใส่วงเล็บเวลาสำหรับตารางประวัติงบ)
export const getThaiTimestamp = (withSuffix = false) => {
  const d = new Date();
  const M = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const date = `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear() + 543}`;
  const time = d.toTimeString().slice(0, 5);
  return withSuffix ? `${date} (${time} น.)` : `${date} • ${time}`;
};

// ============================================================================
// 1. คำนวณยอดสรุปงบประมาณทั้งหมดแบบ Real-time (เรียกใช้ในหน้าหลัก page.tsx)
// ============================================================================
export const calculateBudgetSummary = (
  requests: ApprovalRequest[],
  budgetConfig: BudgetConfig
) => {
  // ฟังก์ชันย่อยสำหรับกรองและรวมยอดเงินตามประเภทกองทุน (disaster/welfare) และสถานะ (approved/pending)
  const sumBy = (type: 'disaster' | 'welfare', status: 'approved' | 'pending') =>
    requests
      .filter((r) => r.type === type && r.status === status)
      .reduce(
        (sum, r) =>
          // ถ้าอนุมัติแล้วให้ใช้ยอดที่อนุมัติจริง (approvedAmount) ถ้ารออนุมัติให้ใช้ยอดที่ HR เสนอ (proposedAmount)
          sum + (status === 'approved' ? (r.approvedAmount ?? r.proposedAmount) : r.proposedAmount),
        0
      );

  const usedDisaster = sumBy('disaster', 'approved'); // ยอดงบภัยพิบัติที่จ่ายจริงแล้ว
  const pendingDisaster = sumBy('disaster', 'pending'); // ยอดงบภัยพิบัติที่รออนุมัติ
  const usedWelfare = sumBy('welfare', 'approved'); // ยอดงบสวัสดิการทั่วไปที่จ่ายจริงแล้ว
  const pendingWelfare = sumBy('welfare', 'pending'); // ยอดงบสวัสดิการทั่วไปที่รออนุมัติ

  return {
    usedDisaster,
    pendingDisaster,
    usedWelfare,
    pendingWelfare,
    // คำนวณงบคงเหลือสุทธิ (หักทั้งยอดจ่ายจริงและยอดรออนุมัติออก เพื่อป้องกันการอนุมัติเกินวงเงิน)
    remainingDisasterBudget: Math.max(0, budgetConfig.disasterPool - usedDisaster - pendingDisaster),
    remainingWelfareBudget: Math.max(0, budgetConfig.welfarePool - usedWelfare - pendingWelfare),
    // นับจำนวนเคสทั้งหมดที่ยังรอผู้บริหารพิจารณา
    pendingCount: requests.filter((r) => r.status === 'pending').length,
  };
};

// ============================================================================
// 2. อัปเดตยอดใช้สิทธิ์สะสมรายบุคคลเมื่อผู้บริหารกดอนุมัติคำขอ (ใช้ใน page.tsx)
// ============================================================================
export const updateEmployeeRightsList = (
  prev: EmployeeRight[],
  req: ApprovalRequest,
  amount: number
): EmployeeRight[] => {
  // ตรวจสอบว่าพนักงานคนนี้มีประวัติในตารางสิทธิ์อยู่แล้วหรือไม่
  const exists = prev.some((e) => e.employeeId === req.employeeId);

  // กรณีเป็นพนักงานใหม่ที่ยังไม่เคยเบิกมาก่อน ให้เพิ่มข้อมูลพนักงานคนนี้เข้าไปในรายการ
  if (!exists) {
    return [
      ...prev,
      {
        employeeId: req.employeeId,
        employeeName: req.employeeName,
        department: req.department,
        disasterUsed: req.type === 'disaster' ? amount : 0,
        welfareUsed: req.type === 'welfare' ? amount : 0,
      },
    ];
  }

  // กรณีมีชื่ออยู่แล้ว ให้บวกยอดเงินที่อนุมัติครั้งนี้เพิ่มเข้าไปในหมวดกองทุนที่ตรงกัน
  return prev.map((emp) =>
    emp.employeeId === req.employeeId
      ? {
          ...emp,
          disasterUsed: req.type === 'disaster' ? emp.disasterUsed + amount : emp.disasterUsed,
          welfareUsed: req.type === 'welfare' ? emp.welfareUsed + amount : emp.welfareUsed,
        }
      : emp
  );
};

// ============================================================================
// 3. สร้างรายการประวัติการอนุมัติ / ปฏิเสธ / ส่งคืน (Audit Log) (ใช้ใน page.tsx)
// ============================================================================
export const createAuditLog = (
  req: ApprovalRequest,
  status: 'approved' | 'rejected' | 'returned',
  approvedAmount: number,
  note: string
): AuditLogItem => ({
  id: `LOG-${Date.now()}`, // สร้างรหัส Log ไม่ซ้ำจากเวลาปัจจุบัน
  requestId: req.id, // อ้างอิงเลขที่ใบคำขอ
  employeeId: req.employeeId,
  employeeName: req.employeeName,
  department: req.department,
  type: req.type,
  category: req.category,
  proposedAmount: req.proposedAmount, // ยอดที่ HR เสนอ
  approvedAmount, // ยอดที่อนุมัติจริง (จะเป็น 0 หากปฏิเสธหรือส่งคืน)
  status, // ผลการพิจารณา
  actionDate: getThaiTimestamp(false), // วันเวลาที่กดทำรายการ
  approverName: APPROVER_NAME, // ชื่อผู้บริหารที่ทำรายการ
  note, // หมายเหตุประกอบการตัดสินใจ
});

// ============================================================================
// 4. สร้างรายการประวัติการปรับปรุงวงเงินงบประมาณ (ใช้ใน page.tsx)
// ============================================================================
export const createBudgetHistory = (
  fundType: 'welfare' | 'disaster',
  newPool: number,
  newCap: number,
  reason: string
): BudgetHistoryItem => ({
  id: `BH-${Date.now()}`, // สร้างรหัสประวัติงบประมาณไม่ซ้ำจากเวลาปัจจุบัน
  date: getThaiTimestamp(true), // วันเวลาที่บันทึกการแก้ไข
  fundType,
  fundName:
    fundType === 'disaster'
      ? 'ปรับปรุงงบช่วยเหลือภัยพิบัติประจำปี 2569'
      : 'ปรับปรุงงบสวัสดิการทั่วไปประจำปี 2569',
  changeSummary: `฿${newPool.toLocaleString()}`, // วงเงินรวมใหม่สุทธิ
  // รวมรายละเอียดทั้งหมดคั่นด้วย '|' เพื่อให้ BudgetHistoryTable แยกแสดงเป็นป้าย Tag ย่อยได้ทันที
  reason: `วงเงินรวมทั้งปี: ฿${newPool.toLocaleString()} | เพดานต่อคนต่อปี: ฿${newCap.toLocaleString()} / คน / ปี${
    reason ? ` | ${reason}` : ''
  }`,
  updatedBy: APPROVER_SHORT,
});

// ============================================================================
// 5. ชุดข้อมูลรูปถ่ายหลักฐานและเช็กลิสต์เอกสารสำหรับหน้าต่างดูหลักฐานย้อนหลัง
// ============================================================================
export const getLogEvidenceConfig = (isDisaster: boolean) => ({
  // แยกชุดการ์ดหลักฐานตามประเภทกองทุน (ภัยพิบัติ = รูปความเสียหาย, สวัสดิการ = ใบเสร็จ/ใบรับรองแพทย์)
  photoCards: isDisaster
    ? [
        {
          title: 'รูปภายในบ้าน',
          subtitle: 'น้ำท่วมชั้นล่างบ้านพักอาศัย',
          style: 'bg-blue-50/70 border-blue-100',
        },
        {
          title: 'รูปเครื่องใช้',
          subtitle: 'เครื่องใช้ไฟฟ้าเสียหาย',
          style: 'bg-indigo-50/70 border-indigo-100',
        },
        {
          title: 'รูประดับน้ำ',
          subtitle: 'ระดับน้ำสูง 1.5 เมตร',
          style: 'bg-sky-50/70 border-sky-100',
        },
      ]
    : [
        {
          title: 'ใบเสร็จรับเงินตัวจริง',
          subtitle: 'ค่ารักษาพยาบาลผู้ป่วยนอก',
          style: 'bg-blue-50/70 border-blue-100',
        },
        {
          title: 'ใบรับรองแพทย์',
          subtitle: 'ระบุอาการและวันที่เข้ารับการรักษา',
          style: 'bg-indigo-50/70 border-indigo-100',
        },
        {
          title: 'สำเนาบัตรพนักงาน',
          subtitle: 'ยืนยันสิทธิ์สวัสดิการครอบครัว',
          style: 'bg-sky-50/70 border-sky-100',
        },
      ],
  // รายการเช็กลิสต์เอกสารที่ตรวจสอบแล้ว
  documentChecklist: [
    'รูปถ่ายความเสียหาย (อย่างน้อย 3 รูป)',
    'สำเนาทะเบียนบ้าน / สัญญาเช่า',
    'หนังสือรับรองจากผู้นำชุมชน (ถ้ามี)',
  ],
});

// ============================================================================
// 6. ตัวเลือกประเภทภัยพิบัติมาตรฐานและโครงสร้างข้อมูลกองทุนย่อย
// ============================================================================
export const DISASTER_TYPES = ['อุทกภัย', 'ไฟป่า', 'วาตภัย', 'อัคคีภัย', 'แผ่นดินไหว'] as const;

export interface DisasterFundItem {
  id: string; // รหัสอ้างอิงกองทุนย่อย
  type: string; // ประเภทภัยพิบัติ (เช่น อุทกภัย, ไฟป่า)
  round: string; // รอบประกาศภัย (เช่น 2/2569)
  amount: number; // วงเงินที่จัดสรรให้กองทุนย่อยนี้ (บาท)
}