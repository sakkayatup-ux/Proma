import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ป้องกันหน้าเว็บตามบทบาท: ยังไม่ล็อกอิน → /login, เข้าหน้าที่ไม่ใช่ของตัวเอง → พาไปหน้าของบทบาทนั้น
const HOME: Record<string, string> = { user: '/', hr: '/Hr', manager: '/manager' };

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value;
  const role = request.cookies.get('role')?.value || '';
  const { pathname } = request.nextUrl;

  if (pathname === '/login') return NextResponse.next();
  if (!isLoggedIn || !HOME[role]) return NextResponse.redirect(new URL('/login', request.url));

  const area = pathname.startsWith('/Hr') ? 'hr' : pathname.startsWith('/manager') ? 'manager' : 'user';
  if (area !== role) return NextResponse.redirect(new URL(HOME[role], request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
