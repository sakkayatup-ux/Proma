'use client';

import React, { useState } from 'react';
import type { DisasterForm, DisasterLevel } from '@/lib/db/types';
import { baht, nextId, notify, nowIso, thDate, useStore } from '@/lib/store';
import { Btn, Card, Empty, Field, IconCircle, inputCls, Modal, PageTitle } from '@/components/ui/kit';

const TYPES = ['อุทกภัย', 'วาตภัย', 'อัคคีภัย', 'ไฟป่า', 'แผ่นดินไหว', 'ภัยแล้ง', 'อื่น ๆ'];
const blank = (): Omit<DisasterForm, 'id' | 'createdAt' | 'status'> => ({
  disasterType: TYPES[0], round: '', title: '', description: '', pool: 0, openDate: '', closeDate: '',
  levels: [{ level: 1, label: 'เสียหายเล็กน้อย', amount: 0 }, { level: 2, label: 'เสียหายปานกลาง', amount: 0 }, { level: 3, label: 'เสียหายหนัก', amount: 0 }],
});

// H2 • จัดการแบบฟอร์มสวัสดิการภัยพิบัติ
export default function HrFormBuilderContent() {
  const { db, mutate } = useStore();
  const [edit, setEdit] = useState<string | 'new' | null>(null);
  const [f, setF] = useState(blank());
  const [pub, setPub] = useState(false);
  const [err, setErr] = useState('');
  if (!db) return null;

  const start = (id: string | 'new') => {
    setErr('');
    if (id === 'new') setF({ ...blank(), round: `1/${db.budget.fiscalYear}` });
    else { const x = db.forms.find((y) => y.id === id)!; setF({ ...x, levels: x.levels.map((l) => ({ ...l })) }); }
    setEdit(id);
  };
  const setLv = (i: number, p: Partial<DisasterLevel>) => setF((o) => ({ ...o, levels: o.levels.map((l, j) => (j === i ? { ...l, ...p } : l)) }));
  const valid = () => {
    if (!f.title.trim()) return 'กรุณาตั้งชื่อแบบฟอร์ม';
    if (!f.openDate || !f.closeDate) return 'กรุณากำหนดวันเปิด-ปิดรับ';
    if (f.levels.some((l) => !(l.amount > 0))) return 'กรุณากำหนดวงเงินทุกระดับ';
    return '';
  };
  const save = async (status: DisasterForm['status']) => {
    const e = valid(); setErr(e); if (e) return;
    await mutate((d) => {
      if (edit === 'new') {
        d.forms.unshift({ ...f, id: nextId(d, 'F'), status, createdAt: nowIso() });
      } else {
        const x = d.forms.find((y) => y.id === edit)!;
        Object.assign(x, f, { status });
      }
      if (status === 'open') d.employees.forEach((emp) => notify(d, emp.id, `เปิดรับคำขอ: ${f.title} (ถึง ${thDate(f.closeDate)})`));
    });
    setPub(false); setEdit(null);
  };
  const setStatus = (id: string, status: DisasterForm['status']) => mutate((d) => { d.forms.find((x) => x.id === id)!.status = status; });
  const count = (id: string) => db.claims.filter((c) => c.formId === id).length;
  const funds = db.disasterFunds;

  if (edit) {
    return (
      <>
        <PageTitle title={edit === 'new' ? 'สร้างแบบฟอร์มใหม่' : `แก้ไข ${edit}`} sub="กำหนดประเภทภัย ช่วงเวลา และวงเงินแต่ละระดับ" />
        <div className="grid xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2" title="รายละเอียดแบบฟอร์ม">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="ประเภทภัย"><select className={inputCls} value={f.disasterType} onChange={(e) => setF({ ...f, disasterType: e.target.value })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="รอบ"><input className={inputCls} value={f.round} onChange={(e) => setF({ ...f, round: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label="ชื่อแบบฟอร์ม (พนักงานเห็น)"><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field></div>
              <div className="sm:col-span-2"><Field label="คำอธิบาย / พื้นที่ประกาศภัย"><textarea rows={2} className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field></div>
              <Field label="เปิดรับ"><input type="date" className={inputCls} value={f.openDate} onChange={(e) => setF({ ...f, openDate: e.target.value })} /></Field>
              <Field label="ปิดรับ"><input type="date" className={inputCls} value={f.closeDate} onChange={(e) => setF({ ...f, closeDate: e.target.value })} /></Field>
              <Field label="วงเงินรอบนี้ (บาท)" hint={funds.length ? `กองทุนที่ผู้บริหารจัดสรร: ${funds.map((x) => `${x.type} ${baht(x.amount)}`).join(', ')}` : undefined}><input type="number" className={inputCls} value={f.pool || ''} onChange={(e) => setF({ ...f, pool: +e.target.value })} /></Field>
            </div>
          </Card>
          <Card title="ระดับความเสียหาย & วงเงิน">
            <div className="space-y-4">
              {f.levels.map((l, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 items-end">
                  <div className="col-span-3"><Field label={`ระดับ ${l.level}`}><input className={inputCls} value={l.label} onChange={(e) => setLv(i, { label: e.target.value })} /></Field></div>
                  <div className="col-span-2"><Field label="บาท"><input type="number" className={inputCls} value={l.amount || ''} onChange={(e) => setLv(i, { amount: +e.target.value })} /></Field></div>
                </div>
              ))}
            </div>
            {err && <p className="text-xs text-rose-600 mt-4">{err}</p>}
            <div className="flex flex-col gap-2 mt-6">
              <Btn onClick={() => { const e = valid(); setErr(e); if (!e) setPub(true); }}>เผยแพร่แบบฟอร์ม</Btn>
              <Btn kind="secondary" onClick={() => save('draft')}>บันทึกฉบับร่าง</Btn>
              <Btn kind="ghost" onClick={() => setEdit(null)}>ยกเลิก</Btn>
            </div>
          </Card>
        </div>
        <Modal open={pub} onClose={() => setPub(false)} title="เผยแพร่แบบฟอร์ม?" sub="พนักงานทุกคนจะเห็นและได้รับแจ้งเตือน" icon={<IconCircle color="bg-violet-600">↑</IconCircle>}
          footer={<><Btn kind="secondary" className="flex-1" onClick={() => setPub(false)}>ยกเลิก</Btn><Btn className="flex-1" onClick={() => save('open')}>เผยแพร่</Btn></>} />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-start gap-4"><PageTitle title="จัดการแบบฟอร์มสวัสดิการ" sub="แบบฟอร์มรับคำขอภัยพิบัติ" /><Btn onClick={() => start('new')}>+ สร้างแบบฟอร์ม</Btn></div>
      {db.forms.length === 0 && <Card><Empty text="ยังไม่มีแบบฟอร์ม กด “สร้างแบบฟอร์ม” เพื่อเริ่ม" /></Card>}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {db.forms.map((x) => (
          <Card key={x.id} title={x.title} sub={`${x.id} • ${x.disasterType} รอบ ${x.round}`}
            right={<span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${x.status === 'open' ? 'bg-emerald-50 text-emerald-700' : x.status === 'draft' ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-rose-600'}`}>{x.status === 'open' ? 'เปิดรับ' : x.status === 'draft' ? 'ฉบับร่าง' : 'ปิดแล้ว'}</span>}>
            <p className="text-xs text-slate-500">{thDate(x.openDate)} – {thDate(x.closeDate)} • วงเงิน {baht(x.pool)} • คำขอ {count(x.id)}</p>
            <div className="flex gap-2 mt-4">
              <Btn kind="secondary" className="text-xs px-3 py-1.5" onClick={() => start(x.id)}>แก้ไข</Btn>
              {x.status === 'open' ? <Btn kind="danger" className="text-xs px-3 py-1.5" onClick={() => setStatus(x.id, 'closed')}>ปิดรับ</Btn> : <Btn className="text-xs px-3 py-1.5" onClick={() => setStatus(x.id, 'open')}>เปิดรับ</Btn>}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
