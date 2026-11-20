import { BudgetConfig, BudgetHistoryItem, EmployeeRight, AuditLogItem, ApprovalRequest } from '@/types';
// ข้อมูลตัวอย่างถูกลบแล้ว ระบบใช้ข้อมูลจริงจาก data/db.json ผ่าน /api/db
export const INITIAL_BUDGET_CONFIG: BudgetConfig = { fiscalYear: String(new Date().getFullYear() + 543), disasterPool: 0, disasterAnnualCap: 0, welfarePool: 0, welfareAnnualCap: 0 };
export const INITIAL_BUDGET_HISTORY: BudgetHistoryItem[] = [];
