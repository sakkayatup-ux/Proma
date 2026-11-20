'use client';

import React, { useState } from 'react';
import type { Employee } from '@/lib/db/types';
import { baht, nextId, notify, nowIso, thDate, useStore } from '@/lib/store';
import { AttachmentList, Btn, Card, Empty, Field, IconCircle, inputCls, Modal, PageTitle, StatusPill } from '@/components/ui/kit';

const DEFAULT_PASSWORD = '1234';
const FIELDS: { k: keyof Employee; l: string; type?: string; full?: boolean }[] = [
  { k: 'name', l: 'ชื่อ-นามสกุล' }, { k: 'department', l: 'แผนก' }, { k: 'position', l: 'ตำแหน่ง' }, { k: 'contractType', l: 'ประเภทการจ้าง' },
  { k: 'startDate', l: 'วันเริ่มงาน', type: 'date' }, { k: 'phone', l: 'เบอร์โทร' }, { k: 'email', l: 'อีเมล' }, { k: 'familyMembers', l: 'สมาชิกครอบครัว (คน)', type: 'number' },
  { k: 'bank', l: 'ธนาคาร' }, { k: 'bankAccount', l: 'เลขบัญชี' }, { k: 'province', l: 'จังหวัด' },
  { k: 'registeredAddress', l: 'ที่อยู่ตามทะเบียนบ้าน', full: true }, { k: 'currentAddress', l: 'ที่พักปัจจุบัน', full: true },
];
const empty = (): Omit<Employee, 'id' | 'createdAt'> => ({ name: '', department: '', position: '', contractType: 'พนักงานประจำ', startDate: '', phone: '', email: '', bank: '', bankAccount: '', registeredAddress: '', currentAddress: '', province: '', familyMembers: 0 });

