'use client';

import type { BondCardProps } from '@/lib/types';
import { formatMonto } from '@/lib/utils/exportBonoPDF';

export default function BonoCard({ row, mes, expira }: BondCardProps) {
  return (
    <div
      className="bond-card"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '2000/971',
        backgroundImage: 'url(/bond_template.png)',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
      }}
    >
      {/* Mes */}
      <div style={{
        position: 'absolute', top: '37.3%', left: '44.5%',
        fontSize: 'clamp(7px, 1.4vw, 15px)', fontWeight: '400', color: '#1a1a1a', whiteSpace: 'nowrap',
      }}>
        {mes}
      </div>

      {/* Padre */}
      <div style={{
        position: 'absolute', top: '46.3%', left: '32%',
        fontSize: 'clamp(6px, 1.2vw, 13px)', fontWeight: '400', color: '#1a1a1a',
        maxWidth: '28%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {row.padre}
      </div>

      {/* Cédula */}
      <div style={{
        position: 'absolute', top: '46.3%', left: '76%',
        fontSize: 'clamp(6px, 1.2vw, 13px)', fontWeight: '400', color: '#1a1a1a',
        maxWidth: '18%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {row.cedula}
      </div>

      {/* Beneficiario */}
      <div style={{
        position: 'absolute', top: '55.2%', left: '37%',
        fontSize: 'clamp(6px, 1.2vw, 13px)', fontWeight: '400', color: '#1a1a1a',
        maxWidth: '26%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {row.beneficiario}
      </div>

      {/* Código */}
      <div style={{
        position: 'absolute', top: '55.2%', left: '76%',
        fontSize: 'clamp(6px, 1.2vw, 13px)', fontWeight: '400', color: '#1a1a1a', whiteSpace: 'nowrap',
      }}>
        {row.codigo}
      </div>

      {/* Monto */}
      <div style={{
        position: 'absolute', top: '64.5%', left: '25%',
        fontSize: 'clamp(7px, 1.4vw, 15px)', fontWeight: '400', color: '#1a1a1a', whiteSpace: 'nowrap',
      }}>
        {formatMonto(row.monto)}
      </div>

      {/* Expira */}
      <div style={{
        position: 'absolute', top: '80%', left: '66%',
        fontSize: 'clamp(6px, 1.2vw, 13px)', fontWeight: '400', color: 'red', whiteSpace: 'nowrap',
      }}>
        {expira}
      </div>
    </div>
  );
}
