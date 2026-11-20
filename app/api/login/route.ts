import { NextResponse } from 'next/server';
import { load } from '@/lib/db/server';


// ตรวจชื่อผู้ใช้/รหัสผ่านจากฐานข้อมูล แล้วส่งบทบาทกลับไป
export async function POST(req: Request) {
  const { username, password } = (await req.json()) as { username: string; password: string };
  const db = await load();
  const u = (username || '').trim().toLowerCase();
  const acc = db.accounts.find((a) => a.username.toLowerCase() === u && a.password === password);
  if (!acc) {
    return NextResponse.json({ ok: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }
  const res = NextResponse.json({
    ok: true,
    session: { username: acc.username, role: acc.role, name: acc.name, employeeId: acc.employeeId ?? null },
  });
  res.cookies.set('isLoggedIn', 'true', { path: '/' });
  res.cookies.set('role', acc.role, { path: '/' });
  return res;
}
