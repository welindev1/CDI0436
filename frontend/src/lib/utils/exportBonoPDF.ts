/**
 * Utility functions for bond (bono) generation and printing.
 */

export function calcularFechaExpiracion(): string {
  const now = new Date();
  const exp = new Date(now);
  exp.setMonth(exp.getMonth() + 1);
  exp.setDate(exp.getDate() + 15);
  const d = exp.getDate().toString().padStart(2, '0');
  const m = (exp.getMonth() + 1).toString().padStart(2, '0');
  const y = exp.getFullYear();
  return `${d}/${m}/${y}`;
}

export function formatMonto(val: string): string {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return `RD$${num.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
