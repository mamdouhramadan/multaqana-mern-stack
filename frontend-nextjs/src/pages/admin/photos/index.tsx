import { Link } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useGetData } from '@/hooks/useGetData';
import { useDeleteData } from '@/hooks/useMutateData';
import { Button } from '@/components/ui/button';
import type { Photo } from '@/types/admin';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/admin/DataTable/DataTable';
import { createCustomColumn, createActionsColumn } from '@/components/admin/DataTable/columns';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

const PhotosList = () => {
  const { t } = useTranslation();
  const { data: photos, isLoading, error } = useGetData<Photo[]>('photos');
  const deleteMutation = useDeleteData('photos');

  const handleDelete = useCallback(
    async (id: number | string) => {
      if (window.confirm(t('common.confirmDelete', { item: t('admin.dashboard.modules.photos').toLowerCase() }))) {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success(t('common.deleteSuccess', { item: t('admin.dashboard.modules.photos') }));
        } catch {
          toast.error(t('common.deleteError', { item: t('admin.dashboard.modules.photos') }));
        }
      }
    },
    [deleteMutation, t]
  );

  type PhotoRow = Photo & { title?: string; thumbnail?: string };
  // API returns albums: { _id, title, thumbnail }; normalize id for table
  const tableData = useMemo<PhotoRow[]>(() => {
    const list = photos ?? [];
    return list.map((item: Photo) => {
      const raw = item as unknown as Record<string, unknown>;
      return {
        ...item,
        id: (item.id ?? raw._id) as number,
        title: (raw.title as string | undefined),
        thumbnail: (raw.thumbnail as string | undefined) ?? item.src,
      };
    });
  }, [photos]);

  // Define columns (image + title in one column, like magazines/news)
  const columns = useMemo<ColumnDef<PhotoRow>[]>(
    () => [
      createCustomColumn<PhotoRow>(
        'title',
        t('admin.lists.tableHeaders.title'),
        ({ row }) => {
          const item = row.original;
          const imageUrl = item.thumbnail || item.src || 'https://via.placeholder.com/40';
          return (
            <div className="flex items-center gap-3">
              <img
                src={imageUrl}
                alt={item.title || ''}
                className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                }}
              />
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {item.title ?? item.alt ?? '—'}
              </span>
            </div>
          );
        },
        { enableSorting: true, accessorKey: 'title' }
      ),
      createActionsColumn<PhotoRow>({
        editPath: (id) => `/admin/photos/${id}`,
        onDelete: handleDelete,
      }),
    ],
    [t, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.modules.photos')}
        </h1>
        <Link to="/admin/photos/new">
          <Button>
            <Plus size={20} className="mr-2" />
            {t('common.addNew')}
          </Button>
        </Link>
      </div>

      <DataTable<PhotoRow>
        data={tableData}
        columns={columns}
        searchKey="title"
        searchPlaceholder={t('admin.lists.searchPlaceholder', {
          module: t('admin.dashboard.modules.photos').toLowerCase(),
        })}
        isLoading={isLoading}
        error={error}
        emptyMessage={t('admin.lists.noItemsFound', {
          module: t('admin.dashboard.modules.photos').toLowerCase(),
        })}
      />
    </div>
  );
};

export default PhotosList;
