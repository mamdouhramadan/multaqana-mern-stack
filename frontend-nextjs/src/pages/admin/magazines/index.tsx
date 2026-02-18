import { Link } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useGetData } from '@/hooks/useGetData';
import { useDeleteData } from '@/hooks/useMutateData';
import { Button } from '@/components/ui/button';
import type { Magazine } from '@/types/admin';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/admin/DataTable/DataTable';
import { createCustomColumn, createTextColumn, createBadgeColumn, createActionsColumn } from '@/components/admin/DataTable/columns';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

const MagazinesList = () => {
  const { t } = useTranslation();
  const { data: magazines, isLoading, error } = useGetData<Magazine[]>('magazines');
  const deleteMutation = useDeleteData('magazines');

  const handleDelete = useCallback(
    async (id: number | string) => {
      if (window.confirm(t('common.confirmDelete', { item: t('admin.dashboard.modules.magazines').toLowerCase() }))) {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success(t('common.deleteSuccess', { item: t('admin.dashboard.modules.magazines') }));
        } catch {
          toast.error(t('common.deleteError', { item: t('admin.dashboard.modules.magazines') }));
        }
      }
    },
    [deleteMutation, t]
  );

  // Map API shape (_id, thumbnail, publishedAt) to table shape (id, cover, date)
  const tableData = useMemo<Magazine[]>(() => {
    const list = magazines ?? [];
    return list.map((item: Magazine) => {
      const raw = item as unknown as Record<string, unknown>;
      const publishedAt = raw.publishedAt;
      const dateStr = publishedAt instanceof Date
        ? (publishedAt as Date).toISOString().slice(0, 10)
        : typeof publishedAt === 'string'
          ? (publishedAt as string).slice(0, 10)
          : '';
      return {
        ...item,
        id: (item.id ?? raw._id) as number,
        cover: (item.cover ?? raw.thumbnail) as string,
        date: (item.date ?? dateStr) as string,
      };
    });
  }, [magazines]);

  // Define columns (image + title in one column)
  const columns = useMemo<ColumnDef<Magazine>[]>(
    () => [
      createCustomColumn<Magazine>(
        'title',
        t('admin.lists.tableHeaders.title'),
        ({ row }) => {
          const mag = row.original;
          const imageUrl = mag.cover || 'https://via.placeholder.com/40';
          return (
            <div className="flex items-center gap-3">
              <img
                src={imageUrl}
                alt={mag.title || ''}
                className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                }}
              />
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {mag.title}
              </span>
            </div>
          );
        },
        { enableSorting: true, accessorKey: 'title' }
      ),
      createTextColumn<Magazine>('date', t('admin.lists.tableHeaders.date')),
      createBadgeColumn<Magazine>('category', t('admin.lists.tableHeaders.category')),
      createActionsColumn<Magazine>({
        editPath: (id) => `/admin/magazines/${id}`,
        onDelete: handleDelete,
      }),
    ],
    [t, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.modules.magazines')}
        </h1>
        <Link to="/admin/magazines/new">
          <Button>
            <Plus size={20} className="mr-2" />
            {t('common.addNew')}
          </Button>
        </Link>
      </div>

      <DataTable<Magazine>
        data={tableData}
        columns={columns}
        searchKey="title"
        searchPlaceholder={t('admin.lists.searchPlaceholder', {
          module: t('admin.dashboard.modules.magazines').toLowerCase(),
        })}
        isLoading={isLoading}
        error={error}
        emptyMessage={t('admin.lists.noItemsFound', {
          module: t('admin.dashboard.modules.magazines').toLowerCase(),
        })}
      />
    </div>
  );
};

export default MagazinesList;
