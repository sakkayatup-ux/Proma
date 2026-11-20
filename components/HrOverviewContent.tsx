'use client';

import React from 'react';
import { baht, thDate, useStore, WELFARE_LABEL } from '@/lib/store';
import { Btn, Card, Empty, PageTitle, Stat, StatusPill } from '@/components/ui/kit';

// H0 • ภาพรวม & งบประมาณ
export default function HrOverviewContent({ onNavigateToVerify }: { onNavigateToVerify: () => void }) {
  const { db } = useStore();
  if (!db) return null;
  const c = db.claims;
  const sum = (type: string, st: string[]) => c.filter((x) => x.type === type && st.includes(x.status)).reduce((s, x) => s + (x.status === 'approved' ? x.mgmt?.amount || 0 : x.hr?.proposedAmount || x.requestedAmount || 0), 0);
  const queue = c.filter((x) => x.status === 'pending_hr');
  const emp = (id: string) => db.employees.find((e) => e.id === id);
  const bars = [
    { t: 'กองทุนภัยพิบัติ', pool: db.budget.disasterPool, used: sum('disaster', ['approved']), pend: sum('disaster', ['pending_mgmt']) },
    { t: 'สวัสดิการทั่วไป', pool: db.budget.welfarePool, used: sum('welfare', ['approved']), pend: sum('welfare', ['pending_mgmt']) },
  ];

  return (
    <>
      <PageTitle title="ภาพรวม & งบประมาณ" sub={`ปีงบประมาณ ${db.budget.fiscalYear}`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Stat label="รอ HR ตรวจสอบ" value={queue.length} sub="คำขอใหม่/ส่งแก้กลับมา" subClass="text-amber-600" />
        <Stat label="รอผู้บริหารอนุมัติ" value={c.filter((x) => x.status === 'pending_mgmt').length} subClass="text-blue-600" sub="ส่งต่อแล้ว" />
        <Stat label="อนุมัติแล้ว" value={c.filter((x) => x.status === 'approved').length} sub={baht(bars[0].used + bars[1].used)} subClass="text-emerald-600" />
        <Stat label="พนักงานในทะเบียน" value={db.employees.length} sub={`แบบฟอร์มเปิดรับ ${db.forms.filter((f) => f.status === 'open').length}`} />
      </div>
      <div className="grid xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2" title="คิวรอตรวจสอบ" right={<Btn kind="ghost" className="text-xs px-3 py-1.5" onClick={onNavigateToVerify}>ไปหน้าตรวจสอบ →</Btn>}>
          {queue.length === 0 && <Empty text="ไม่มีคำขอรอตรวจ" />}
          <div className="space-y-3">
            {queue.slice(0, 6).map((x) => (
              <button key={x.id} onClick={onNavigateToVerify} className="w-full text-left bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center cursor-pointer hover:border-violet-200">
                <div>
                  <b className="text-sm">{x.id} • {emp(x.employeeId)?.name}</b>
                  <div className="text-xs text-slate-400">{x.type === 'disaster' ? db.forms.find((f) => f.id === x.formId)?.title : WELFARE_LABEL[x.welfareKind!]} • {thDate(x.createdAt)}</div>
                </div>
                <StatusPill status={x.status} />
              </button>
            ))}
          </div>
        </Card>
        <Card title="งบประมาณ (ผู้บริหารกำหนด)">
          <div className="space-y-6">
            {bars.map((b) => {
              const pct = b.pool ? Math.min(100, ((b.used + b.pend) / b.pool) * 100) : 0;
              return (
                <div key={b.t}>
                  <div className="flex justify-between text-sm mb-2"><b>{b.t}</b><span className="text-slate-500">{baht(b.pool)}</span></div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500" style={{ width: `${b.pool ? (b.used / b.pool) * 100 : 0}%` }} />
                    <div className="bg-amber-400" style={{ width: `${Math.max(0, pct - (b.pool ? (b.used / b.pool) * 100 : 0))}%` }} />
                  </div>
                  <div className="text-xs text-slate-400 mt-1.5">ใช้แล้ว {baht(b.used)} • รออนุมัติ {baht(b.pend)} • คงเหลือ {baht(b.pool - b.used - b.pend)}</div>
                </div>
              );
            })}
            {!db.budget.disasterPool && !db.budget.welfarePool && <p className="text-xs text-amber-600">ผู้บริหารยังไม่ได้ตั้งงบประมาณ</p>}
          </div>
        </Card>
      </div>
    </>
  );
}
