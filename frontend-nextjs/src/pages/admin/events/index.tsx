import { Link } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useGetData } from '@/hooks/useGetData';
import { useDeleteData } from '@/hooks/useMutateData';
import { Button } from '@/components/ui/button';
import type { CalendarEvent } from '@/types/admin';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/admin/DataTable/DataTable';
import { createCustomColumn, createDateColumn, createTextColumn, createActionsColumn } from '@/components/admin/DataTable/columns';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

const EventsList = () => {
  const { t } = useTranslation();
  const { data: events, isLoading, error } = useGetData<CalendarEvent[]>('events');
  const deleteMutation = useDeleteData('events');

  const handleDelete = useCallback(
    async (id: number | string) => {
      if (window.confirm(t('common.confirmDelete', { item: t('admin.dashboard.modules.events').toLowerCase() }))) {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success(t('common.deleteSuccess', { item: t('admin.dashboard.modules.events') }));
        } catch {
          toast.error(t('common.deleteError', { item: t('admin.dashboard.modules.events') }));
        }
      }
    },
    [deleteMutation, t]
  );

  // Define columns
  const columns = useMemo<ColumnDef<CalendarEvent>[]>(
    () => [
      createCustomColumn<CalendarEvent>(
        'title',
        t('admin.lists.tableHeaders.title'),
        ({ row }) => {
          const event = row.original;
          const imageUrl = event.cover_image || 'https://via.placeholder.com/40';
          return (
            <div className="flex items-center gap-3">
              <img
                src={imageUrl}
                alt={event.title}
                className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                }}
              />
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {event.title}
              </span>
            </div>
          );
        },
        { enableSorting: true, accessorKey: 'title' }
      ),
      createDateColumn<CalendarEvent>('start', t('admin.lists.tableHeaders.date')),
      createTextColumn<CalendarEvent>('resource', t('admin.forms.events.location')),
      createActionsColumn<CalendarEvent>({
        editPath: (id) => `/admin/events/${id}`,
        onDelete: handleDelete,
      }),
    ],
    [t, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.modules.events')}
        </h1>
        <Link to="/admin/events/new">
          <Button>
            <Plus size={20} className="mr-2" />
            {t('common.addNew')}
          </Button>
        </Link>
      </div>

      <DataTable<CalendarEvent>
        data={events || []}
        columns={columns}
        searchKey="title"
        searchPlaceholder={t('admin.lists.searchPlaceholder', {
          module: t('admin.dashboard.modules.events').toLowerCase(),
        })}
        isLoading={isLoading}
        error={error}
        emptyMessage={t('admin.lists.noItemsFound', {
          module: t('admin.dashboard.modules.events').toLowerCase(),
        })}
      />
    </div>
  );
};

export default EventsList;
