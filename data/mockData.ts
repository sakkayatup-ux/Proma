/**
 * ไฟล์ศูนย์กลางรวบรวมข้อมูลจำลองเริ่มต้น (Mock Data Entry Point)
 * 
 * หน้าที่การทำงาน:
 * ทำหน้าที่เป็นตัวกลางรวบรวมและส่งออก (Re-export) ข้อมูลตั้งต้นทั้งหมดที่แยกเก็บไว้ในไฟล์ย่อย 3 ไฟล์
 * เพื่อให้ Component และหน้าเว็บอื่นๆ สามารถเรียกใช้ผ่าน '@/data/mockData' ได้จากจุดเดียวโดยไม่ต้องแก้ path
 */

// 1. ส่งออกข้อมูลการตั้งค่างบประมาณหลัก (disasterPool, welfarePool) และประวัติการปรับงบประจำปี
export { INITIAL_BUDGET_CONFIG, INITIAL_BUDGET_HISTORY } from './mockBudget';

// 2. ส่งออกข้อมูลยอดใช้สิทธิ์สะสมรายบุคคลของพนักงาน และประวัติการอนุมัติ/ปฏิเสธย้อนหลัง (Audit Logs)
export { INITIAL_EMPLOYEE_RIGHTS, INITIAL_AUDIT_LOGS } from './mockLogsAndRights';

// 3. ส่งออกรายการคำขอเบิกเงินทั้งหมด (ทั้งรายการที่รออนุมัติและรายการที่อนุมัติไปแล้ว)
export { INITIAL_REQUESTS } from './mockRequests';