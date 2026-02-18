/**
 * DataTable Types
 * أنواع جدول البيانات
 */

/**
 * Filter configuration for DataTable
 * إعدادات الفلتر لجدول البيانات
 */
export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multi-select' | 'date-range';
  options?: { label: string; value: string }[];
}

export interface SortConfig {
  id: string;
  desc: boolean;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface DataTableSearchParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | undefined;
}
