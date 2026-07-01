'use client';

import { Suspense } from 'react';
import { DynamicSidebar, DynamicHeader } from '@/lib/dynamic-imports';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function SidebarFallback() {
  return (
    <div className="w-[280px] h-screen bg-[#f8fafc] border-r border-gray-200 flex-shrink-0 hidden lg:block" />
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<SidebarFallback />}>
        <DynamicSidebar />
      </Suspense>

      <div className="lg:pl-[280px] transition-all duration-300">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
          <DynamicHeader />
        </Suspense>

        <main className="p-4 sm:p-6 pt-16 lg:pt-6">
          <Suspense fallback={<div className="animate-pulse space-y-4">{/* lightweight fallback */}</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
