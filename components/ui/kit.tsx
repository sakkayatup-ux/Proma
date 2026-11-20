'use client';

import React from 'react';
import type { ClaimStatus } from '@/lib/db/types';
import { STATUS_LABEL, STATUS_STYLE } from '@/lib/store';

// ชุดส่วนประกอบหน้าตาร่วมกันทั้งระบบ (ตรงกับ Design System ใน Figma)

export const Card = ({ title, sub, right, children, className = '' }: { title?: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode; children?: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 ${className}`}>
    {(title || right) && (
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          {title && <p className="font-bold text-slate-900 text-sm">{title}</p>}
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </div>
);

export const PageTitle = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{title}</h2>
    {sub && <p className="text-xs text-slate-400">{sub}</p>}
  </div>
);

type BtnKind = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
const BTN: Record<BtnKind, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  ghost: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
};
export const Btn = ({ kind = 'primary', className = '', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: BtnKind }) => (
  <button
    {...p}
    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${BTN[kind]} ${className}`}
  />
);

export const StatusPill = ({ status }: { status: ClaimStatus }) => (
  <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>
);

export const Stat = ({ label, value, sub, subClass = 'text-slate-400' }: { label: string; value: React.ReactNode; sub?: string; subClass?: string }) => (
  <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
    <p className="text-xs text-slate-400 mb-2">{label}</p>
    <p className="text-3xl font-extrabold text-slate-900 mb-1">{value}</p>
    {sub && <p className={`text-[11px] ${subClass}`}>{sub}</p>}
  </div>
);

export const Empty = ({ text }: { text: string }) => (
  <div className="py-10 text-center text-sm text-slate-400">{text}</div>
);

export const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
  </label>
);

export const inputCls =
  'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500';

export const Modal = ({ open, onClose, title, sub, icon, children, footer, wide }: { open: boolean; onClose: () => void; title: string; sub?: string; icon?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl p-7 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-5">
          {icon}
          <div className="flex-1">
            <p className="font-bold text-slate-900">{title}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
        </div>
        {children}
        {footer && <div className="flex gap-3 mt-6">{footer}</div>}
      </div>
    </div>
  );
};

export const IconCircle = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${color}`}>{children}</div>
);

// แถบความคืบหน้า 4 ขั้นของคำขอ
export const ClaimSteps = ({ status }: { status: ClaimStatus }) => {
  const idx = { pending_hr: 1, returned: 0, pending_mgmt: 2, approved: 4, rejected: 4 }[status];
  const steps = ['ส่งคำขอ', 'HR ตรวจสอบ', 'ผู้บริหารพิจารณา', status === 'rejected' ? 'ไม่อนุมัติ' : 'อนุมัติ'];
  return (
    <div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
        {steps.map((_, i) => (
          <div key={i} className={`h-full w-1/4 ${status === 'rejected' && i === 3 ? 'bg-rose-500' : i < idx ? 'bg-emerald-500' : i === idx ? 'bg-blue-600' : 'bg-slate-200'}`} />
        ))}
      </div>
      <div className="grid grid-cols-4 text-[11px] mt-2 text-center font-medium text-slate-500">
        {steps.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </div>
  );
};

export const AttachmentList = ({ items }: { items: { name: string; label: string; dataUrl?: string }[] }) => {
  const [open, setOpen] = React.useState<string | null>(null);
  if (!items.length) return <p className="text-xs text-slate-400">ไม่มีไฟล์แนบ</p>;
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((a, i) => (
          <button key={i} onClick={() => a.dataUrl && setOpen(a.dataUrl)} className="text-left bg-blue-50 border border-blue-100 rounded-xl p-3 hover:bg-blue-100 cursor-pointer">
            {a.dataUrl ? <img src={a.dataUrl} alt={a.label} className="w-full h-24 object-cover rounded-lg mb-2" /> : <div className="w-full h-24 rounded-lg mb-2 bg-white flex items-center justify-center text-2xl">📄</div>}
            <p className="text-xs font-semibold text-blue-800 truncate">{a.label}</p>
            <p className="text-[10px] text-blue-500 truncate">{a.name}</p>
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-6" onClick={() => setOpen(null)}>
          <img src={open} alt="หลักฐาน" className="max-h-[85vh] max-w-full rounded-xl" />
        </div>
      )}
    </>
  );
};
