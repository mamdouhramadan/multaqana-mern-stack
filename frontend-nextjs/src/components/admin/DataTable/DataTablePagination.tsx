/**
 * DataTable Pagination Component
 * مكون ترقيم صفحات جدول البيانات
 * Uses DdaPagination (Dubai Design Authority) for page controls.
 */

import type { Table as TableType } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - DDA design system types may not be fully available
import { DdaPagination } from '@dubai-design-system/components-react';

interface DataTablePaginationProps<TData> {
  table: TableType<TData>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function DataTablePagination<TData>({
  table,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = Math.max(1, table.getPageCount());
  const pageSize = table.getState().pagination.pageSize;

  const handlePaginateClick = (e: CustomEvent<number>) => {
    const newPage = e.detail;
    table.setPageIndex(newPage - 1);
    onPageChange(newPage);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {t('common.rowsPerPage', { defaultValue: 'Rows per page' })}:
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            table.setPageSize(newSize);
            onPageSizeChange(newSize);
          }}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {[10, 20, 30, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* DDA Pagination (simple-slider: prev/next) */}
      <DdaPagination
        total_pages={String(totalPages)}
        current_page={String(currentPage)}
        type="simple-slider"
        custom_class=""
        component_mode=""
        simple_slider_prev_button=""
        simple_slider_next_button=""
        buttons_prev_button=""
        buttons_next_button=""
        text_prev_button=""
        text_next_button=""
        text_pages_prev_button=""
        text_pages_next_button=""
        button_text_prev_button=""
        button_text_next_button=""
        buttons_pages_prev_button=""
        buttons_pages_next_button=""
        onPaginateClick={handlePaginateClick}
      />
    </div>
  );
}
