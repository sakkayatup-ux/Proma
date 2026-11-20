'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { ApprovalRequest, AuditLogItem, BudgetConfig, BudgetExtra, BudgetHistoryItem, EmployeeRight, ModuleTab } from '@/types';
import type { Claim, Db } from '@/lib/db/types';
import { calculateBudgetSummary } from '@/data/portalHelpers';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardModule } from '@/components/modules/dashboard';
import { ApprovalModule } from '@/components/modules/approval';
import { AuditModule } from '@/components/modules/audit';
import { BudgetModule } from '@/components/modules/budget';
import { baht, nextId, notify, nowIso, thDate, thDateTime, useStore, WELFARE_LABEL } from '@/lib/store';

// ---------------------------------------------------------------------------
// แปลงคำขอในฐานข้อมูลกลาง (Claim) ให้อยู่ในรูปแบบที่โมดูลฝั่งผู้บริหารใช้ (ApprovalRequest)
// ---------------------------------------------------------------------------
const SEV = { 1: ['low', 'ระดับ 1 • เล็กน้อย'], 2: ['medium', 'ระดับ 2 • ปานกลาง'], 3: ['high', 'ระดับ 3 • หนักมาก'] } as const;
const ago = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${Math.max(1, m)} นาทีที่แล้ว`;
  if (m < 1440) return `${Math.floor(m / 60)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(m / 1440)} วันที่แล้ว`;
};
const BG = ['blue', 'indigo', 'sky'] as const;

function toRequest(db: Db, c: Claim): ApprovalRequest {
  const e = db.employees.find((x) => x.id === c.employeeId);
  const f = db.forms.find((x) => x.id === c.formId);
  const lv = (c.hr?.level ?? c.selfLevel ?? 1) as 1 | 2 | 3;
  const sev = SEV[lv] ?? SEV[1];
  const isD = c.type === 'disaster';
  return {
    id: c.id,
    employeeId: c.employeeId,
    employeeName: e?.name ?? c.employeeId,
    department: e?.department ?? '-',
    position: e?.position ?? '-',
    type: c.type,
    category: isD ? `${f?.disasterType ?? 'ภัยพิบัติ'} รอบ ${f?.round ?? '-'}` : WELFARE_LABEL[c.welfareKind!],
    roundTitle: isD ? f?.title ?? 'ภัยพิบัติ' : `${WELFARE_LABEL[c.welfareKind!]} • ${c.hospital ?? ''}`,
    locationText: e?.province || c.currentAddress,
    timeAgoText: ago(c.hr?.at ?? c.updatedAt),
    severity: isD ? sev[0] : 'low',
    severityLabel: isD ? sev[1] : 'สวัสดิการทั่วไป',
    submittedDate: thDate(c.createdAt),
    proposedAmount: c.hr?.proposedAmount ?? c.requestedAmount ?? 0,
    approvedAmount: c.mgmt?.result === 'approved' ? c.mgmt.amount : undefined,
    status: c.status === 'pending_mgmt' ? 'pending' : c.status === 'approved' ? 'approved' : c.status === 'rejected' ? 'rejected' : 'returned',
    registeredAddress: e?.registeredAddress ?? '-',
    currentAddress: c.currentAddress,
    houseType: isD ? c.houseType ?? '-' : `ผู้ป่วย: ${c.patientName} (${c.relation})`,
    houseDocName: c.attachments.find((a) => a.label.includes('เอกสาร') || a.label.includes('ใบเสร็จ'))?.name ?? '-',
    impactDuration: isD ? `${thDate(c.impactFrom)} – ${thDate(c.impactTo)}` : `วันที่รักษา ${thDate(c.treatDate)}`,
    description: c.description,
    photoCards: c.attachments.slice(0, 3).map((a, i) => ({ title: a.label, subtitle: a.name, bgColor: BG[i % 3] })),
    documentChecklist: c.attachments.map((a) => `${a.label}: ${a.name}`),
    hrScreeningChecks: c.hr?.checks ?? [],
    hrNote: c.hr?.note || '-',
  };
}

export default function ManagementPortalPage() {
  const { db, session, mutate } = useStore();
  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    const s = sessionStorage.getItem('session');
    if (!s || JSON.parse(s).role !== 'manager') window.location.href = '/login';
  }, []);

  const requests = useMemo<ApprovalRequest[]>(
    () => (db ? db.claims.filter((c) => ['pending_mgmt', 'approved', 'rejected'].includes(c.status) && c.hr).map((c) => toRequest(db, c)) : []),
    [db]
  );
  const budgetConfig: BudgetConfig = useMemo(
    () =>
      db
        ? { ...db.budget, disasterFunds: db.disasterFunds }
        : { fiscalYear: '', disasterPool: 0, disasterAnnualCap: 0, welfarePool: 0, welfareAnnualCap: 0 },
    [db]
  );
  const employeeRights: EmployeeRight[] = useMemo(
    () =>
      db
        ? db.employees.map((e) => {
            const mine = db.claims.filter((c) => c.employeeId === e.id && c.status === 'approved');
            const s = (t: string) => mine.filter((c) => c.type === t).reduce((n, c) => n + (c.mgmt?.amount || 0), 0);
            return { employeeId: e.id, employeeName: e.name, department: e.department, disasterUsed: s('disaster'), welfareUsed: s('welfare') };
          })
        : [],
    [db]
  );
  const auditLogs: AuditLogItem[] = useMemo(
    () =>
      db
        ? db.audit.map((a) => {
            const c = db.claims.find((x) => x.id === a.claimId);
            const r = c ? toRequest(db, c) : undefined;
            return {
              id: a.id, requestId: a.claimId, employeeId: r?.employeeId ?? '-', employeeName: r?.employeeName ?? '-', department: r?.department ?? '-',
              type: r?.type ?? 'disaster', category: r?.category ?? '-', proposedAmount: r?.proposedAmount ?? 0, approvedAmount: a.amount,
              status: a.result, actionDate: thDateTime(a.at), approverName: a.by, note: a.note,
            };
          })
        : [],
    [db]
  );
  const budgetHistory: BudgetHistoryItem[] = useMemo(
    () => (db ? db.budgetLogs.map((l) => ({ id: l.id, date: thDateTime(l.at), fundType: l.fundType, fundName: l.title, changeSummary: baht(l.amount), reason: l.detail, updatedBy: l.by })) : []),
    [db]
  );
  const summary = useMemo(() => calculateBudgetSummary(requests, budgetConfig), [requests, budgetConfig]);

  const by = session?.name ?? 'ผู้บริหาร';

  const decide = (req: ApprovalRequest, result: 'approved' | 'rejected' | 'returned', amount: number, note: string) =>
    mutate((d) => {
      const c = d.claims.find((x) => x.id === req.id);
      if (!c) return;
      const t = nowIso();
      c.mgmt = { amount, note, at: t, by, result };
      c.updatedAt = t;
      d.audit.unshift({ id: nextId(d, 'LOG', 4), claimId: c.id, result, amount, note, at: t, by });
      if (result === 'approved') {
        c.status = 'approved';
        notify(d, c.employeeId, `คำขอ ${c.id} ได้รับอนุมัติ ${baht(amount)} ระบบจะโอนเข้าบัญชีของคุณ`);
        notify(d, 'hr', `ผู้บริหารอนุมัติ ${c.id} ${baht(amount)}`);
      } else if (result === 'rejected') {
        c.status = 'rejected';
        notify(d, c.employeeId, `คำขอ ${c.id} ไม่ได้รับอนุมัติ: ${note}`);
        notify(d, 'hr', `ผู้บริหารไม่อนุมัติ ${c.id}`);
      } else {
        // ส่งคืนให้ HR ตรวจทานใหม่
        c.status = 'pending_hr';
        c.hr = c.hr ? { ...c.hr, note: `[ผู้บริหารส่งคืน] ${note}` } : undefined;
        notify(d, 'hr', `ผู้บริหารส่งคืน ${c.id} ให้ตรวจทาน: ${note}`);
      }
    });

  const handleUpdateBudget = (fundType: 'welfare' | 'disaster', newPool: number, newCap: number, reason: string, extra?: BudgetExtra) =>
    mutate((d) => {
      if (fundType === 'disaster') {
        Object.assign(d.budget, { disasterPool: newPool, disasterAnnualCap: newCap });
        if (extra?.disasterFunds) d.disasterFunds = extra.disasterFunds.filter((f) => f.amount > 0);
      } else {
        Object.assign(d.budget, { welfarePool: newPool, welfareAnnualCap: newCap, familyYearCap: newCap });
        if (extra?.selfPerVisit !== undefined) Object.assign(d.budget, { selfPerVisit: extra.selfPerVisit, selfMaxTimes: extra.selfMaxTimes, familyOpd: extra.familyOpd, familyIpd: extra.familyIpd });
      }
      d.budgetLogs.unshift({
        id: nextId(d, 'BH', 3), at: nowIso(), fundType,
        title: fundType === 'disaster' ? 'กองทุนช่วยเหลือภัยพิบัติ' : 'กองทุนสวัสดิการทั่วไป',
        amount: newPool, detail: reason || `เพดานต่อคน ${baht(newCap)}`, by,
      });
      notify(d, 'hr', `ผู้บริหารปรับงบ${fundType === 'disaster' ? 'ภัยพิบัติ' : 'สวัสดิการทั่วไป'}เป็น ${baht(newPool)}`);
    });

  const goToApproval = (requestId: string | null = null) => {
    setSelectedRequestId(requestId);
    setActiveTab('approval');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-slate-900 flex flex-col lg:flex-row">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'approval') setSelectedRequestId(null);
        }}
        pendingCount={summary.pendingCount}
      />
      <main className="flex-1 p-5 sm:p-8 lg:p-10 w-full">
        <Header activeTab={activeTab} pendingCount={summary.pendingCount} onJumpToApproval={() => goToApproval(null)} />
        {!db ? (
          <p className="text-sm text-slate-400">กำลังโหลดข้อมูล...</p>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardModule requests={requests} budgetConfig={budgetConfig} usedDisaster={summary.usedDisaster} pendingDisaster={summary.pendingDisaster}
                usedWelfare={summary.usedWelfare} pendingWelfare={summary.pendingWelfare} onInspectRequest={goToApproval} onViewAllApproval={() => goToApproval(null)} />
            )}
            {activeTab === 'approval' && (
              <ApprovalModule requests={requests} selectedRequestId={selectedRequestId} onSelectRequest={setSelectedRequestId} budgetConfig={budgetConfig}
                employeeRights={employeeRights} remainingDisasterBudget={summary.remainingDisasterBudget} remainingWelfareBudget={summary.remainingWelfareBudget}
                onApprove={(req, amount, note) => decide(req, 'approved', amount, note || 'อนุมัติวงเงิน')}
                onReject={(req, reason) => decide(req, 'rejected', 0, reason)}
                onReturn={(req, reason) => decide(req, 'returned', 0, reason)} />
            )}
            {activeTab === 'audit' && <AuditModule logs={auditLogs} employeeRights={employeeRights} budgetConfig={budgetConfig} />}
            {activeTab === 'budget' && (
              <BudgetModule budgetConfig={budgetConfig} budgetHistory={budgetHistory} usedDisaster={summary.usedDisaster} usedWelfare={summary.usedWelfare}
                pendingDisaster={summary.pendingDisaster} pendingWelfare={summary.pendingWelfare} onUpdateBudget={handleUpdateBudget} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
