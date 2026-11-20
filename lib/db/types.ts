// ============================================================================
// โครงสร้างฐานข้อมูลกลางของระบบสวัสดิการพนักงาน (ใช้ร่วมกันทั้ง 3 บทบาท)
// ไฟล์ข้อมูลจริงเก็บที่ data/db.json (สร้างอัตโนมัติครั้งแรกที่รันระบบ)
// ============================================================================

export type Role = 'user' | 'hr' | 'manager';

// บัญชีเข้าสู่ระบบ
export interface Account {
  username: string; // ชื่อผู้ใช้ (พนักงานใช้รหัสพนักงาน เช่น EMP-001)
  password: string;
  role: Role;
  name: string; // ชื่อที่แสดงบนหัวเว็บ
  employeeId?: string; // ผูกกับทะเบียนพนักงาน (เฉพาะ role = user)
}

// ทะเบียนประวัติพนักงาน (HR เป็นผู้ดูแล)
export interface Employee {
  id: string; // EMP-001
  name: string;
  department: string;
  position: string;
  contractType: string; // พนักงานประจำ / ทดลองงาน / สัญญาจ้าง
  startDate: string; // YYYY-MM-DD
  phone: string;
  email: string;
  bank: string;
  bankAccount: string;
  registeredAddress: string; // ที่อยู่ตามทะเบียนบ้าน
  currentAddress: string; // ที่พักปัจจุบัน
  province: string;
  familyMembers: number;
  createdAt: string;
}

// แบบฟอร์มรับคำขอภัยพิบัติที่ HR เปิด (ผูกกับกองทุนที่ผู้บริหารจัดสรร)
export interface DisasterLevel {
  level: number; // 1, 2, 3
  label: string; // เช่น เสียหายเล็กน้อย
  amount: number; // วงเงินช่วยเหลือของระดับนี้
}
export interface DisasterForm {
  id: string; // F-0001
  disasterType: string; // อุทกภัย ไฟป่า ...
  round: string; // 1/2569
  title: string; // ชื่อแบบฟอร์มที่พนักงานเห็น
  description: string;
  pool: number; // วงเงินของรอบนี้
  openDate: string;
  closeDate: string;
  status: 'draft' | 'open' | 'closed';
  levels: DisasterLevel[];
  createdAt: string;
}

// ไฟล์แนบ (เก็บชื่อไฟล์ และรูปขนาดเล็กเป็น data URL เพื่อให้ HR/ผู้บริหารเปิดดูได้)
export interface Attachment {
  name: string;
  label: string; // รูปภายในบ้าน / ใบเสร็จ ...
  dataUrl?: string;
}

export type WelfareKind = 'self' | 'family_opd' | 'family_ipd';

// สถานะคำขอ: รอ HR ตรวจ → รอผู้บริหาร → อนุมัติ/ไม่อนุมัติ  (returned = HR ส่งกลับให้พนักงานแก้)
export type ClaimStatus = 'pending_hr' | 'returned' | 'pending_mgmt' | 'approved' | 'rejected';

export interface Claim {
  id: string; // DR-0001 (ภัยพิบัติ) / WF-0001 (สวัสดิการทั่วไป)
  type: 'disaster' | 'welfare';
  employeeId: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
  // ภัยพิบัติ
  formId?: string;
  houseType?: string;
  impactFrom?: string;
  impactTo?: string;
  selfLevel?: number; // ระดับที่พนักงานแจ้ง
  // สวัสดิการทั่วไป
  welfareKind?: WelfareKind;
  patientName?: string;
  relation?: string;
  hospital?: string;
  treatDate?: string;
  diagnosis?: string;
  requestedAmount?: number;
  // ร่วม
  currentAddress: string;
  description: string;
  attachments: Attachment[];
  // ผลการตรวจของ HR
  hr?: { level?: number; proposedAmount: number; checks: string[]; note: string; at: string; by: string };
  returnReason?: string;
  // ผลการพิจารณาของผู้บริหาร
  mgmt?: { amount: number; note: string; at: string; by: string; result: 'approved' | 'rejected' | 'returned' };
}

// คำขอแก้ไขข้อมูลส่วนตัว (พนักงานยื่น → HR ยืนยัน)
export interface EditRequest {
  id: string;
  employeeId: string;
  field: keyof Employee;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
  reason: string;
  attachment?: Attachment;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

export interface Notice {
  id: string;
  to: string; // employeeId หรือ 'hr' / 'manager'
  text: string;
  at: string;
  read: boolean;
}

export interface BudgetSettings {
  fiscalYear: string;
  disasterPool: number;
  disasterAnnualCap: number;
  welfarePool: number;
  welfareAnnualCap: number;
  // กฎสวัสดิการทั่วไป
  selfPerVisit: number;
  selfMaxTimes: number;
  familyOpd: number;
  familyIpd: number;
  familyYearCap: number;
}

export interface DisasterFund {
  id: string;
  type: string;
  round: string;
  amount: number;
}

export interface BudgetLog {
  id: string;
  at: string;
  fundType: 'disaster' | 'welfare';
  title: string;
  amount: number;
  detail: string;
  by: string;
}

export interface AuditEntry {
  id: string;
  claimId: string;
  result: 'approved' | 'rejected' | 'returned';
  amount: number;
  note: string;
  at: string;
  by: string;
}

export interface Db {
  rev: number;
  seq: Record<string, number>; // ตัวนับเลขที่เอกสาร
  accounts: Account[];
  employees: Employee[];
  forms: DisasterForm[];
  claims: Claim[];
  edits: EditRequest[];
  notices: Notice[];
  budget: BudgetSettings;
  disasterFunds: DisasterFund[];
  budgetLogs: BudgetLog[];
  audit: AuditEntry[];
}
