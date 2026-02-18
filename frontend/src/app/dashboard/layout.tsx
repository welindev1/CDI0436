'use client';

import PrimerLoginModal from '@/components/auth/PrimerLoginModal';

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PrimerLoginModal />
      {children}
    </>
  );
}