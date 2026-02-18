import { Link } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useGetData } from '@/hooks/useGetData';
import { useDeleteData } from '@/hooks/useMutateData';
import { Button } from '@/components/ui/button';
import type { Video } from '@/types/admin';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/admin/DataTable/DataTable';
import { createCustomColumn, createTextColumn, createActionsColumn } from '@/components/admin/DataTable/columns';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

const VideosList = () => {
  const { t } = useTranslation();
  const { data: videos, isLoading, error } = useGetData<Video[]>('videos');
  const deleteMutation = useDeleteData('videos');

  const handleDelete = useCallback(
    async (id: number | string) => {
      if (window.confirm(t('common.confirmDelete', { item: t('admin.dashboard.modules.videos').toLowerCase() }))) {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success(t('common.deleteSuccess', { item: t('admin.dashboard.modules.videos') }));
        } catch {
          toast.error(t('common.deleteError', { item: t('admin.dashboard.modules.videos') }));
        }
      }
    },
    [deleteMutation, t]
  );

  // Map API shape (_id, title, thumbnail, videoUrl) to table; backend may not have duration/views
  const tableData = useMemo<Video[]>(() => {
    const list = videos ?? [];
    return list.map((item: Video) => {
      const raw = item as unknown as Record<string, unknown>;
      return {
        ...item,
        id: (item.id ?? raw._id) as number,
        duration: (item.duration ?? '—') as string,
        views: (item.views ?? '—') as string,
      };
    });
  }, [videos]);

  // Define columns (image + title in one column, like magazines/news)
  const columns = useMemo<ColumnDef<Video>[]>(
    () => [
      createCustomColumn<Video>(
        'title',
        t('admin.lists.tableHeaders.title'),
        ({ row }) => {
          const item = row.original;
          const imageUrl = item.thumbnail || 'https://via.placeholder.com/40';
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
                {item.title ?? '—'}
              </span>
            </div>
          );
        },
        { enableSorting: true, accessorKey: 'title' }
      ),
      createTextColumn<Video>('duration', t('admin.lists.tableHeaders.duration', { defaultValue: 'Duration' })),
      createTextColumn<Video>('views', t('admin.lists.tableHeaders.views', { defaultValue: 'Views' })),
      createActionsColumn<Video>({
        editPath: (id) => `/admin/videos/${id}`,
        onDelete: handleDelete,
      }),
    ],
    [t, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.modules.videos')}
        </h1>
        <Link to="/admin/videos/new">
          <Button>
            <Plus size={20} className="mr-2" />
            {t('common.addNew')}
          </Button>
        </Link>
      </div>

      <DataTable<Video>
        data={tableData}
        columns={columns}
        searchKey="title"
        searchPlaceholder={t('admin.lists.searchPlaceholder', {
          module: t('admin.dashboard.modules.videos').toLowerCase(),
        })}
        isLoading={isLoading}
        error={error}
        emptyMessage={t('admin.lists.noItemsFound', {
          module: t('admin.dashboard.modules.videos').toLowerCase(),
        })}
      />
    </div>
  );
};

export default VideosList;
