import { Link } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useGetData } from '@/hooks/useGetData';
import { useDeleteData } from '@/hooks/useMutateData';
import { Button } from '@/components/ui/button';
import type { News } from '@/types/admin';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/admin/DataTable/DataTable';
import { createCustomColumn, createTextColumn, createActionsColumn } from '@/components/admin/DataTable/columns';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

/**
 * News List Page
 * صفحة قائمة الأخبار
 */
const NewsList = () => {
  const { t } = useTranslation();
  const { data: news, isLoading, error } = useGetData<News[]>('news');
  const deleteMutation = useDeleteData('news');

  const handleDelete = useCallback(
    async (id: number | string) => {
      if (window.confirm(t('common.confirmDelete', { item: t('admin.dashboard.modules.news').toLowerCase() }))) {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success(t('common.deleteSuccess', { item: t('admin.dashboard.modules.news') }));
        } catch (err) {
          toast.error(t('common.deleteError', { item: t('admin.dashboard.modules.news') }));
        }
      }
    },
    [deleteMutation, t]
  );

  // Map API shape (_id, thumbnail, content, publishedAt) to table shape (id, image, description, date)
  const tableData = useMemo<News[]>(() => {
    const list = news ?? [];
    return list.map((item: News) => {
      const raw = item as unknown as Record<string, unknown>;
      const publishedAt = raw.publishedAt as Date | string | undefined;
      const dateStr = publishedAt instanceof Date
        ? publishedAt.toISOString().slice(0, 10)
        : typeof publishedAt === 'string'
          ? publishedAt.slice(0, 10)
          : '';
      return {
        ...item,
        id: (item.id ?? raw._id) as number,
        image: (item.image ?? raw.thumbnail) as string,
        description: (item.description ?? raw.content) as string,
        date: (item.date ?? dateStr) as string,
      };
    });
  }, [news]);

  // Define columns (image + title + description in one column)
  const columns = useMemo<ColumnDef<News>[]>(
    () => [
      createCustomColumn<News>(
        'title',
        t('admin.lists.tableHeaders.title'),
        ({ row }) => {
          const item = row.original;
          const imageUrl = item.image || 'https://via.placeholder.com/40';
          const description = (item as News & { description?: string }).description;
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
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.title}
                </div>
                {description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    {description}
                  </div>
                )}
              </div>
            </div>
          );
        },
        { enableSorting: true, accessorKey: 'title' }
      ),
      createTextColumn<News>('date', t('admin.lists.tableHeaders.date')),
      createActionsColumn<News>({
        editPath: (id) => `/admin/news/${id}`,
        onDelete: handleDelete,
      }),
    ],
    [t, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.modules.news')}
        </h1>
        <Link to="/admin/news/new">
          <Button>
            <Plus size={20} className="mr-2" />
            {t('common.addNew')}
          </Button>
        </Link>
      </div>

      <DataTable<News>
        data={tableData}
        columns={columns}
        searchKey="title"
        searchPlaceholder={t('admin.lists.searchPlaceholder', {
          module: t('admin.dashboard.modules.news').toLowerCase(),
        })}
        isLoading={isLoading}
        error={error}
        emptyMessage={t('admin.lists.noItemsFound', {
          module: t('admin.dashboard.modules.news').toLowerCase(),
        })}
      />
    </div>
  );
};

export default NewsList;
