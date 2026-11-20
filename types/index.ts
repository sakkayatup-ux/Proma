// ============================================================================
// 1. ประเภทข้อมูลพื้นฐาน (Union Types) สำหรับควบคุมสถานะและเมนูหลักของระบบ
// ============================================================================

// ชื่อแท็บเมนูหลักทั้ง 4 หน้าในแถบนำทางด้านบน (Header)
export type ModuleTab = 'dashboard' | 'approval' | 'audit' | 'budget';

// ประเภทกองทุนงบประมาณ ('disaster' = ช่วยเหลือภัยพิบัติ, 'welfare' = สวัสดิการทั่วไป)
export type RequestType = 'disaster' | 'welfare';

// สถานะของใบคำขออนุมัติ ('pending' = รออนุมัติ, 'approved' = อนุมัติแล้ว, 'rejected' = ไม่อนุมัติ, 'returned' = ส่งกลับให้ HR แก้ไข)
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'returned';

// ============================================================================
// 2. โครงสร้างข้อมูลส่วนย่อยและใบคำขออนุมัติหลัก (Approval Module & Dashboard)
// ============================================================================

// โครงสร้างการ์ดรูปถ่ายหลักฐานความเสียหาย 3 มุมมองที่แนบในคำขอ
export interface PhotoCardItem {
  title: string; // หัวข้อรูปถ่าย (เช่น รูปภายในบ้าน, รูประดับน้ำ)
  subtitle: string; // คำอธิบายรายละเอียดใต้ภาพ
  bgColor: 'blue' | 'indigo' | 'sky'; // โทนสีพื้นหลังการ์ดตัวอย่างภาพ
}

// โครงสร้างข้อมูลหลักของใบคำขออนุมัติ 1 รายการ (ใช้ทั้งในหน้า Dashboard และหน้า Approval)
export interface ApprovalRequest {
  id: string; // เลขที่ใบคำขอ (เช่น DR-0135, WF-0098)
  employeeId: string; // รหัสพนักงานผู้ยื่นคำขอ (เช่น EMP-089)
  employeeName: string; // ชื่อ-นามสกุลพนักงาน
  department: string; // แผนก/ฝ่ายต้นสังกัด
  position: string; // ตำแหน่งงาน
  type: RequestType; // ประเภทกองทุนที่ขอเบิก
  category: string; // หมวดหมู่ย่อยหรือรอบประกาศภัย (เช่น อุทกภัย รอบ 2/2569)
  roundTitle: string; // หัวข้อรอบภัยพิบัติสำหรับแสดงบนส่วนหัวรายละเอียด
  locationText: string; // พื้นที่ประสบภัยโดยย่อ
  timeAgoText: string; // ข้อความระบุเวลาที่ HR ส่งเรื่องเข้ามา
  severity: 'high' | 'medium' | 'low'; // ระดับความรุนแรงของผลกระทบ ('high' = ระดับ 3, 'medium' = ระดับ 2, 'low' = ระดับ 1)
  severityLabel: string; // ข้อความป้ายกำกับระดับความรุนแรงภาษาไทย
  submittedDate: string; // วันที่ยื่นคำขอ
  proposedAmount: number; // ยอดเงินที่ฝ่าย HR เสนอขออนุมัติ (บาท)
  approvedAmount?: number; // ยอดเงินที่ผู้บริหารอนุมัติจริง (มีค่าเมื่อสถานะเป็น approved)
  status: RequestStatus; // สถานะปัจจุบันของใบคำขอ

  // ส่วนที่ 1: ข้อมูลที่พักอาศัยและเอกสารยืนยันที่อยู่
  registeredAddress: string; // ที่อยู่ตามทะเบียนบ้าน
  currentAddress: string; // ที่อยู่ปัจจุบันที่ได้รับผลกระทบ
  houseType: string; // ลักษณะที่อยู่อาศัย (เช่น บ้านตนเอง, บ้านเช่า)
  houseDocName: string; // ชื่อไฟล์เอกสารที่อยู่แนบ

  // ส่วนที่ 2: รายละเอียดผลกระทบและระยะเวลา
  impactDuration: string; // ช่วงเวลาและจำนวนวันที่ได้รับผลกระทบ
  description: string; // คำชี้แจงรายละเอียดความเสียหายจากพนักงาน

  // ส่วนที่ 3: หลักฐานรูปถ่ายและรายการเอกสารแนบ
  photoCards: PhotoCardItem[]; // ชุดการ์ดรูปถ่ายหลักฐาน 3 ใบ
  documentChecklist: string[]; // รายการเอกสารหลักฐานที่พนักงานแนบมาครบถ้วน

