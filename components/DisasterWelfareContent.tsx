'use client';

import React, { useEffect, useState } from 'react';
import type { Attachment, DisasterForm } from '@/lib/db/types';
import { baht, Go, LEVEL_LABEL, nextId, notify, nowIso, readAttachment, thDate, usageOf, useStore } from '@/lib/store';
import { AttachmentList, Btn, Card, Empty, Field, IconCircle, inputCls, Modal, PageTitle } from '@/components/ui/kit';

// U1 เลือกประเภทภัย → U2 กรอกฟอร์ม → U2.1 ยืนยันส่ง → U2.2 ส่งสำเร็จ
export default function DisasterWelfareContent({ go, editId }: { go: Go; editId?: string | null }) {
  const { db, me, mutate } = useStore();
  const editing = editId ? db?.claims.find((c) => c.id === editId && c.status === 'returned') : undefined;
  const [formId, setFormId] = useState<string | null>(editing?.formId ?? null);
  const [houseType, setHouseType] = useState(editing?.houseType ?? 'บ้านของตนเอง');
  const [address, setAddress] = useState(editing?.currentAddress ?? '');
  const [from, setFrom] = useState(editing?.impactFrom ?? '');
  const [to, setTo] = useState(editing?.impactTo ?? '');
  const [level, setLevel] = useState(editing?.selfLevel ?? 1);
  const [desc, setDesc] = useState(editing?.description ?? '');
  const [files, setFiles] = useState<Attachment[]>(editing?.attachments ?? []);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (me && !address) setAddress(me.currentAddress);
  }, [me, address]);

  if (!db || !me) return null;
  const forms = db.forms.filter((f) => f.status === 'open');
  const form = db.forms.find((f) => f.id === formId);
  const u = usageOf(db, me.id);
  const alreadyIn = (f: DisasterForm) => db.claims.some((c) => c.employeeId === me.id && c.formId === f.id && c.status !== 'rejected' && c.id !== editing?.id);

  const addFiles = async (label: string, list: FileList | null) => {
    if (!list) return;
    const arr = await Promise.all(Array.from(list).map((f) => readAttachment(f, label)));
    setFiles((p) => [...p, ...arr]);
  };

  const validate = () => {
    if (!address.trim()) return 'กรุณากรอกที่พักอาศัยที่ได้รับผลกระทบ';
    if (!from || !to) return 'กรุณาระบุช่วงวันที่ได้รับผลกระทบ';
    if (!desc.trim()) return 'กรุณาอธิบายความเสียหาย';
    if (files.length < 1) return 'กรุณาแนบรูปหรือเอกสารหลักฐานอย่างน้อย 1 ไฟล์';
    return '';
  };

  const submit = async () => {
    let id = '';
    await mutate((d) => {
      const t = nowIso();
      if (editing) {
        const c = d.claims.find((x) => x.id === editing.id)!;
        Object.assign(c, { houseType, currentAddress: address, impactFrom: from, impactTo: to, selfLevel: level, description: desc, attachments: files, status: 'pending_hr', updatedAt: t, returnReason: undefined });
        id = c.id;
      } else {
        id = nextId(d, 'DR');
        d.claims.unshift({ id, type: 'disaster', employeeId: me.id, status: 'pending_hr', createdAt: t, updatedAt: t, formId: form!.id, houseType, currentAddress: address, impactFrom: from, impactTo: to, selfLevel: level, description: desc, attachments: files });
      }
      notify(d, 'hr', `คำขอภัยพิบัติ ${id} จาก ${me.name} รอตรวจสอบ`);
      notify(d, me.id, `ส่งคำขอ ${id} แล้ว รอ HR ตรวจสอบเอกสาร`);
    });
    setConfirm(false);
    setDone(id);
  };

  // U1: เลือกแบบฟอร์ม
  if (!form) {
    return (
      <>
        <PageTitle title="เบิกสวัสดิการประเภทภัยพิบัติ" sub="เลือกแบบฟอร์มที่ HR เปิดรับ • ยื่นได้ 1 ครั้งต่อรอบ" />
        {forms.length === 0 && <Card><Empty text="ยังไม่มีแบบฟอร์มภัยพิบัติที่เปิดรับในขณะนี้" /></Card>}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {forms.map((f) => (
            <Card key={f.id} title={f.title} sub={`${f.disasterType} • รอบ ${f.round} • ปิดรับ ${thDate(f.closeDate)}`}>
              <p className="text-xs text-slate-500 mb-4 min-h-8">{f.description}</p>
              <div className="space-y-1 text-xs mb-5">
                {f.levels.map((l) => (
                  <div key={l.level} className="flex justify-between"><span className="text-slate-500">ระดับ {l.level} • {l.label}</span><b>{baht(l.amount)}</b></div>
                ))}
              </div>
              {alreadyIn(f) ? <p className="text-xs font-semibold text-emerald-600">ยื่นคำขอรอบนี้แล้ว</p> : <Btn className="w-full" onClick={() => setFormId(f.id)}>ยื่นคำขอ →</Btn>}
            </Card>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-6">ได้รับช่วยเหลือภัยพิบัติแล้วปีนี้ {baht(u.disasterUsed)}{db.budget.disasterAnnualCap ? ` จากเพดาน ${baht(db.budget.disasterAnnualCap)}` : ''}</p>
      </>
    );
  }

  // U2: กรอกแบบฟอร์ม
  return (
    <>
      <PageTitle title={editing ? `แก้ไขคำขอ ${editing.id}` : form.title} sub={`${form.disasterType} รอบ ${form.round} • ข้อมูลส่วนตัวดึงจากทะเบียนอัตโนมัติ ไม่ต้องกรอกยอดเงิน`} />
      {editing?.returnReason && <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">HR ส่งกลับให้แก้ไข: {editing.returnReason}</div>}
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card title="1. ข้อมูลผู้ยื่น (ดึงจากทะเบียน)">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="ชื่อ-นามสกุล"><input className={inputCls} value={me.name} disabled /></Field>
              <Field label="รหัสพนักงาน"><input className={inputCls} value={me.id} disabled /></Field>
              <Field label="แผนก"><input className={inputCls} value={me.department} disabled /></Field>
            </div>
          </Card>
          <Card title="2. ที่พักอาศัยและผลกระทบ">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="ลักษณะที่พัก">
                <select className={inputCls} value={houseType} onChange={(e) => setHouseType(e.target.value)}>
                  {['บ้านของตนเอง', 'บ้านเช่า', 'หอพัก/คอนโด', 'บ้านญาติ'].map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <Field label="ระดับความเสียหาย (ประเมินเบื้องต้น)">
                <select className={inputCls} value={level} onChange={(e) => setLevel(+e.target.value)}>
                  {form.levels.map((l) => <option key={l.level} value={l.level}>{LEVEL_LABEL[l.level] || `ระดับ ${l.level}`} • {l.label}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2"><Field label="ที่พักอาศัยที่ได้รับผลกระทบ" hint={`ที่อยู่ตามทะเบียน: ${me.registeredAddress || '-'}`}><input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} /></Field></div>
              <Field label="ได้รับผลกระทบตั้งแต่"><input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
              <Field label="ถึงวันที่"><input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} /></Field>
              <div className="sm:col-span-2"><Field label="อธิบายความเสียหาย"><textarea rows={3} className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field></div>
            </div>
          </Card>
          <Card title="3. หลักฐาน" sub="รูปถ่ายความเสียหาย และเอกสารที่อยู่ (ทะเบียนบ้าน / สัญญาเช่า)">
            <div className="flex flex-wrap gap-2 mb-4">
              {['รูปภายในบ้าน', 'รูปเครื่องใช้', 'รูประดับน้ำ/ความเสียหาย', 'เอกสารที่อยู่'].map((lb) => (
                <label key={lb} className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-2 rounded-xl cursor-pointer hover:bg-blue-100">
                  + {lb}
                  <input type="file" multiple className="hidden" onChange={(e) => addFiles(lb, e.target.files)} />
                </label>
              ))}
            </div>
            <AttachmentList items={files} />
            {files.length > 0 && <button className="text-xs text-rose-500 mt-3 cursor-pointer" onClick={() => setFiles([])}>ล้างไฟล์แนบทั้งหมด</button>}
          </Card>
        </div>
        <div className="space-y-4">
          <Card title="สรุปก่อนส่ง">
            <div className="text-xs space-y-2 text-slate-600">
              <p>แบบฟอร์ม: <b>{form.title}</b></p>
              <p>ระดับที่แจ้ง: <b>{level}</b></p>
              <p>ไฟล์แนบ: <b>{files.length}</b> ไฟล์</p>
              <p className="text-slate-400">🔒 HR / ผู้บริหารเป็นผู้ประเมินวงเงิน</p>
            </div>
            {err && <p className="text-xs text-rose-600 mt-3">{err}</p>}
            <Btn className="w-full mt-5" onClick={() => { const e = validate(); setErr(e); if (!e) setConfirm(true); }}>ยืนยันส่งคำขอ</Btn>
            {!editing && <Btn kind="secondary" className="w-full mt-2" onClick={() => setFormId(null)}>← เลือกแบบฟอร์มอื่น</Btn>}
          </Card>
        </div>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="ยืนยันส่งคำขอ?" sub="ตรวจสอบข้อมูลให้ถูกต้องก่อนส่ง" icon={<IconCircle color="bg-blue-600">?</IconCircle>}
        footer={<><Btn kind="secondary" className="flex-1" onClick={() => setConfirm(false)}>กลับไปแก้ไข</Btn><Btn className="flex-1" onClick={submit}>ยืนยันส่งคำขอ</Btn></>}>
        <div className="text-sm space-y-2">
          <p>{form.title}</p><p className="text-slate-500">{address}</p><p className="text-slate-500">{thDate(from)} – {thDate(to)}</p>
        </div>
      </Modal>
      <Modal open={!!done} onClose={() => go('หน้าหลัก')} title="ส่งคำขอสำเร็จ" sub={`เลขที่ ${done} • สถานะ: รอ HR ตรวจสอบเอกสาร`} icon={<IconCircle color="bg-emerald-600">✓</IconCircle>}
        footer={<><Btn kind="secondary" className="flex-1" onClick={() => go('หน้าหลัก')}>กลับหน้าหลัก</Btn><Btn className="flex-1" onClick={() => go('ติดตามสถานะ', done)}>ติดตามสถานะ</Btn></>} />
    </>
  );
}
