import React, { useState } from 'react'; // นำเข้า React และ useState สำหรับควบคุมการเปิด/ปิด Modal และยอดเงินชั่วคราว
import { ApprovalRequest, BudgetConfig, EmployeeRight } from '@/types'; // นำเข้าโครงสร้างข้อมูลหลัก
import { RequestListView } from './RequestListView'; // นำเข้าหน้ารวมรายการคำขอ (แสดงเมื่อยังไม่เลือกเคส)
import { ApprovalDetailView } from './ApprovalDetailView'; // นำเข้าหน้ารายละเอียดคำขอ (แสดงเมื่อคลิกเลือกเคสแล้ว)
import { ConfirmApproveModal } from './modals/ConfirmApproveModal'; // นำเข้า Modal ยืนยันการอนุมัติ
import { SuccessApproveModal } from './modals/SuccessApproveModal'; // นำเข้า Modal แจ้งเตือนอนุมัติสำเร็จ
import { RejectModal } from './modals/RejectModal'; // นำเข้า Modal ไม่อนุมัติคำขอ
import { OverLimitModal } from './modals/OverLimitModal'; // นำเข้า Modal แจ้งเตือนยอดเกินสิทธิ์

// กำหนดโครงสร้างข้อมูล (Props) ที่โมดูลอนุมัติต้องรับมาจากหน้าหลัก (page.tsx)
interface ApprovalModuleProps {
  requests: ApprovalRequest[]; // รายการคำขอเบิกเงินทั้งหมดในระบบ
  selectedRequestId: string | null; // รหัสคำขอที่กำลังคลิกเปิดดูอยู่ (null = อยู่หน้ารายการรวม)
  onSelectRequest: (id: string | null) => void; // ฟังก์ชันเปลี่ยนรหัสคำขอที่เลือก (ส่ง null เพื่อกลับหน้ารายการ)
  budgetConfig: BudgetConfig; // การตั้งค่าวงเงินรวมและเพดานต่อคนต่อปี
  employeeRights: EmployeeRight[]; // ประวัติยอดใช้สิทธิ์สะสมรายบุคคลของพนักงานทุกคน
  remainingDisasterBudget: number; // งบประมาณกองทุนภัยพิบัติคงเหลือล่าสุด
  remainingWelfareBudget: number; // งบประมาณกองทุนสวัสดิการคงเหลือล่าสุด
  onApprove: (request: ApprovalRequest, amount: number, note?: string) => void; // ฟังก์ชันบันทึกผลอนุมัติขึ้นไปที่ page.tsx
  onReject: (request: ApprovalRequest, reason: string) => void; // ฟังก์ชันบันทึกผลไม่อนุมัติขึ้นไปที่ page.tsx
  onReturn: (request: ApprovalRequest, reason: string) => void; // ฟังก์ชันบันทึกผลส่งคืน HR ขึ้นไปที่ page.tsx
}

