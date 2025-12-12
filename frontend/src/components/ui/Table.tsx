import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-gray-200', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className }: TableProps) {
  return <thead className={cn('bg-gray-50', className)}>{children}</thead>;
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={cn('bg-white divide-y divide-gray-200', className)}>{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return <tr className={className}>{children}</tr>;
}

interface TableCellProps extends TableProps {
  isHeader?: boolean;
}

export function TableCell({ children, className, isHeader }: TableCellProps) {
  const Component = isHeader ? 'th' : 'td';
  
  return (
    <Component
      className={cn(
        'px-6 py-4 text-sm',
        isHeader
          ? 'text-left font-medium text-gray-700 uppercase tracking-wider'
          : 'text-gray-900',
        className
      )}
    >
      {children}
    </Component>
  );
}