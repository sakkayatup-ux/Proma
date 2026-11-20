import React, { useState, useEffect } from 'react';
import { ApprovalRequest } from '@/types';
import { ApprovalDetailInfo } from './ApprovalDetailInfo';
import { ApprovalActionPanel } from './ApprovalActionPanel';
import { EvidencePreviewModal } from './modals/EvidencePreviewModal';

interface ApprovalDetailViewProps {
  request: ApprovalRequest;
  annualCap: number;
  usedThisYear: number;
  remainingQuota: number;
  remainingPool: number;
  onBack: () => void;
  onTriggerApprove: (amount: number, note: string) => void;
  onTriggerReject: () => void;
}

export const ApprovalDetailView: React.FC<ApprovalDetailViewProps> = ({
  request,
  remainingQuota,
  remainingPool,
  onBack,
  onTriggerApprove,
  onTriggerReject,
}) => {
  const [amountInput, setAmountInput] = useState<number>(request.proposedAmount);
  const [executiveNote, setExecutiveNote] = useState<string>('อนุมัติตาม HR เสนอ');
  // เก็บทั้งชื่อหัวข้อและ URL รูปภาพที่กดเปิดดู
  const [previewData, setPreviewData] = useState<{ title: string; imageUrl?: string } | null>(null);

  useEffect(() => {
    setAmountInput(request.proposedAmount);
    setExecutiveNote('อนุมัติตาม HR เสนอ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id]);

  const isOverQuota = amountInput > remainingQuota || request.proposedAmount > remainingQuota;

  return (
    <div className="space-y-5">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          ← ย้อนกลับไปเลือกคำขออื่น
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        <ApprovalDetailInfo
          request={request}
          isOverQuota={isOverQuota}
          onPreview={(title, imageUrl) => setPreviewData({ title, imageUrl })}
        />

        <ApprovalActionPanel
          proposedAmount={request.proposedAmount}
          amountInput={amountInput}
          onChangeAmount={setAmountInput}
          executiveNote={executiveNote}
          onChangeNote={setExecutiveNote}
          remainingQuota={remainingQuota}
          remainingPool={remainingPool}
          onApprove={() => onTriggerApprove(amountInput, executiveNote)}
          onReject={onTriggerReject}
        />
      </div>

      <EvidencePreviewModal
        title={previewData?.title ?? null}
        imageUrl={previewData?.imageUrl ?? null}
        onClose={() => setPreviewData(null)}
      />
    </div>
  );
};