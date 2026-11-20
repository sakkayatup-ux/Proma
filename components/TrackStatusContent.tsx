'use client';

import React, { useState } from 'react';
import { baht, Go, STATUS_LABEL, thDate, thDateTime, useStore, WELFARE_LABEL } from '@/lib/store';
import { AttachmentList, Btn, Card, ClaimSteps, Empty, PageTitle, StatusPill } from '@/components/ui/kit';

// U3 • ติดตามสถานะคำขอ
export default function TrackStatusContent({ go, focusId }: { go: Go; focusId?: string | null }) {
  const { db, me } = useStore();
  const [sel, setSel] = useState<string | null>(focusId ?? null);
  const [filter, setFilter] = useState('all');
  if (!db || !me) return null;
  const mine = db.claims.filter((c) => c.employeeId === me.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const list = filter === 'all' ? mine : mine.filter((c) => c.status === filter);
  const cur = mine.find((c) => c.id === sel) ?? list[0];
  const title = (c: (typeof mine)[number]) => (c.type === 'disaster' ? db.forms.find((f) => f.id === c.formId)?.title ?? 'ภัยพิบัติ' : WELFARE_LABEL[c.welfareKind!]);

  return (
    <>
      <PageTitle title="ติดตามสถานะ" sub="คำขอทั้งหมดของฉัน" />
      <div className="flex flex-wrap gap-2 mb-5">
        {['all', 'pending_hr', 'returned', 'pending_mgmt', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>
            {s === 'all' ? 'ทั้งหมด' : STATUS_LABEL[s as keyof typeof STATUS_LABEL]}
          </button>
        ))}
      </div>
      {mine.length === 0 ? (
        <Card><Empty text="ยังไม่มีคำขอ" /></Card>
      ) : (
        <div className="grid xl:grid-cols-5 gap-6">
          <div className="xl:col-span-2 space-y-3">
            {list.length === 0 && <Empty text="ไม่มีคำขอในสถานะนี้" />}
            {list.map((c) => (
              <button key={c.id} onClick={() => setSel(c.id)} className={`w-full text-left bg-white p-4 rounded-xl border cursor-pointer ${cur?.id === c.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100'}`}>
                <div className="flex justify-between gap-2"><b className="text-sm">{c.id}</b><StatusPill status={c.status} /></div>
                <div className="text-xs text-slate-500 mt-1">{title(c)} • {thDate(c.createdAt)}</div>
              </button>
            ))}
          </div>
          {cur && (
            <div className="xl:col-span-3 space-y-5">
              <Card title={`${cur.id} • ${title(cur)}`} sub={`ส่งเมื่อ ${thDateTime(cur.createdAt)} • อัปเดต ${thDateTime(cur.updatedAt)}`} right={<StatusPill status={cur.status} />}>
                <ClaimSteps status={cur.status} />
                {cur.status === 'returned' && (
                  <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
                    <b>ต้องแก้ไข:</b> {cur.returnReason || '-'}
                    {cur.type === 'disaster' && <div className="mt-3"><Btn onClick={() => go('เบิกสวัสดิการประเภทภัยพิบัติ', cur.id)}>แก้ไขและส่งใหม่</Btn></div>}
                  </div>
                )}
                {cur.status === 'approved' && <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">อนุมัติ {baht(cur.mgmt?.amount)} • โอนเข้าบัญชี {me.bank} {me.bankAccount}{cur.mgmt?.note ? ` • ${cur.mgmt.note}` : ''}</div>}
                {cur.status === 'rejected' && <div className="mt-5 bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">ไม่อนุมัติ: {cur.mgmt?.note || '-'}</div>}
              </Card>
              <Card title="รายละเอียดที่ยื่น">
                <div className="text-sm space-y-2 text-slate-600">
                  {cur.type === 'disaster' ? (
                    <>
                      <p>ที่พัก: {cur.houseType} • {cur.currentAddress}</p>
                      <p>ช่วงผลกระทบ: {thDate(cur.impactFrom)} – {thDate(cur.impactTo)}</p>
                      <p>ระดับที่แจ้ง: {cur.selfLevel}{cur.hr?.level ? ` • HR ประเมินระดับ ${cur.hr.level}` : ''}</p>
                    </>
                  ) : (
                    <>
                      <p>ผู้ป่วย: {cur.patientName} ({cur.relation}) • {cur.hospital}</p>
                      <p>วันที่รักษา: {thDate(cur.treatDate)} • ยอดเบิก {baht(cur.requestedAmount)}</p>
                    </>
                  )}
                  <p>{cur.description}</p>
                </div>
                <div className="mt-4"><AttachmentList items={cur.attachments} /></div>
              </Card>
            </div>
          )}
        </div>
      )}
    </>
  );
}
