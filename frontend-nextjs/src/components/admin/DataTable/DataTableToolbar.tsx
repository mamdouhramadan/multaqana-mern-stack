/**
 * DataTable Toolbar Component
 * مكون شريط أدوات جدول البيانات
 */

import type { ReactNode } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { FilterConfig } from './types';
import { useTranslation } from 'react-i18next';

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Custom filter UI (e.g. Selects, Labels) rendered in one line with search */
  toolbarFilters?: ReactNode;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  toolbarFilters,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
}: DataTableToolbarProps) {
  const { t } = useTranslation();
  const hasActiveFilters = Object.values(filterValues).some((value) => value);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
      {/* Search Input */}
      <div className="relative flex-1 min-w-50 max-w-md">
        <MagnifyingGlass
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          type="text"
          placeholder={searchPlaceholder || t('common.search', { defaultValue: 'Search...' })}
          className="pl-10"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Custom toolbar filters (e.g. role select) - same line as search */}
      {toolbarFilters && (
        <div className="flex flex-wrap items-center gap-4">
          {toolbarFilters}
        </div>
      )}

      {/* Legacy Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {filters.map((filter) => {
            if (filter.type === 'select' && filter.options) {
              return (
                <select
                  key={filter.key}
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              );
            }
            return null;
          })}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-10"
            >
              <X size={16} className="mr-1" />
              {t('common.clearFilters', { defaultValue: 'Clear' })}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