  // ส่วนที่ 4: ผลการกลั่นกรองเบื้องต้นจากฝ่าย HR
  hrScreeningChecks: string[]; // รายการหัวข้อที่ HR ตรวจสอบผ่านแล้ว
  hrNote: string; // บันทึกหมายเหตุเพิ่มเติมจากเจ้าหน้าที่ HR ถึงผู้บริหาร
}

// ============================================================================
// 3. โครงสร้างข้อมูลการตั้งค่างบประมาณและสิทธิ์สะสมรายบุคคล (Budget & Audit)
// ============================================================================

// โครงสร้างการตั้งค่าวงเงินงบประมาณประจำปีและเพดานสิทธิ์ต่อคน
export interface BudgetConfig {
  fiscalYear: string; // ปีงบประมาณ (เช่น '2569')
  disasterPool: number; // วงเงินกองทุนช่วยเหลือภัยพิบัติรวมทั้งปี (บาท)
  disasterAnnualCap: number; // เพดานเบิกภัยพิบัติสูงสุดต่อคนต่อปี (บาท)
  welfarePool: number; // วงเงินกองทุนสวัสดิการทั่วไปรวมทั้งปี (บาท)
  welfareAnnualCap: number; // เพดานเบิกสวัสดิการทั่วไปสูงสุดต่อคนต่อปี (บาท)
  selfPerVisit?: number;
  selfMaxTimes?: number;
  familyOpd?: number;
  familyIpd?: number;
  disasterFunds?: { id: string; type: string; round: string; amount: number }[];
}

// ข้อมูลเสริมที่บันทึกพร้อมงบ (เกณฑ์สวัสดิการ / กองทุนย่อยภัยพิบัติ)
export interface BudgetExtra {
  selfPerVisit?: number;
  selfMaxTimes?: number;
  familyOpd?: number;
  familyIpd?: number;
  disasterFunds?: { id: string; type: string; round: string; amount: number }[];
}

// โครงสร้างยอดใช้สิทธิ์สะสมรายบุคคลของพนักงานแต่ละคน
export interface EmployeeRight {
  employeeId: string; // รหัสพนักงาน
  employeeName: string; // ชื่อ-นามสกุลพนักงาน
  department: string; // แผนกต้นสังกัด
  disasterUsed: number; // ยอดเงินกองทุนภัยพิบัติที่ใช้ไปแล้วในปีนี้ (บาท)
  welfareUsed: number; // ยอดเงินกองทุนสวัสดิการทั่วไปที่ใช้ไปแล้วในปีนี้ (บาท)
}

// ============================================================================
// 4. โครงสร้างข้อมูลบันทึกประวัติย้อนหลัง (Audit Logs & Budget History)
// ============================================================================

// โครงสร้างประวัติการพิจารณาคำขออนุมัติย้อนหลัง 1 รายการ (ใช้ในหน้า Audit)
export interface AuditLogItem {
  id: string; // รหัสอ้างอิงบันทึกประวัติ (เช่น LOG-005)
  requestId: string; // เลขที่ใบคำขอเดิมที่พิจารณา
  employeeId: string; // รหัสพนักงานผู้ขอเบิก
  employeeName: string; // ชื่อ-นามสกุลพนักงาน
  department: string; // แผนกต้นสังกัด
  type: RequestType; // ประเภทกองทุน
  category: string; // หมวดหมู่/รอบประกาศภัย
  proposedAmount: number; // ยอดเงินที่ HR เสนอ
  approvedAmount: number; // ยอดเงินที่ผู้บริหารอนุมัติจริง (เป็น 0 หากไม่อนุมัติหรือส่งคืน)
  status: 'approved' | 'rejected' | 'returned'; // ผลการพิจารณาสุดท้าย
  actionDate: string; // วันและเวลาที่ผู้บริหารกดทำรายการ
  approverName: string; // ชื่อผู้บริหารที่ทำรายการ
  note: string; // เหตุผลหรือหมายเหตุประกอบการพิจารณา
}

// โครงสร้างประวัติการแก้ไขวงเงินงบประมาณย้อนหลัง 1 รายการ (ใช้ในหน้า Budget)
export interface BudgetHistoryItem {
  id: string; // รหัสอ้างอิงประวัติการปรับงบ (เช่น BH-003)
  date: string; // วันและเวลาที่บันทึกการปรับปรุงงบประมาณ
  fundType: RequestType; // ประเภทกองทุนที่ถูกปรับแก้ไข
  fundName: string; // ชื่อหัวข้อรายการที่ปรับปรุง
  changeSummary: string; // สรุปวงเงินรวมใหม่สุทธิ (เช่น '฿800,000')
  reason: string; // รายละเอียดเงื่อนไข/เกณฑ์ที่ตั้งค่า (คั่นด้วย '|' เพื่อแยกแสดงเป็น Tag)
  updatedBy: string; // ชื่อผู้บริหารที่อนุมัติการปรับงบ
}