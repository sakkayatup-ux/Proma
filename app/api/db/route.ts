import { NextResponse } from 'next/server';
import { load, save, stripPasswords } from '@/lib/db/server';
import type { Db } from '@/lib/db/types';

// ฐานข้อมูลไฟล์ JSON ฝั่งเซิร์ฟเวอร์ — ทุกเครื่องที่เปิดเว็บเห็นข้อมูลชุดเดียวกัน

export async function GET() {
  return NextResponse.json(stripPasswords(await load()), { headers: { 'Cache-Control': 'no-store' } });
}

// บันทึกทั้งก้อน — ถ้ามีคนอื่นบันทึกก่อน (rev ไม่ตรง) จะตอบ 409 ให้ฝั่งเว็บโหลดใหม่แล้วลองอีกครั้ง
export async function PUT(req: Request) {
  const body = (await req.json()) as Db;
  const current = await load();
  if (body.rev !== current.rev) {
    return NextResponse.json(stripPasswords(current), { status: 409 });
  }
  // รหัสผ่านไม่ถูกส่งไปที่หน้าเว็บ: ถ้าบัญชีเดิมส่งมาเป็นค่าว่าง ให้ใช้รหัสผ่านเดิม
  const accounts = body.accounts.map((a) => {
    const old = current.accounts.find((o) => o.username === a.username);
    return { ...a, password: a.password || old?.password || '1234' };
  });
  const next: Db = { ...body, accounts, rev: current.rev + 1 };
  await save(next);
  return NextResponse.json(stripPasswords(next));
}
