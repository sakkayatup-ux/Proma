import { DbProvider } from '@/lib/store';
import './globals.css';

export const metadata = {
  title: 'พนักงานและสวัสดิการ',
  description: 'ระบบสวัสดิการ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body><DbProvider>{children}</DbProvider></body>
    </html>
  );
}