/**
 * DataTable Column Header Component
 * مكون رأس عمود جدول البيانات
 */

import type { Column as ColumnType } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, CaretUpDown } from '@phosphor-icons/react';
import { cn } from '@/utils/utils';

interface DataTableColumnHeaderProps<TData, TValue> {
  column: ColumnType<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <button
      className={cn(
        'flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition-colors',
        className
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      <span>{title}</span>
      {sorted === 'desc' ? (
        <ArrowDown className="h-4 w-4" />
      ) : sorted === 'asc' ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <CaretUpDown className="h-4 w-4 opacity-50" />
      )}
    </button>
  );
}
