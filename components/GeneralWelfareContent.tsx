'use client';

import React, { useState } from 'react';
import type { Attachment, WelfareKind } from '@/lib/db/types';
import { baht, Go, nextId, notify, nowIso, readAttachment, usageOf, useStore, WELFARE_LABEL } from '@/lib/store';
import { AttachmentList, Btn, Card, Field, IconCircle, inputCls, Modal, PageTitle } from '@/components/ui/kit';

// G1 เบิกสวัสดิการทั่วไป → G1.1 ยืนยัน → G1.2 สำเร็จ / G2 ใช้สิทธิ์ครบแล้ว
export default function GeneralWelfareContent({ go }: { go: Go }) {
  const { db, me, mutate } = useStore();
  const [kind, setKind] = useState<WelfareKind>('self');
  const [patient, setPatient] = useState('');
  const [relation, setRelation] = useState('บิดา');
  const [hospital, setHospital] = useState('');
  const [date, setDate] = useState('');
  const [diag, setDiag] = useState('');
  const [amount, setAmount] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [err, setErr] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [full, setFull] = useState(false);

  if (!db || !me) return null;
  const b = db.budget;
  const u = usageOf(db, me.id);
  const limit = kind === 'self' ? b.selfPerVisit : kind === 'family_opd' ? b.familyOpd : b.familyIpd;
  const familyLeft = Math.max(0, b.familyYearCap - u.familyUsed);
  const maxPay = kind === 'self' ? limit : Math.min(limit, familyLeft);
  const exhausted = kind === 'self' ? u.selfTimes >= b.selfMaxTimes : familyLeft <= 0;

  const addFiles = async (label: string, list: FileList | null) => {
    if (!list) return;
    const arr = await Promise.all(Array.from(list).map((f) => readAttachment(f, label)));
    setFiles((p) => [...p, ...arr]);
  };

  const check = () => {
    if (exhausted) { setFull(true); return; }
    const amt = +amount;
    let e = '';
    if (kind !== 'self' && !patient.trim()) e = 'กรุณากรอกชื่อผู้ป่วย';
    else if (!hospital.trim()) e = 'กรุณากรอกชื่อสถานพยาบาล';
    else if (!date) e = 'กรุณาระบุวันที่รักษา';
    else if (!amt || amt <= 0) e = 'กรุณากรอกจำนวนเงินตามใบเสร็จ';
    else if (!files.length) e = 'กรุณาแนบใบเสร็จรับเงิน';
    setErr(e);
    if (!e) setConfirm(true);
  };

  const submit = async () => {
    let id = '';
    await mutate((d) => {
      const t = nowIso();
      id = nextId(d, 'WF');
      d.claims.unshift({
        id, type: 'welfare', employeeId: me.id, status: 'pending_hr', createdAt: t, updatedAt: t,
        welfareKind: kind, patientName: kind === 'self' ? me.name : patient, relation: kind === 'self' ? 'ตนเอง' : relation,
        hospital, treatDate: date, diagnosis: diag, requestedAmount: Math.min(+amount, maxPay),
        currentAddress: me.currentAddress, description: diag, attachments: files,
      });
      notify(d, 'hr', `คำขอสวัสดิการ ${id} จาก ${me.name} รอตรวจสอบ`);
      notify(d, me.id, `ส่งคำขอ ${id} แล้ว รอ HR ตรวจสอบ`);
    });
    setConfirm(false);
    setDone(id);
    setFiles([]); setAmount(''); setHospital(''); setDiag(''); setPatient(''); setDate('');
  };

  return (
    <>
      <PageTitle title="เบิกสวัสดิการทั่วไป" sub="ค่ารักษาพยาบาลตนเองและครอบครัว ตามประกาศบริษัท" />
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {(Object.keys(WELFARE_LABEL) as WelfareKind[]).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={`text-left p-5 rounded-2xl border-2 cursor-pointer transition ${kind === k ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-200'}`}>
            <div className="font-bold text-sm">{WELFARE_LABEL[k]}</div>
            <div className="text-xs text-slate-500 mt-1">
              {k === 'self' ? `${baht(b.selfPerVisit)}/ครั้ง • ใช้แล้ว ${u.selfTimes}/${b.selfMaxTimes} ครั้ง` : `สูงสุด ${baht(k === 'family_opd' ? b.familyOpd : b.familyIpd)}/ครั้ง • คงเหลือปีนี้ ${baht(familyLeft)}`}
            </div>
          </button>
        ))}
      </div>
      <div className="grid xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2" title="รายละเอียดการรักษา">
          <div className="grid sm:grid-cols-2 gap-4">
            {kind === 'self' ? (
              <Field label="ผู้ป่วย"><input className={inputCls} value={`${me.name} (ตนเอง)`} disabled /></Field>
            ) : (
              <>
                <Field label="ชื่อผู้ป่วย"><input className={inputCls} value={patient} onChange={(e) => setPatient(e.target.value)} /></Field>
                <Field label="ความสัมพันธ์">
                  <select className={inputCls} value={relation} onChange={(e) => setRelation(e.target.value)}>
                    {['บิดา', 'มารดา', 'คู่สมรส', 'บุตร'].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
              </>
            )}
            <Field label="สถานพยาบาล"><input className={inputCls} value={hospital} onChange={(e) => setHospital(e.target.value)} /></Field>
            <Field label="วันที่รักษา"><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="จำนวนเงินตามใบเสร็จ (บาท)" hint={`เบิกได้สูงสุด ${baht(maxPay)} ต่อครั้ง`}><input type="number" min={0} className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
            <Field label="อาการ / การวินิจฉัย"><input className={inputCls} value={diag} onChange={(e) => setDiag(e.target.value)} /></Field>
          </div>
          <div className="flex flex-wrap gap-2 mt-6 mb-4">
            {['ใบเสร็จรับเงิน', 'ใบรับรองแพทย์'].map((lb) => (
              <label key={lb} className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-2 rounded-xl cursor-pointer hover:bg-blue-100">
                + {lb}
                <input type="file" multiple className="hidden" onChange={(e) => addFiles(lb, e.target.files)} />
              </label>
            ))}
          </div>
          <AttachmentList items={files} />
        </Card>
        <Card title="สรุปยอดเบิก">
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-slate-500">ตามใบเสร็จ</span><b>{baht(+amount)}</b></div>
            <div className="flex justify-between"><span className="text-slate-500">เบิกได้</span><b className="text-blue-600">{baht(Math.min(+amount || 0, maxPay))}</b></div>
          </div>
          {err && <p className="text-xs text-rose-600 mt-3">{err}</p>}
          <Btn className="w-full mt-5" onClick={check}>ส่งคำขอเบิก</Btn>
        </Card>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="ยืนยันส่งคำขอเบิก?" icon={<IconCircle color="bg-blue-600">?</IconCircle>}
        footer={<><Btn kind="secondary" className="flex-1" onClick={() => setConfirm(false)}>กลับไปแก้ไข</Btn><Btn className="flex-1" onClick={submit}>ยืนยัน</Btn></>}>
        <p className="text-sm">{WELFARE_LABEL[kind]} • {hospital} • ยอดเบิก {baht(Math.min(+amount || 0, maxPay))}</p>
      </Modal>
      <Modal open={!!done} onClose={() => setDone(null)} title="ส่งคำขอสำเร็จ" sub={`เลขที่ ${done} • รอ HR ตรวจสอบ`} icon={<IconCircle color="bg-emerald-600">✓</IconCircle>}
        footer={<><Btn kind="secondary" className="flex-1" onClick={() => go('หน้าหลัก')}>กลับหน้าหลัก</Btn><Btn className="flex-1" onClick={() => go('ติดตามสถานะ', done)}>ติดตามสถานะ</Btn></>} />
      <Modal open={full} onClose={() => setFull(false)} title="ใช้สิทธิ์ครบแล้ว" sub={kind === 'self' ? `ปีนี้เบิกครบ ${b.selfMaxTimes} ครั้งแล้ว` : 'วงเงินครอบครัวปีนี้ครบแล้ว'} icon={<IconCircle color="bg-rose-500">!</IconCircle>}
        footer={<Btn className="flex-1" onClick={() => setFull(false)}>รับทราบ</Btn>} />
    </>
  );
}
