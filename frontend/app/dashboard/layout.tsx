'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleSelector } from '@/components/dashboard/RoleSelector';
import { ReactNode } from 'react';

export default function DashboardRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
      <RoleSelector />
    </DashboardLayout>
  );
}