export const ApprovalModule: React.FC<ApprovalModuleProps> = ({
  requests,
  selectedRequestId,
  onSelectRequest,
  budgetConfig,
  employeeRights,
  remainingDisasterBudget,
  remainingWelfareBudget,
  onApprove,
  onReject,
  onReturn,
}) => {
  // เก็บยอดเงินที่ผู้บริหารกำลังพิจารณาอนุมัติในเคสปัจจุบัน
  const [approveAmount, setApproveAmount] = useState<number>(0);
  // เก็บข้อความหมายเหตุของผู้บริหาร
  const [approveNote, setApproveNote] = useState<string>('อนุมัติตาม HR เสนอ');
  // สถานะเปิด/ปิด Modal ทั้ง 4 ตัวในโมดูลนี้
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal ยืนยันอนุมัติ
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Modal อนุมัติสำเร็จ
  const [showRejectModal, setShowRejectModal] = useState(false); // Modal ไม่อนุมัติ
  const [showOverLimitModal, setShowOverLimitModal] = useState(false); // Modal ยอดเกินสิทธิ์
  // เก็บตัวเลขสรุปหลังอนุมัติเสร็จ (เพื่อแสดงใน SuccessApproveModal แม้จะเคลียร์เคสที่เลือกไปแล้ว)
  const [lastApprovedInfo, setLastApprovedInfo] = useState({ amount: 0, remaining: 0 });

  // ค้นหาข้อมูลคำขอฉบับเต็มจากรหัส selectedRequestId ที่เลือกอยู่
  const selectedRequest = requests.find((r) => r.id === selectedRequestId) || null;

  // 1. ฟังก์ชันเมื่อคลิกเลือกคำขอจากหน้ารายการ -> ตั้งค่าเริ่มต้นให้ตรงกับที่ HR เสนอ แล้วเปิดหน้ารายละเอียด
  const handleOpenDetail = (req: ApprovalRequest) => {
    setApproveAmount(req.proposedAmount);
    setApproveNote('อนุมัติตาม HR เสนอ');
    onSelectRequest(req.id);
  };

  // 2. ฟังก์ชันคำนวณเพดานสิทธิ์, ยอดใช้ไปแล้ว, สิทธิ์คงเหลือรายบุคคล และงบกองทุนคงเหลือของคำขอนั้น
  const getEmployeeQuotaInfo = (req: ApprovalRequest) => {
    const isDisaster = req.type === 'disaster'; // เช็กว่าเป็นกองทุนภัยพิบัติหรือสวัสดิการ
    const annualCap = isDisaster ? budgetConfig.disasterAnnualCap : budgetConfig.welfareAnnualCap; // เพดานสูงสุดต่อปี
    const empRecord = employeeRights.find((e) => e.employeeId === req.employeeId); // หาประวัติการเบิกของพนักงานคนนี้
    const usedThisYear = empRecord
      ? isDisaster
        ? empRecord.disasterUsed
        : empRecord.welfareUsed
      : 0; // ยอดที่เบิกไปแล้วในปีนี้ (ถ้ายังไม่เคยเบิกเลยให้เป็น 0)
    const remainingQuota = Math.max(0, annualCap - usedThisYear); // สิทธิ์รายบุคคลที่เหลืออยู่ (ห้ามติดลบ)
    const remainingPool = isDisaster ? remainingDisasterBudget : remainingWelfareBudget; // งบกองทุนส่วนกลางคงเหลือ

    return { annualCap, usedThisYear, remainingQuota, remainingPool };
  };

  // 3. ฟังก์ชันเมื่อกดปุ่ม "อนุมัติ" จากหน้า Detail -> เช็กก่อนว่ายอดเกินสิทธิ์หรือไม่ เพื่อเลือกเปิด Modal ให้ถูกตัว
  const handleClickApproveButton = (amount: number, note: string) => {
    if (!selectedRequest) return;
    setApproveAmount(amount);
    setApproveNote(note);
    const { remainingQuota } = getEmployeeQuotaInfo(selectedRequest);

    if (amount > remainingQuota) {
      setShowOverLimitModal(true); // ถ้ายอดเกินสิทธิ์รายบุคคล -> เปิด Modal แจ้งเตือนล็อกอัตโนมัติ
    } else {
      setShowConfirmModal(true); // ถ้ายอดอยู่ในเกณฑ์ปกติ -> เปิด Modal ยืนยันการอนุมัติ
    }
  };

  // 4. ฟังก์ชันเมื่อกด "ยืนยันอนุมัติ" ใน ConfirmModal -> ตัดงบจริง + ปิด Confirm + เปิด SuccessModal
  const handleConfirmApprove = () => {
    if (!selectedRequest) return;
    const { remainingPool } = getEmployeeQuotaInfo(selectedRequest);
    const nextRemaining = Math.max(0, remainingPool - approveAmount); // คำนวณงบคงเหลือหลังอนุมัติ

    onApprove(selectedRequest, approveAmount, approveNote); // ส่งข้อมูลไปอัปเดต State กลางที่ page.tsx
    setLastApprovedInfo({ amount: approveAmount, remaining: nextRemaining }); // จำยอดไว้โชว์ในหน้าสำเร็จ
    setShowConfirmModal(false); // ปิดหน้าต่างยืนยัน
    setShowSuccessModal(true); // เปิดหน้าต่างแจ้งเตือนสำเร็จ
  };

  // 5. ฟังก์ชันเมื่อกดปิด SuccessModal -> ปิดป๊อปอัปและพากลับไปหน้ารวมรายการคำขอ
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onSelectRequest(null);
  };

  // 6. ฟังก์ชันเมื่อกด "ยืนยันไม่อนุมัติ" ใน RejectModal -> บันทึกเหตุผล + ปิด Modal + กลับหน้ารายการ
  const handleConfirmReject = (reason: string) => {
    if (!selectedRequest) return;
    onReject(selectedRequest, reason);
    setShowRejectModal(false);
    onSelectRequest(null);
  };

  // 7. ฟังก์ชันเมื่อกด "ส่งคืน" ใน OverLimitModal -> ส่งเรื่องกลับไปให้ HR ปรับแก้ยอดใหม่
  const handleReturnToHR = () => {
    if (!selectedRequest) return;
    onReturn(
      selectedRequest,
      `ส่งคืน HR ตรวจสอบใหม่: ยอดขออนุมัติ (฿${approveAmount.toLocaleString()}) เกินเพดานสิทธิ์คงเหลือ`
    );
    setShowOverLimitModal(false);
    onSelectRequest(null);
  };

  // คำนวณข้อมูลสิทธิ์ของคำขอที่เลือกอยู่ (ถ้ายังไม่เลือกเคส ให้คืนค่า 0 ทั้งหมด)
  const quotaInfo = selectedRequest
    ? getEmployeeQuotaInfo(selectedRequest)
    : { annualCap: 0, usedThisYear: 0, remainingQuota: 0, remainingPool: 0 };

  return (
    <div>
      {/* สลับหน้าจอระหว่าง "หน้ารวมรายการคำขอ" กับ "หน้ารายละเอียดคำขอรายเคส" */}
      {!selectedRequest ? (
        <RequestListView
          requests={requests}
          budgetConfig={budgetConfig}
          employeeRights={employeeRights}
          onSelectRequest={handleOpenDetail}
        />
      ) : (
        <ApprovalDetailView
          request={selectedRequest}
          annualCap={quotaInfo.annualCap}
          usedThisYear={quotaInfo.usedThisYear}
          remainingQuota={quotaInfo.remainingQuota}
          remainingPool={quotaInfo.remainingPool}
          onBack={() => onSelectRequest(null)}
          onTriggerApprove={handleClickApproveButton}
          onTriggerReject={() => setShowRejectModal(true)}
        />
      )}

      {/* Modal 1: หน้าต่างยืนยันอนุมัติวงเงิน */}
      <ConfirmApproveModal
        isOpen={showConfirmModal}
        request={selectedRequest}
        approveAmount={approveAmount}
        remainingBudget={quotaInfo.remainingPool}
        usedThisYear={quotaInfo.usedThisYear}
        annualCap={quotaInfo.annualCap}
        onConfirm={handleConfirmApprove}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Modal 2: หน้าต่างแจ้งเตือนดำเนินการอนุมัติสำเร็จ */}
      <SuccessApproveModal
        isOpen={showSuccessModal}
        approvedAmount={lastApprovedInfo.amount}
        remainingBudget={lastApprovedInfo.remaining}
        onBackToApprovalList={handleSuccessClose}
      />

      {/* Modal 3: หน้าต่างระบุเหตุผลไม่อนุมัติคำขอ */}
      <RejectModal
        isOpen={showRejectModal}
        request={selectedRequest}
        onConfirmReject={handleConfirmReject}
        onCancel={() => setShowRejectModal(false)}
      />

      {/* Modal 4: หน้าต่างแจ้งเตือนยอดเกินสิทธิ์ พร้อมปุ่มส่งคืน HR หรือปรับลงมาใช้ยอดสูงสุดที่เหลือ */}
      <OverLimitModal
        isOpen={showOverLimitModal}
        request={selectedRequest}
        requestedAmount={approveAmount}
        remainingQuota={quotaInfo.remainingQuota}
        remainingPool={quotaInfo.remainingPool}
        onReturnToHR={handleReturnToHR}
        onApproveWithinLimit={(maxAllowed) => {
          setApproveAmount(maxAllowed); // ปรับยอดลงมาเท่ากับเพดานสิทธิ์สูงสุดที่เหลือ
          setApproveNote('อนุมัติตามสิทธิ์คงเหลือประจำปี'); // เปลี่ยนหมายเหตุอัตโนมัติ
          setShowOverLimitModal(false); // ปิดหน้าต่างแจ้งเตือนเกินสิทธิ์
          setShowConfirmModal(true); // เปิดหน้าต่างยืนยันอนุมัติต่อทันที
        }}
        onClose={() => setShowOverLimitModal(false)}
      />
    </div>
  );
};