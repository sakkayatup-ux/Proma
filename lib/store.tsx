'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Claim, ClaimStatus, Db, Employee, Role } from './db/types';

// ============================================================================
// Store กลางฝั่งหน้าเว็บ: ดึงข้อมูลจาก /api/db ทุก 2 วินาที และบันทึกกลับเมื่อมีการเปลี่ยนแปลง
// ทำให้พนักงาน / HR / ผู้บริหาร เห็นข้อมูลชุดเดียวกันแบบเรียลไทม์
// ============================================================================

export interface Session {
  username: string;
  role: Role;
  name: string;
  employeeId: string | null;
}

interface StoreValue {
  db: Db | null;
  session: Session | null;
  mutate: (fn: (draft: Db) => void) => Promise<void>;
  me: Employee | null;
}

const Ctx = createContext<StoreValue | null>(null);

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Db | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    try {
      const r = await fetch('/api/db', { cache: 'no-store' });
      if (r.ok) {
        const next: Db = await r.json();
        // อัปเดตเฉพาะเมื่อข้อมูลเปลี่ยนจริง (rev ใหม่) เพื่อไม่ให้ช่องที่กำลังพิมพ์ถูกรีเซ็ต
        setDb((prev) => (prev && prev.rev === next.rev ? prev : next));
      }
    } catch {
      /* ออฟไลน์ชั่วคราว */
    }
  }, []);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem('session');
      if (s) setSession(JSON.parse(s));
    } catch {}
    refresh();
    const t = setInterval(refresh, 2000);
    return () => clearInterval(t);
  }, [refresh]);

  // แก้ไขข้อมูล: โหลดฉบับล่าสุด → ใส่การเปลี่ยนแปลง → บันทึก (ถ้าชนกับคนอื่นจะลองใหม่อัตโนมัติ)
  const mutate = useCallback(async (fn: (draft: Db) => void) => {
    busy.current = true;
    try {
      for (let attempt = 0; attempt < 5; attempt++) {
        const latest: Db = await (await fetch('/api/db', { cache: 'no-store' })).json();
        const draft: Db = JSON.parse(JSON.stringify(latest));
        fn(draft);
        const r = await fetch('/api/db', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        });
        if (r.ok) {
          setDb(await r.json());
          return;
        }
        if (r.status !== 409) throw new Error('บันทึกไม่สำเร็จ');
      }
      throw new Error('มีผู้ใช้งานแก้ไขพร้อมกันหลายครั้ง กรุณาลองใหม่');
    } finally {
      busy.current = false;
    }
  }, []);

  const me = db && session?.employeeId ? db.employees.find((e) => e.id === session.employeeId) ?? null : null;

  return <Ctx.Provider value={{ db, session, mutate, me }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore ต้องอยู่ภายใน DbProvider');
  return v;
}

// ---------------------------------------------------------------------------
// ตัวช่วยทั่วไป
// ---------------------------------------------------------------------------
export type Go = (tab: string, claimId?: string | null) => void;

export const nowIso =() => new Date().toISOString();

// ออกเลขที่เอกสารต่อเนื่อง เช่น DR-0001
export const nextId = (db: Db, prefix: string, pad = 4) => {
  const n = (db.seq[prefix] || 0) + 1;
  db.seq[prefix] = n;
  return `${prefix}-${String(n).padStart(pad, '0')}`;
};

export const notify = (db: Db, to: string, text: string) => {
  db.notices.unshift({ id: nextId(db, 'N', 6), to, text, at: nowIso(), read: false });
};

export const baht = (n: number | undefined) => '฿' + Math.round(n || 0).toLocaleString('th-TH');

const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
export const thDate = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${TH_MONTH[d.getMonth()]} ${d.getFullYear() + 543}`;
};
export const thDateTime = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${thDate(iso)} ${d.toTimeString().slice(0, 5)} น.`;
};

export const STATUS_LABEL: Record<ClaimStatus, string> = {
  pending_hr: 'รอ HR ตรวจสอบ',
  returned: 'ส่งกลับให้แก้ไข',
  pending_mgmt: 'รอผู้บริหารอนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ไม่อนุมัติ',
};
export const STATUS_STYLE: Record<ClaimStatus, string> = {
  pending_hr: 'bg-amber-50 text-amber-700 border-amber-200',
  returned: 'bg-slate-100 text-slate-600 border-slate-200',
  pending_mgmt: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-600 border-rose-200',
};

export const LEVEL_LABEL: Record<number, string> = { 1: 'ระดับ 1 (เล็กน้อย)', 2: 'ระดับ 2 (ปานกลาง)', 3: 'ระดับ 3 (หนักมาก)' };

export const WELFARE_LABEL = { self: 'ค่ารักษาพยาบาล (ตนเอง)', family_opd: 'ครอบครัว • ผู้ป่วยนอก (OPD)', family_ipd: 'ครอบครัว • ผู้ป่วยใน (IPD)' };

// ยอดที่ได้รับจริง/สถิติการใช้สิทธิ์ของพนักงานในปีปัจจุบัน
export const usageOf = (db: Db, employeeId: string) => {
  const year = new Date().getFullYear();
  const mine = db.claims.filter((c) => c.employeeId === employeeId && new Date(c.createdAt).getFullYear() === year);
  const approved = mine.filter((c) => c.status === 'approved');
  const sum = (arr: Claim[]) => arr.reduce((s, c) => s + (c.mgmt?.amount || 0), 0);
  const disasterUsed = sum(approved.filter((c) => c.type === 'disaster'));
  const welfareUsed = sum(approved.filter((c) => c.type === 'welfare'));
  const active = mine.filter((c) => c.status !== 'rejected');
  const selfTimes = active.filter((c) => c.welfareKind === 'self').length;
  const familyUsed = approved.filter((c) => c.welfareKind && c.welfareKind !== 'self').reduce((s, c) => s + (c.mgmt?.amount || 0), 0);
  return { mine, disasterUsed, welfareUsed, selfTimes, familyUsed };
};

// อ่านไฟล์ที่ผู้ใช้เลือกเป็นไฟล์แนบ (รูปไม่เกิน 600KB เก็บภาพไว้เปิดดูได้)
export const readAttachment = (file: File, label: string): Promise<{ name: string; label: string; dataUrl?: string }> =>
  new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.size > 600_000) return resolve({ name: file.name, label });
    const fr = new FileReader();
    fr.onload = () => resolve({ name: file.name, label, dataUrl: String(fr.result) });
    fr.onerror = () => resolve({ name: file.name, label });
    fr.readAsDataURL(file);
  });

export const logout = () => {
  document.cookie = 'role=; path=/; max-age=0';
  document.cookie = 'isLoggedIn=; path=/; max-age=0';
  sessionStorage.clear();
  window.location.href = '/login';
};
