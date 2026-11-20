'use client';

import React, { useState } from 'react';
import type { Attachment, Employee } from '@/lib/db/types';
import { nextId, notify, nowIso, readAttachment, thDate, useStore } from '@/lib/store';
import { Btn, Card, Field, IconCircle, inputCls, Modal, PageTitle } from '@/components/ui/kit';

const EDITABLE: { key: keyof Employee; label: string }[] = [
  { key: 'phone', label: 'เบอร์โทรศัพท์' },
  { key: 'email', label: 'อีเมล' },
  { key: 'currentAddress', label: 'ที่พักปัจจุบัน' },
  { key: 'registeredAddress', label: 'ที่อยู่ตามทะเบียนบ้าน' },
  { key: 'province', label: 'จังหวัด' },
  { key: 'bank', label: 'ธนาคาร' },
  { key: 'bankAccount', label: 'เลขบัญชีรับเงิน' },
];

// U4 • ข้อมูลส่วนตัว + ยื่นคำขอแก้ไข (HR ยืนยัน)
export default function ProfileContent() {
  const { db, me, mutate } = useStore();
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<keyof Employee>('phone');
  const [val, setVal] = useState('');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<Attachment | undefined>();
  const [sent, setSent] = useState(false);
  if (!db || !me) return null;
  const edits = db.edits.filter((e) => e.employeeId === me.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const label = EDITABLE.find((x) => x.key === field)!.label;

  const send = async () => {
    if (!val.trim()) return;
    await mutate((d) => {
      d.edits.unshift({ id: nextId(d, 'ED'), employeeId: me.id, field, fieldLabel: label, oldValue: String(me[field] ?? ''), newValue: val, reason, attachment: file, status: 'pending', createdAt: nowIso() });
      notify(d, 'hr', `${me.name} ขอแก้ไข${label}`);
    });
    setOpen(false); setSent(true); setVal(''); setReason(''); setFile(undefined);
  };

  const rows: [string, string][] = [
    ['รหัสพนักงาน', me.id], ['ชื่อ-นามสกุล', me.name], ['แผนก', me.department], ['ตำแหน่ง', me.position],
    ['ประเภทการจ้าง', me.contractType], ['วันเริ่มงาน', thDate(me.startDate)], ['จำนวนสมาชิกครอบครัว', String(me.familyMembers)],
  ];

  return (
    <>
      <PageTitle title="ข้อมูลส่วนตัว" sub="ข้อมูลจากทะเบียน HR ใช้กรอกคำขออัตโนมัติ" />
      <div className="grid xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2" title="ข้อมูลทะเบียน" right={<Btn kind="ghost" className="text-xs px-3 py-1.5" onClick={() => setOpen(true)}>ขอแก้ไขข้อมูล</Btn>}>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-3 border-b border-slate-50 pb-2"><span className="text-slate-400">{k}</span><b className="text-right">{v || '-'}</b></div>)}
            {EDITABLE.map((x) => <div key={x.key} className="flex justify-between gap-3 border-b border-slate-50 pb-2"><span className="text-slate-400">{x.label}</span><b className="text-right">{String(me[x.key] || '-')}</b></div>)}
          </div>
        </Card>
        <Card title="คำขอแก้ไขของฉัน">
          {edits.length === 0 && <p className="text-xs text-slate-400">ยังไม่มีคำขอแก้ไข</p>}
          <div className="space-y-3">
            {edits.map((e) => (
              <div key={e.id} className="text-xs bg-slate-50 rounded-xl p-3 border border-slate-100">
                <b>{e.fieldLabel}</b>: {e.oldValue || '-'} → {e.newValue}
                <div className={`mt-1 font-semibold ${e.status === 'pending' ? 'text-amber-600' : e.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}`}>{e.status === 'pending' ? 'รอ HR ยืนยัน' : e.status === 'approved' ? 'อัปเดตแล้ว' : 'ไม่อนุมัติ'}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="ขอแก้ไขข้อมูล" sub="HR จะตรวจและอัปเดตทะเบียนให้"
        footer={<><Btn kind="secondary" className="flex-1" onClick={() => setOpen(false)}>ยกเลิก</Btn><Btn className="flex-1" onClick={send} disabled={!val.trim()}>ส่งคำขอ</Btn></>}>
        <div className="space-y-4">
          <Field label="ข้อมูลที่ต้องการแก้"><select className={inputCls} value={field} onChange={(e) => setField(e.target.value as keyof Employee)}>{EDITABLE.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select></Field>
          <Field label="ข้อมูลเดิม"><input className={inputCls} value={String(me[field] ?? '')} disabled /></Field>
          <Field label="ข้อมูลใหม่"><input className={inputCls} value={val} onChange={(e) => setVal(e.target.value)} /></Field>
          <Field label="เหตุผล"><input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
          <label className="text-xs font-semibold text-blue-700 cursor-pointer">+ แนบเอกสารประกอบ {file && `(${file.name})`}<input type="file" className="hidden" onChange={async (e) => e.target.files?.[0] && setFile(await readAttachment(e.target.files[0], 'เอกสารประกอบ'))} /></label>
        </div>
      </Modal>
      <Modal open={sent} onClose={() => setSent(false)} title="ส่งคำขอแก้ไขแล้ว" sub="รอ HR ยืนยัน" icon={<IconCircle color="bg-emerald-600">✓</IconCircle>} footer={<Btn className="flex-1" onClick={() => setSent(false)}>ตกลง</Btn>} />
    </>
  );
}
