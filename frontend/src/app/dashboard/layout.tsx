'use client';

import { Suspense, lazy } from 'react';

const PrimerLoginModal = lazy(() => import('@/components/auth/PrimerLoginModal'));

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <PrimerLoginModal />
      </Suspense>
      {children}
    </>
  );
}