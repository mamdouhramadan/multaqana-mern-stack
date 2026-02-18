import { Link } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useGetData } from '@/hooks/useGetData';
import { useDeleteData } from '@/hooks/useMutateData';
import { Button } from '@/components/ui/button';
import type { FAQ } from '@/types/admin';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/admin/DataTable/DataTable';
import { createTextColumn, createBadgeColumn, createActionsColumn } from '@/components/admin/DataTable/columns';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

const FAQsList = () => {
  const { t } = useTranslation();
  const { data: faqs, isLoading, error } = useGetData<FAQ[]>('faqs');
  const deleteMutation = useDeleteData('faqs');

  const handleDelete = useCallback(
    async (id: string | number) => {
      if (window.confirm(t('common.confirmDelete', { item: t('admin.dashboard.modules.faqs').toLowerCase() }))) {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success(t('common.deleteSuccess', { item: t('admin.dashboard.modules.faqs') }));
        } catch {
          toast.error(t('common.deleteError', { item: t('admin.dashboard.modules.faqs') }));
        }
      }
    },
    [deleteMutation, t]
  );

  type FAQRow = FAQ & { title?: string; description?: string };
  // API returns { _id, title, description, category }; category may be object { _id, title, slug }
  const tableData = useMemo<FAQRow[]>(() => {
    const list = faqs ?? [];
    return list.map((item: FAQ) => {
      const raw = item as unknown as Record<string, unknown>;
      const cat = (raw.category ?? item.category) as string | { title?: string } | undefined;
      const categoryLabel =
        cat && typeof cat === 'object' && cat !== null && 'title' in cat
          ? (cat as { title?: string }).title
          : typeof cat === 'string'
            ? cat
            : '';
      return {
        ...item,
        id: (item.id ?? raw._id) ?? '',
        category: categoryLabel ?? '',
        title: (raw.title as string | undefined) ?? item.question,
        description: (raw.description as string | undefined) ?? item.answer,
      };
    });
  }, [faqs]);

  // Define columns (backend uses title = question, description = answer)
  const columns = useMemo<ColumnDef<FAQRow>[]>(
    () => [
      createTextColumn<FAQRow>('title', t('admin.forms.faqs.question'), {
        subtitle: 'description',
      }),
      createBadgeColumn<FAQRow>('category', t('admin.lists.tableHeaders.category')),
      createActionsColumn<FAQRow>({
        editPath: (id) => `/admin/faqs/${id}`,
        onDelete: handleDelete,
      }),
    ],
    [t, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.modules.faqs')}
        </h1>
        <Link to="/admin/faqs/new">
          <Button>
            <Plus size={20} className="mr-2" />
            {t('common.addNew')}
          </Button>
        </Link>
      </div>

      <DataTable<FAQRow>
        data={tableData}
        columns={columns}
        searchKey="title"
        searchPlaceholder={t('admin.lists.searchPlaceholder', {
          module: t('admin.dashboard.modules.faqs').toLowerCase(),
        })}
        isLoading={isLoading}
        error={error}
        emptyMessage={t('admin.lists.noItemsFound', {
          module: t('admin.dashboard.modules.faqs').toLowerCase(),
        })}
      />
    </div>
  );
};

export default FAQsList;
