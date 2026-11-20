'use client';

import React from 'react';
import { baht, Go, STATUS_LABEL, thDate, thDateTime, usageOf, useStore, WELFARE_LABEL } from '@/lib/store';
import { Btn, Card, ClaimSteps, Empty, Stat, StatusPill } from '@/components/ui/kit';

// U0 • หน้าหลักพนักงาน
export default function HomePageContent({ go }: { go: Go }) {
  const { db, me } = useStore();
  if (!db || !me) return null;
  const u = usageOf(db, me.id);
  const openForms = db.forms.filter((f) => f.status === 'open');
  const mine = [...db.claims.filter((c) => c.employeeId === me.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const latest = mine[0];
  const inProgress = mine.filter((c) => ['pending_hr', 'pending_mgmt', 'returned'].includes(c.status));
  const cap = db.budget.disasterAnnualCap;
  const notices = db.notices.filter((n) => n.to === me.id).slice(0, 5);
  const formOf = (id?: string) => db.forms.find((f) => f.id === id);
  const pendingEdit = db.edits.find((e) => e.employeeId === me.id && e.status === 'pending');

  return (
    <>
      <div className="bg-[#eff6ff] border border-blue-100 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {openForms.length ? `เปิดรับคำขอ ${openForms.length} แบบฟอร์ม: ${openForms.map((f) => f.title).join(' • ')}` : 'ตอนนี้ยังไม่มีแบบฟอร์มภัยพิบัติที่เปิดรับ'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">ได้รับผลกระทบ? ยื่นคำขอได้เลย ไม่ต้องกรอกจำนวนเงิน HR จะประเมินให้</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Btn kind="secondary" onClick={() => go('เบิกสวัสดิการทั่วไป')}>เบิกสวัสดิการทั่วไป</Btn>
          <Btn onClick={() => go('เบิกสวัสดิการประเภทภัยพิบัติ')} disabled={!openForms.length}>ยื่นขอความช่วยเหลือ →</Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Stat label="คำขอของฉัน (ปีนี้)" value={u.mine.length} sub="ทั้งภัยพิบัติและสวัสดิการทั่วไป" />
        <Stat label="กำลังดำเนินการ" value={inProgress.length} sub={inProgress[0] ? `${inProgress[0].id} • ${STATUS_LABEL[inProgress[0].status]}` : 'ไม่มีคำขอค้าง'} subClass="text-amber-600" />
        <Stat label="ได้รับแล้วปีนี้" value={baht(u.disasterUsed + u.welfareUsed)} sub={`ภัยพิบัติ ${baht(u.disasterUsed)} • ทั่วไป ${baht(u.welfareUsed)}`} subClass="text-emerald-600" />
        <Stat label="สิทธิ์ภัยพิบัติคงเหลือ" value={cap ? baht(Math.max(0, cap - u.disasterUsed)) : '-'} sub={cap ? `จากเพดาน ${baht(cap)} / คน / ปี` : 'ผู้บริหารยังไม่กำหนดเพดาน'} subClass="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <Card title={latest ? `คำขอล่าสุด • ${latest.id}` : 'คำขอล่าสุด'} sub={latest ? (latest.type === 'disaster' ? formOf(latest.formId)?.title : WELFARE_LABEL[latest.welfareKind!]) : undefined} right={latest && <Btn kind="ghost" className="text-xs px-3 py-1.5" onClick={() => go('ติดตามสถานะ', latest.id)}>ดูสถานะ</Btn>}>
            {latest ? <ClaimSteps status={latest.status} /> : <Empty text="ยังไม่มีคำขอ" />}
          </Card>

          <Card title="สวัสดิการทั่วไปของฉันปีนี้" sub="ตามประกาศบริษัท" right={<Btn kind="ghost" className="text-xs px-3 py-1.5" onClick={() => go('เบิกสวัสดิการทั่วไป')}>ขอเบิก</Btn>}>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-slate-400 text-xs">ค่ารักษาพยาบาล (ตนเอง)</div>
                <div className="font-bold text-lg mt-1">{u.selfTimes} / {db.budget.selfMaxTimes} ครั้ง</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-slate-400 text-xs">ค่ารักษาพยาบาลครอบครัว</div>
                <div className="font-bold text-lg mt-1">{baht(u.familyUsed)} / {baht(db.budget.familyYearCap)}</div>
              </div>
            </div>
          </Card>

          <Card title="ประวัติคำขอ" right={<Btn kind="ghost" className="text-xs px-3 py-1.5" onClick={() => go('ติดตามสถานะ')}>ดูทั้งหมด</Btn>}>
            {mine.length === 0 && <Empty text="ยังไม่มีคำขอ" />}
            <div className="space-y-3">
              {mine.slice(0, 4).map((c) => (
                <button key={c.id} onClick={() => go('ติดตามสถานะ', c.id)} className="w-full text-left bg-slate-50 p-4 rounded-xl flex items-center justify-between gap-3 border border-slate-100 hover:border-blue-200 cursor-pointer">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{c.id} • {c.type === 'disaster' ? formOf(c.formId)?.title : WELFARE_LABEL[c.welfareKind!]}</div>
                    <div className="text-xs text-slate-400 mt-0.5">ส่งเมื่อ {thDate(c.createdAt)}</div>
                  </div>
                  <StatusPill status={c.status} />
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="การแจ้งเตือน">
            {notices.length === 0 && <Empty text="ยังไม่มีการแจ้งเตือน" />}
            <div className="space-y-4">
              {notices.map((n) => (
                <div key={n.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.read ? 'bg-slate-300' : 'bg-rose-500'}`} />
                  <div>
                    <div className="text-sm text-slate-800 leading-snug">{n.text}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{thDateTime(n.at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="ข้อมูลของฉัน" right={<Btn kind="ghost" className="text-xs px-3 py-1.5" onClick={() => go('ข้อมูลส่วนตัว')}>ดูทั้งหมด</Btn>}>
            <div className="space-y-3 text-sm">
              <Row k="แผนก / ตำแหน่ง" v={`${me.department} • ${me.position}`} />
              <Row k="บัญชีรับเงิน" v={me.bank ? `${me.bank} ${me.bankAccount}` : '-'} />
              <Row k="ที่พักปัจจุบัน" v={me.province || '-'} />
            </div>
            {pendingEdit && <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">ส่งคำขอแก้ไข “{pendingEdit.fieldLabel}” แล้ว รอ HR ยืนยัน</div>}
          </Card>
        </div>
      </div>
    </>
  );
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-3">
    <span className="text-slate-400">{k}</span>
    <span className="font-semibold text-right">{v}</span>
  </div>
);
