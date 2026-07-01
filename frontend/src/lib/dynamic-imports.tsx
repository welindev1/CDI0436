import dynamic from 'next/dynamic';

// ===================== Layout =====================
export const DynamicSidebar = dynamic(
  () => import('@/components/layout/Sidebar'),
  {
    ssr: false,
    loading: () => (
      <div className="w-[280px] h-screen bg-[#f8fafc] border-r border-gray-200 animate-pulse" />
    ),
  }
);

export const DynamicHeader = dynamic(
  () => import('@/components/layout/Header'),
  {
    ssr: false,
    loading: () => (
      <div className="h-16 bg-white border-b border-gray-200 animate-pulse" />
    ),
  }
);

// ===================== Auth =====================
export const DynamicPrimerLoginModal = dynamic(
  () => import('@/components/auth/PrimerLoginModal'),
  { ssr: false }
);

// ===================== Beneficiarios =====================
export const DynamicBeneficiarioForm = dynamic(
  () => import('@/components/beneficiarios/BeneficiarioForm'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 p-4">
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
      </div>
    ),
  }
);

export const DynamicImportarExcelModal = dynamic(
  () => import('@/components/beneficiarios/ImportarExcelModal'),
  { ssr: false }
);

export const DynamicBeneficiarioFolder = dynamic(
  () => import('@/components/beneficiarios/BeneficiarioFolder'),
  { ssr: false }
);

export const DynamicAgregarExpedienteModal = dynamic(
  () => import('@/components/beneficiarios/AgregarExpedienteModal'),
  { ssr: false }
);

export const DynamicEditarExpedienteModal = dynamic(
  () => import('@/components/beneficiarios/EditarExpedienteModal'),
  { ssr: false }
);

export const DynamicEditarPerfilModal = dynamic(
  () => import('@/components/beneficiarios/EditarPerfilModal'),
  { ssr: false }
);

// ===================== Clases =====================
export const DynamicClaseForm = dynamic(
  () => import('@/components/clases/ClaseForm'),
  { ssr: false }
);

export const DynamicAgregarBeneficiariosModal = dynamic(
  () => import('@/components/clases/AgregarBeneficiariosModal'),
  { ssr: false }
);

// ===================== Asistencias =====================
export const DynamicRegistroAsistencia = dynamic(
  () => import('@/components/asistencias/RegistroAsistencia'),
  { ssr: false }
);

// ===================== Tutores =====================
export const DynamicTutorForm = dynamic(
  () => import('@/components/tutores/TutorForm'),
  { ssr: false }
);

// ===================== UI (heavy) =====================
export const DynamicModal = dynamic(
  () => import('@/components/ui/Modal'),
  { ssr: false }
);

// Table exports named components (Table, TableHead, TableBody, TableRow, TableCell)
// Use: import { Table, TableHead, ... } from '@/components/ui/Table' directly
