import { Db } from './types';

// ข้อมูลตั้งต้นตอนเริ่มใช้งานจริง: ไม่มีข้อมูลตัวอย่าง
// มีแค่บัญชี HR และผู้บริหารไว้เข้าระบบครั้งแรก (เปลี่ยนรหัสผ่านได้ในไฟล์ data/db.json)
// พนักงานจะได้บัญชีอัตโนมัติเมื่อ HR เพิ่มเข้าทะเบียน
export const createEmptyDb = (): Db => ({
  rev: 1,
  seq: {},
  accounts: [
    { username: 'hr', password: 'hr1234', role: 'hr', name: 'ฝ่ายทรัพยากรบุคคล' },
    { username: 'manager', password: 'manager1234', role: 'manager', name: 'ผู้บริหาร' },
  ],
  employees: [],
  forms: [],
  claims: [],
  edits: [],
  notices: [],
  budget: {
    fiscalYear: String(new Date().getFullYear() + 543),
    disasterPool: 0,
    disasterAnnualCap: 0,
    welfarePool: 0,
    welfareAnnualCap: 0,
    // กฎสวัสดิการทั่วไปตามประกาศบริษัท (ผู้บริหารแก้ได้ในหน้ากำหนดงบประมาณ)
    selfPerVisit: 1000,
    selfMaxTimes: 30,
    familyOpd: 2000,
    familyIpd: 20000,
    familyYearCap: 30000,
  },
  disasterFunds: [],
  budgetLogs: [],
  audit: [],
});