// H3 • ทะเบียนประวัติพนักงาน + คำขอแก้ไขข้อมูล
export default function HrEmployeeContent() {
  const { db, mutate } = useStore();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [form, setForm] = useState<ReturnType<typeof empty> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [err, setErr] = useState('');
  if (!db) return null;

  const list = db.employees.filter((e) => `${e.id} ${e.name} ${e.department}`.toLowerCase().includes(q.toLowerCase()));
  const cur = db.employees.find((e) => e.id === sel);
  const edits = db.edits.filter((e) => e.status === 'pending');

  const save = async () => {
    if (!form) return;
    if (!form.name.trim() || !form.department.trim()) return setErr('กรุณากรอกชื่อและแผนก');
    let id = editId ?? '';
    await mutate((d) => {
      if (editId) {
        Object.assign(d.employees.find((e) => e.id === editId)!, form);
        const acc = d.accounts.find((a) => a.employeeId === editId);
        if (acc) acc.name = form.name;
      } else {
        id = nextId(d, 'EMP', 3);
        d.employees.push({ ...form, id, createdAt: nowIso() });
        d.accounts.push({ username: id, password: DEFAULT_PASSWORD, role: 'user', name: form.name, employeeId: id });
        notify(d, id, 'ยินดีต้อนรับสู่ระบบสวัสดิการ กรุณาตรวจสอบข้อมูลส่วนตัว');
      }
    });
    setForm(null); setErr('');
    if (!editId) setCreated(id);
    setSel(id); setEditId(null);
  };

  const review = (id: string, ok: boolean) => mutate((d) => {
    const e = d.edits.find((x) => x.id === id)!;
    e.status = ok ? 'approved' : 'rejected'; e.reviewedAt = nowIso();
    if (ok) {
      const emp = d.employees.find((x) => x.id === e.employeeId)!;
      (emp as unknown as Record<string, unknown>)[e.field] = e.field === 'familyMembers' ? +e.newValue : e.newValue;
    }
    notify(d, e.employeeId, `คำขอแก้ไข${e.fieldLabel} ${ok ? 'ได้รับการอัปเดตแล้ว' : 'ไม่ได้รับอนุมัติ'}`);
  });

  return (
    <>
      <div className="flex justify-between items-start gap-4"><PageTitle title="ทะเบียนประวัติพนักงาน" sub={`${db.employees.length} คน • พนักงานใหม่จะได้บัญชีเข้าระบบอัตโนมัติ`} /><Btn onClick={() => { setEditId(null); setForm(empty()); }}>+ เพิ่มพนักงาน</Btn></div>

      {edits.length > 0 && (
        <Card title={`คำขอแก้ไขข้อมูล (${edits.length})`} className="mb-6">
          <div className="space-y-3">
            {edits.map((e) => (
              <div key={e.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-sm">
                <div>
                  <b>{db.employees.find((x) => x.id === e.employeeId)?.name}</b> ขอแก้ <b>{e.fieldLabel}</b>: <span className="line-through text-slate-400">{e.oldValue || '-'}</span> → <b>{e.newValue}</b>
                  {e.reason && <div className="text-xs text-slate-500 mt-1">เหตุผล: {e.reason}</div>}
                  {e.attachment && <div className="mt-2"><AttachmentList items={[e.attachment]} /></div>}
                </div>
                <div className="flex gap-2 shrink-0"><Btn kind="secondary" className="text-xs px-3 py-1.5" onClick={() => review(e.id, false)}>ไม่อนุมัติ</Btn><Btn kind="success" className="text-xs px-3 py-1.5" onClick={() => review(e.id, true)}>ยืนยันแก้ไข</Btn></div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid xl:grid-cols-5 gap-6">
        <Card className="xl:col-span-2" title="รายชื่อพนักงาน">
          <input className={inputCls + ' mb-4'} placeholder="ค้นหารหัส / ชื่อ / แผนก" value={q} onChange={(e) => setQ(e.target.value)} />
          {list.length === 0 && <Empty text={db.employees.length ? 'ไม่พบพนักงาน' : 'ยังไม่มีพนักงานในทะเบียน'} />}
          <div className="space-y-2 max-h-[560px] overflow-y-auto">
            {list.map((e) => (
              <button key={e.id} onClick={() => setSel(e.id)} className={`w-full text-left p-3 rounded-xl border cursor-pointer ${sel === e.id ? 'border-violet-500 bg-violet-50' : 'border-slate-100 bg-slate-50'}`}>
                <b className="text-sm">{e.name}</b><div className="text-xs text-slate-500">{e.id} • {e.department} • {e.position}</div>
              </button>
            ))}
          </div>
        </Card>
        <div className="xl:col-span-3">
          {cur ? (
            <Card title={cur.name} sub={`${cur.id} • บัญชีเข้าระบบ: ${cur.id}`} right={<Btn kind="secondary" className="text-xs px-3 py-1.5" onClick={() => { setEditId(cur.id); const { id: _i, createdAt: _c, ...rest } = cur; void _i; void _c; setForm(rest); }}>แก้ไขข้อมูล</Btn>}>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                {FIELDS.map((f) => <div key={f.k} className={`flex justify-between gap-3 border-b border-slate-50 pb-2 ${f.full ? 'sm:col-span-2' : ''}`}><span className="text-slate-400">{f.l}</span><b className="text-right">{f.k === 'startDate' ? thDate(cur.startDate) : String(cur[f.k] || '-')}</b></div>)}
              </div>
              <h4 className="font-bold text-sm mt-6 mb-3">ประวัติคำขอ</h4>
              {db.claims.filter((c) => c.employeeId === cur.id).length === 0 && <p className="text-xs text-slate-400">ยังไม่มีคำขอ</p>}
              <div className="space-y-2">
                {db.claims.filter((c) => c.employeeId === cur.id).map((c) => (
                  <div key={c.id} className="flex justify-between items-center text-xs bg-slate-50 rounded-lg p-3"><span>{c.id} • {thDate(c.createdAt)} {c.mgmt?.amount ? `• ${baht(c.mgmt.amount)}` : ''}</span><StatusPill status={c.status} /></div>
                ))}
              </div>
            </Card>
          ) : <Card><Empty text="เลือกพนักงานเพื่อดูรายละเอียด" /></Card>}
        </div>
      </div>

      <Modal wide open={!!form} onClose={() => setForm(null)} title={editId ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
        footer={<><Btn kind="secondary" className="flex-1" onClick={() => setForm(null)}>ยกเลิก</Btn><Btn className="flex-1" onClick={save}>บันทึก</Btn></>}>
        {form && (
          <div className="grid sm:grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div key={f.k} className={f.full ? 'sm:col-span-2' : ''}>
                <Field label={f.l}>
                  {f.k === 'contractType' ? (
                    <select className={inputCls} value={form.contractType} onChange={(e) => setForm({ ...form, contractType: e.target.value })}>{['พนักงานประจำ', 'ทดลองงาน', 'สัญญาจ้าง'].map((x) => <option key={x}>{x}</option>)}</select>
                  ) : (
                    <input type={f.type || 'text'} className={inputCls} value={String(form[f.k as keyof typeof form] ?? '')} onChange={(e) => setForm({ ...form, [f.k]: f.type === 'number' ? +e.target.value : e.target.value })} />
                  )}
                </Field>
              </div>
            ))}
            {err && <p className="text-xs text-rose-600 sm:col-span-2">{err}</p>}
          </div>
        )}
      </Modal>
      <Modal open={!!created} onClose={() => setCreated(null)} title="เพิ่มพนักงานสำเร็จ" sub={`ชื่อผู้ใช้ ${created} • รหัสผ่านเริ่มต้น ${DEFAULT_PASSWORD}`} icon={<IconCircle color="bg-emerald-600">✓</IconCircle>} footer={<Btn className="flex-1" onClick={() => setCreated(null)}>ตกลง</Btn>} />
    </>
  );
}
