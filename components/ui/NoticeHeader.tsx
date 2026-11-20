'use client';

import React, { useState } from 'react';
import { thDateTime, useStore } from '@/lib/store';

// แถบหัวด้านบน: กระดิ่งแจ้งเตือน (ข้อมูลจริง) + ชื่อผู้ใช้ที่ล็อกอิน
export default function NoticeHeader({ target, color, roleLabel }: { target: string; color: string; roleLabel: string }) {
  const { db, session, mutate } = useStore();
  const [open, setOpen] = useState(false);
  const list = (db?.notices || []).filter((n) => n.to === target).slice(0, 20);
  const unread = list.filter((n) => !n.read).length;
  const name = session?.name || '-';

  const toggle = () => {
    setOpen((o) => !o);
    if (!open && unread) mutate((d) => d.notices.forEach((n) => n.to === target && (n.read = true)));
  };

  return (
    <div className="flex items-center justify-end gap-3 mb-8 relative">
      <button onClick={toggle} className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border cursor-pointer ${unread ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-slate-500 border-slate-200'}`}>
        แจ้งเตือน {unread}
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-4 max-h-96 overflow-y-auto">
          <p className="font-bold text-sm mb-3">การแจ้งเตือน</p>
          {list.length === 0 && <p className="text-xs text-slate-400 py-6 text-center">ยังไม่มีการแจ้งเตือน</p>}
          {list.map((n) => (
            <div key={n.id} className="py-2.5 border-b border-slate-100 last:border-0">
              <p className="text-xs text-slate-800">{n.text}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{thDateTime(n.at)}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2.5 bg-white p-1.5 pr-4 rounded-full border border-slate-200/80 shadow-sm">
        <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm ${color}`}>{name.charAt(0)}</div>
        <div className="text-left">
          <div className="text-xs font-bold text-slate-900 leading-tight">{name}</div>
          <div className="text-[10px] text-slate-400">{roleLabel}</div>
        </div>
      </div>
    </div>
  );
}
