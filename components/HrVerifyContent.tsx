'use client';

import React, { useState } from 'react';
import { baht, notify, nowIso, STATUS_LABEL, thDate, thDateTime, useStore, WELFARE_LABEL } from '@/lib/store';
import { AttachmentList, Btn, Card, Empty, Field, IconCircle, inputCls, Modal, PageTitle, StatusPill } from '@/components/ui/kit';

const CHECKS_D = ['ที่อยู่ตรงกับทะเบียน/เอกสารเช่า', 'อยู่ในพื้นที่ประกาศภัย', 'รูปหลักฐานชัดเจน', 'ยังไม่เคยยื่นรอบนี้'];
const CHECKS_W = ['ใบเสร็จถูกต้อง ชื่อตรงผู้ป่วย', 'วันที่รักษาอยู่ในปีงบประมาณ', 'ยอดไม่เกินสิทธิ์', 'ความสัมพันธ์ตรงทะเบียน'];

// H1 • ตรวจสอบคำขอ → ส่งกลับแก้ไข / ส่งต่อผู้บริหาร
export default function HrVerifyContent() {
  const { db, session, mutate } = useStore();
  const [tab, setTab] = useState<'pending_hr' | 'done'>('pending_hr');
  const [sel, setSel] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [amount, setAmount] = useState('');
  const [checks, setChecks] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [ret, setRet] = useState(false);
  const [reason, setReason] = useState('');
  const [fwd, setFwd] = useState(false);
  const [msg, setMsg] = useState('');
  if (!db) return null;

  const list = db.claims.filter((c) => (tab === 'pending_hr' ? c.status === 'pending_hr' : c.status !== 'pending_hr')).sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  const cur = list.find((c) => c.id === sel) ?? list[0];
  const emp = cur && db.employees.find((e) => e.id === cur.employeeId);
  const form = cur?.formId ? db.forms.find((f) => f.id === cur.formId) : undefined;
  const CH = cur?.type === 'disaster' ? CHECKS_D : CHECKS_W;

  const pick = (id: string) => {
    const c = db.claims.find((x) => x.id === id)!;
    const f = db.forms.find((x) => x.id === c.formId);
    const lv = c.hr?.level ?? c.selfLevel ?? 1;
    setSel(id); setLevel(lv); setChecks(c.hr?.checks ?? []); setNote(c.hr?.note ?? '');
    setAmount(String(c.hr?.proposedAmount ?? (c.type === 'disaster' ? f?.levels.find((l) => l.level === lv)?.amount ?? 0 : c.requestedAmount ?? 0)));
  };
  if (cur && sel !== cur.id) setTimeout(() => pick(cur.id), 0);

  const by = session?.name ?? 'HR';
  const doReturn = async () => {
    if (!cur || !reason.trim()) return;
    await mutate((d) => {
      const c = d.claims.find((x) => x.id === cur.id)!;
      c.status = 'returned'; c.returnReason = reason; c.updatedAt = nowIso();
      notify(d, c.employeeId, `คำขอ ${c.id} ถูกส่งกลับให้แก้ไข: ${reason}`);
    });
    setRet(false); setReason(''); setSel(null); setMsg(`ส่งกลับ ${cur.id} ให้พนักงานแก้ไขแล้ว`);
  };
  const doForward = async () => {
    if (!cur) return;
    await mutate((d) => {
      const c = d.claims.find((x) => x.id === cur.id)!;
      c.status = 'pending_mgmt'; c.updatedAt = nowIso();
      c.hr = { level: c.type === 'disaster' ? level : undefined, proposedAmount: +amount || 0, checks, note, at: nowIso(), by };
      notify(d, 'manager', `คำขอ ${c.id} ผ่านการตรวจจาก HR รออนุมัติ ${baht(+amount)}`);
      notify(d, c.employeeId, `คำขอ ${c.id} ผ่านการตรวจเอกสารแล้ว รอผู้บริหารอนุมัติ`);
    });
    setFwd(false); setSel(null); setMsg(`ส่งต่อ ${cur.id} ให้ผู้บริหารแล้ว`);
  };

  const cmp = (k: string, a?: string, b?: string) => (
    <tr key={k} className="border-b border-slate-50">
      <td className="py-2 text-slate-400">{k}</td><td className="py-2">{a || '-'}</td><td className="py-2">{b || '-'}</td>
      <td className="py-2">{a && b ? (a.trim() === b.trim() ? <span className="text-emerald-600">✓ ตรง</span> : <span className="text-amber-600">ต่างกัน</span>) : ''}</td>
    </tr>
  );

  return (
    <>
      <PageTitle title="ตรวจสอบคำขอ" sub="ตรวจเอกสาร เทียบทะเบียน ประเมินระดับ แล้วส่งต่อผู้บริหาร" />
      {msg && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-3 flex justify-between">{msg}<button className="cursor-pointer" onClick={() => setMsg('')}>✕</button></div>}
      <div className="flex gap-2 mb-5">
        {([['pending_hr', 'รอตรวจ'], ['done', 'ตรวจแล้ว/ประวัติ']] as const).map(([k, t]) => (
          <button key={k} onClick={() => { setTab(k); setSel(null); }} className={`text-xs font-semibold px-4 py-2 rounded-full border cursor-pointer ${tab === k ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-slate-200'}`}>{t}</button>
        ))}
      </div>
      {list.length === 0 ? <Card><Empty text={tab === 'pending_hr' ? 'ไม่มีคำขอรอตรวจ' : 'ยังไม่มีประวัติ'} /></Card> : (
        <div className="grid xl:grid-cols-7 gap-6">
          <div className="xl:col-span-2 space-y-3">
            {list.map((c) => (
              <button key={c.id} onClick={() => pick(c.id)} className={`w-full text-left bg-white p-4 rounded-xl border cursor-pointer ${cur?.id === c.id ? 'border-violet-500 ring-2 ring-violet-100' : 'border-slate-100'}`}>
                <div className="flex justify-between gap-2"><b className="text-sm">{c.id}</b><StatusPill status={c.status} /></div>
                <div className="text-xs text-slate-500 mt-1">{db.employees.find((e) => e.id === c.employeeId)?.name} • {thDate(c.updatedAt)}</div>
              </button>
            ))}
          </div>
          {cur && (
            <div className="xl:col-span-5 space-y-5">
              <Card title={`${cur.id} • ${cur.type === 'disaster' ? form?.title : WELFARE_LABEL[cur.welfareKind!]}`} sub={`${emp?.name} (${cur.employeeId}) • ${emp?.department} • ส่ง ${thDateTime(cur.createdAt)}`} right={<StatusPill status={cur.status} />}>
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-slate-400 text-left"><th>หัวข้อ</th><th>ที่ยื่น</th><th>ทะเบียน HR</th><th></th></tr></thead>
                  <tbody>
                    {cmp('ชื่อ', cur.type === 'welfare' ? cur.patientName : emp?.name, emp?.name)}
                    {cmp('ที่พักปัจจุบัน', cur.currentAddress, emp?.currentAddress)}
                    {cur.type === 'disaster' && cmp('ลักษณะที่พัก', cur.houseType, '')}
                    {cur.type === 'disaster' && cmp('ช่วงผลกระทบ', `${thDate(cur.impactFrom)} – ${thDate(cur.impactTo)}`, '')}
                    {cur.type === 'disaster' && cmp('ระดับที่แจ้ง', String(cur.selfLevel), '')}
                    {cur.type === 'welfare' && cmp('ผู้ป่วย / ความสัมพันธ์', `${cur.patientName} (${cur.relation})`, `ครอบครัว ${emp?.familyMembers ?? '-'} คน`)}
                    {cur.type === 'welfare' && cmp('สถานพยาบาล / วันที่', `${cur.hospital} • ${thDate(cur.treatDate)}`, '')}
                    {cur.type === 'welfare' && cmp('ยอดขอเบิก', baht(cur.requestedAmount), '')}
                  </tbody>
                </table>
                <p className="text-sm text-slate-600 mt-4">{cur.description}</p>
                <div className="mt-4"><AttachmentList items={cur.attachments} /></div>
                {cur.mgmt && <p className="text-xs mt-4 text-slate-500">ผู้บริหาร: {STATUS_LABEL[cur.status]} {baht(cur.mgmt.amount)} • {cur.mgmt.note}</p>}
              </Card>
              {cur.status === 'pending_hr' && (
                <Card title="ผลการตรวจของ HR">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {cur.type === 'disaster' && form && (
                      <Field label="ระดับความเสียหาย (HR ประเมิน)">
                        <select className={inputCls} value={level} onChange={(e) => { const lv = +e.target.value; setLevel(lv); setAmount(String(form.levels.find((l) => l.level === lv)?.amount ?? 0)); }}>
                          {form.levels.map((l) => <option key={l.level} value={l.level}>ระดับ {l.level} • {l.label} • {baht(l.amount)}</option>)}
                        </select>
                      </Field>
                    )}
                    <Field label="วงเงินที่เสนอ (บาท)"><input type="number" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 mt-4">
                    {CH.map((k) => (
                      <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={checks.includes(k)} onChange={(e) => setChecks((p) => (e.target.checked ? [...p, k] : p.filter((x) => x !== k)))} /> {k}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4"><Field label="หมายเหตุถึงผู้บริหาร"><textarea rows={2} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} /></Field></div>
                  <div className="flex gap-3 mt-5 justify-end">
                    <Btn kind="secondary" onClick={() => setRet(true)}>ส่งกลับให้แก้ไข</Btn>
                    <Btn onClick={() => setFwd(true)} disabled={checks.length < CH.length || !(+amount > 0)}>ส่งต่อผู้บริหาร</Btn>
                  </div>
                  {checks.length < CH.length && <p className="text-xs text-slate-400 text-right mt-2">ติ๊กรายการตรวจให้ครบก่อนส่งต่อ</p>}
                </Card>
              )}
            </div>
          )}
        </div>
      )}
      <Modal open={ret} onClose={() => setRet(false)} title="ส่งกลับให้พนักงานแก้ไข" icon={<IconCircle color="bg-amber-500">!</IconCircle>}
        footer={<><Btn kind="secondary" className="flex-1" onClick={() => setRet(false)}>ยกเลิก</Btn><Btn className="flex-1" disabled={!reason.trim()} onClick={doReturn}>ส่งกลับ</Btn></>}>
        <Field label="เหตุผล / สิ่งที่ต้องแก้"><textarea rows={3} className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </Modal>
      <Modal open={fwd} onClose={() => setFwd(false)} title="ยืนยันส่งต่อผู้บริหาร?" sub={`${cur?.id} • เสนอ ${baht(+amount)}`} icon={<IconCircle color="bg-violet-600">→</IconCircle>}
        footer={<><Btn kind="secondary" className="flex-1" onClick={() => setFwd(false)}>ยกเลิก</Btn><Btn className="flex-1" onClick={doForward}>ส่งต่อ</Btn></>} />
    </>
  );
}
