import { Link } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useGetData } from '@/hooks/useGetData';
import { useDeleteData } from '@/hooks/useMutateData';
import { Button } from '@/components/ui/button';
import type { Application } from '@/types/admin';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/admin/DataTable/DataTable';
import { createBadgeColumn, createActionsColumn, createCustomColumn } from '@/components/admin/DataTable/columns';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

/**
 * Applications List Page
 * صفحة قائمة التطبيقات
 */
const ApplicationsList = () => {
  const { t } = useTranslation();
  const { data: applications, isLoading, error } = useGetData<Application[]>('applications');
  const deleteMutation = useDeleteData('applications');

  const handleDelete = useCallback(
    async (id: number | string) => {
      if (window.confirm(t('common.confirmDelete', { item: t('admin.dashboard.modules.applications').toLowerCase() }))) {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success(t('common.deleteSuccess', { item: t('admin.dashboard.modules.applications') }));
        } catch (err) {
          toast.error(t('common.deleteError', { item: t('admin.dashboard.modules.applications') }));
        }
      }
    },
    [deleteMutation, t]
  );

  // API returns title, url, logo, category (object); map to frontend name, href, image
  const tableData = useMemo<Application[]>(() => {
    const list = applications ?? [];
    return list.map((item: Application) => {
      const raw = item as unknown as Record<string, unknown>;
      const cat = raw.category as string | { title?: string } | undefined;
      const categoryLabel =
        cat && typeof cat === 'object' && cat !== null && 'title' in cat
          ? (cat as { title?: string }).title
          : typeof cat === 'string'
            ? cat
            : '';
      return {
        ...item,
        id: (item.id ?? raw._id) as number,
        name: (item.name ?? raw.title) as string,
        href: (item.href ?? raw.url) as string,
        image: (item.image ?? raw.logo) as string,
        category: categoryLabel ?? '',
      };
    });
  }, [applications]);

  // Define columns (image + name + link in one column)
  const columns = useMemo<ColumnDef<Application>[]>(
    () => [
      createCustomColumn<Application>(
        'name',
        t('admin.lists.tableHeaders.name'),
        ({ row }) => {
          const app = row.original;
          const imageUrl = app.image || 'https://via.placeholder.com/40';
          return (
            <div className="flex items-center gap-3">
              <img
                src={imageUrl}
                alt={app.name || ''}
                className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                }}
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {app.name}
                </div>
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:underline truncate block max-w-xs"
                >
                  {app.href}
                </a>
              </div>
            </div>
          );
        },
        { enableSorting: true, accessorKey: 'name' }
      ),
      createBadgeColumn<Application>('category', t('admin.lists.tableHeaders.category')),
      createActionsColumn<Application>({
        editPath: (id) => `/admin/applications/${id}`,
        onDelete: handleDelete,
      }),
    ],
    [t, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.modules.applications')}
        </h1>
        <Link to="/admin/applications/new">
          <Button>
            <Plus size={20} className="mr-2" />
            {t('common.addNew')}
          </Button>
        </Link>
      </div>

      <DataTable<Application>
        data={tableData}
        columns={columns}
        searchKey="name"
        searchPlaceholder={t('admin.lists.searchPlaceholder', {
          module: t('admin.dashboard.modules.applications').toLowerCase(),
        })}
        isLoading={isLoading}
        error={error}
        emptyMessage={t('admin.lists.noItemsFound', {
          module: t('admin.dashboard.modules.applications').toLowerCase(),
        })}
      />
    </div>
  );
};

export default ApplicationsList;
