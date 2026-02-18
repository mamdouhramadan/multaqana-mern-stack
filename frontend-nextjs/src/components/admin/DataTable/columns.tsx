/**
 * Reusable Column Definition Helpers
 * مساعدات تعريف الأعمدة القابلة لإعادة الاستخدام
 */

import type { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { format } from 'date-fns';

/**
 * Create an image column
 */
export function createImageColumn<TData>(
  accessorKey: string,
  header: string,
  altAccessorKey?: string
): ColumnDef<TData> {
  return {
    accessorKey,
    header,
    cell: ({ row, getValue }) => {
      const imageUrl = getValue() as string;
      const alt = altAccessorKey ? (row.original as any)[altAccessorKey] : header;
      return (
        <img
          src={imageUrl || 'https://via.placeholder.com/40'}
          alt={alt}
          className="h-10 w-10 rounded-lg object-cover bg-gray-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
          }}
        />
      );
    },
    enableSorting: false,
  };
}

/**
 * Create a text column with optional subtitle
 */
export function createTextColumn<TData>(
  accessorKey: string,
  header: string,
  options?: {
    subtitle?: string;
    className?: string;
    enableSorting?: boolean;
  }
): ColumnDef<TData> {
  return {
    accessorKey,
    header,
    cell: ({ row, getValue }) => {
      const value = getValue() as string;
      const subtitle = options?.subtitle ? (row.original as any)[options.subtitle] : null;

      return (
        <div>
          <div className={`text-sm font-medium text-gray-900 dark:text-white ${options?.className || ''}`}>
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 truncate max-w-xs">{subtitle}</div>
          )}
        </div>
      );
    },
    enableSorting: options?.enableSorting ?? true,
  };
}

/**
 * Create a badge column for status/category
 */
export function createBadgeColumn<TData>(
  accessorKey: string,
  header: string,
  options?: {
    colorMap?: Record<string, string>;
    defaultColor?: string;
  }
): ColumnDef<TData> {
  return {
    accessorKey,
    header,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const colorMap = options?.colorMap || {};
      const colorClass = colorMap[value] || options?.defaultColor || 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300';

      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
          {value}
        </span>
      );
    },
    enableSorting: true,
  };
}

/**
 * Create a date column with formatting
 */
export function createDateColumn<TData>(
  accessorKey: string,
  header: string,
  dateFormat: string = 'MMM d, yyyy'
): ColumnDef<TData> {
  return {
    accessorKey,
    header,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      try {
        return (
          <span className="text-sm text-gray-500">
            {format(new Date(value), dateFormat)}
          </span>
        );
      } catch {
        return <span className="text-sm text-gray-500">{value}</span>;
      }
    },
    enableSorting: true,
  };
}

/**
 * Create an actions column with edit and delete buttons
 */
export function createActionsColumn<TData>(
  options: {
    editPath: (id: string | number) => string;
    onDelete: (id: string | number) => void;
    idAccessor?: string;
  }
): ColumnDef<TData> {
  return {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const id = options.idAccessor
        ? (row.original as any)[options.idAccessor]
        : (row.original as any).id;

      return (
        <div className="flex items-center gap-2">
          <Link
            to={options.editPath(id)}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          >
            <PencilSimple size={18} />
          </Link>
          <button
            onClick={() => options.onDelete(id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash size={18} />
          </button>
        </div>
      );
    },
    enableSorting: false,
  };
}

/**
 * Create a custom column with full control
 */
export function createCustomColumn<TData>(
  id: string,
  header: string,
  cell: (props: { row: any; getValue: () => any }) => React.ReactNode,
  options?: {
    enableSorting?: boolean;
    accessorKey?: string;
  }
): ColumnDef<TData> {
  return {
    id,
    accessorKey: options?.accessorKey,
    header,
    cell,
    enableSorting: options?.enableSorting ?? false,
  };
}
