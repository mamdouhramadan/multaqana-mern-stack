/**
 * Advanced DataTable Component
 * مكون جدول البيانات المتقدم
 * 
 * A reusable table component with:
 * - TanStack Table for table logic
 * - nuqs for URL state management
 * - Sorting, pagination, search, and filtering
 * - Responsive design with Tailwind CSS
 */

import { useMemo, type ReactNode } from 'react';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';
import { DataTableToolbar } from './DataTableToolbar';
import { DataTablePagination } from './DataTablePagination';
import { DataTableColumnHeader } from './DataTableColumnHeader';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/Spinner';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchKey?: string;
  searchPlaceholder?: string;
  /** Custom filter UI rendered in one line with search (e.g. role select, status select) */
  toolbarFilters?: ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  defaultPageSize?: number;
}

export function DataTable<TData>({
  data,
  columns,
  searchKey,
  searchPlaceholder,
  toolbarFilters,
  isLoading = false,
  error = null,
  emptyMessage,
  defaultPageSize = 10,
}: DataTableProps<TData>) {
  const { t } = useTranslation();

  // URL state management with nuqs
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(defaultPageSize));
  const [sortBy, setSortBy] = useQueryState('sortBy', parseAsString.withDefault(''));
  const [sortOrder, setSortOrder] = useQueryState('sortOrder', parseAsString.withDefault(''));

  // Build sorting state
  const sorting: SortingState = useMemo(() => {
    if (!sortBy) return [];
    return [{ id: sortBy, desc: sortOrder === 'desc' }];
  }, [sortBy, sortOrder]);

  // Build column filters state
  const columnFilters: ColumnFiltersState = useMemo(() => {
    const filtersArray: ColumnFiltersState = [];

    // Add search filter
    if (search && searchKey) {
      filtersArray.push({ id: searchKey, value: search });
    }

    return filtersArray;
  }, [search, searchKey]);

  // Enhanced columns with sortable headers
  const enhancedColumns = useMemo(() => {
    return columns.map((column) => {
      if (column.header && typeof column.header === 'string') {
        const headerText = column.header;
        return {
          ...column,
          header: ({ column: col }: any) => (
            <DataTableColumnHeader column={col} title={headerText} />
          ),
        } as ColumnDef<TData>;
      }
      return column;
    });
  }, [columns]);

  // Initialize table
  const table = useReactTable({
    data,
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      if (newSorting.length > 0) {
        setSortBy(newSorting[0].id);
        setSortOrder(newSorting[0].desc ? 'desc' : 'asc');
      } else {
        setSortBy('');
        setSortOrder('');
      }
    },
    manualPagination: false,
    pageCount: Math.ceil(data.length / pageSize),
  });



  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        {t('common.loadingError', { item: 'data', defaultValue: 'Error loading data' })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1); // Reset to first page when searching
        }}
        searchPlaceholder={searchPlaceholder}
        toolbarFilters={toolbarFilters}
      />

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage || t('common.noData', { defaultValue: 'No data available' })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getRowModel().rows.length > 0 ? (
          <DataTablePagination
            table={table}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1); // Reset to first page when changing page size
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
