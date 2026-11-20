'use client';

import React from 'react';
import NoticeHeader from '@/components/ui/NoticeHeader';
import { useStore } from '@/lib/store';

export default function Header() {
  const { session } = useStore();
  return <NoticeHeader target={session?.employeeId || '-'} color="bg-[#2563eb]" roleLabel={`พนักงาน • ${session?.employeeId || ''}`} />;
}
