'use client';

import { ReactNode } from 'react';
import LEDPlatformApp from '@/components/LEDPlatformApp';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <LEDPlatformApp>{children}</LEDPlatformApp>;
} 