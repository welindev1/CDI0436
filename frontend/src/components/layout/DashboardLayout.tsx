'use client';

import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-[280px] transition-all duration-300">
        <Header />
        
        <main className="p-4 sm:p-6 pt-16 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}