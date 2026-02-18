import { Link } from 'react-router-dom';
import { Plus, File, FilePdf, FileXls, FileDoc, FilePpt } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useGetData } from '@/hooks/useGetData';
import { useDeleteData } from '@/hooks/useMutateData';
import { Button } from '@/components/ui/button';
import type { FileItem } from '@/types/admin';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/admin/DataTable/DataTable';
import { createCustomColumn, createTextColumn, createBadgeColumn, createActionsColumn } from '@/components/admin/DataTable/columns';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf': return FilePdf;
    case 'xls': return FileXls;
    case 'doc': return FileDoc;
    case 'ppt': return FilePpt;
    default: return File;
  }
};

const FilesList = () => {
  const { t } = useTranslation();
  const { data: files, isLoading, error } = useGetData<FileItem[]>('files');
  const deleteMutation = useDeleteData('files');

  const handleDelete = useCallback(
    async (id: string | number) => {
      if (window.confirm(t('common.confirmDelete', { item: t('admin.dashboard.modules.files').toLowerCase() }))) {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success(t('common.deleteSuccess', { item: t('admin.dashboard.modules.files') }));
        } catch {
          toast.error(t('common.deleteError', { item: t('admin.dashboard.modules.files') }));
        }
      }
    },
    [deleteMutation, t]
  );

  // Map API shape (_id, title, path, size, extension, category, createdAt) to table shape
  const tableData = useMemo<FileItem[]>(() => {
    const list = files ?? [];
    return list.map((item: FileItem) => {
      const raw = item as unknown as Record<string, unknown>;
      const cat = raw.category as string | { title?: string } | undefined;
      const categoryLabel = cat && typeof cat === 'object' && cat !== null && 'title' in cat
        ? (cat as { title?: string }).title
        : (typeof cat === 'string' ? cat : '');
      const createdAt = raw.createdAt as Date | string | undefined;
      const dateStr = createdAt instanceof Date
        ? (createdAt as Date).toISOString().slice(0, 10)
        : typeof createdAt === 'string'
          ? createdAt.slice(0, 10)
          : '';
      return {
        ...item,
        id: (item.id ?? raw._id) as string,
        name: (item.name ?? raw.title) as string,
        size: (item.size ?? '') as string,
        date: (item.date ?? dateStr) as string,
        iconType: ((raw.extension as string)?.toLowerCase() ?? 'pdf') as string,
        color: 'text-primary-600',
        category: categoryLabel ?? '',
      };
    });
  }, [files]);

  // Define columns
  const columns = useMemo<ColumnDef<FileItem>[]>(
    () => [
      createCustomColumn<FileItem>(
        'name',
        t('admin.forms.files.name'),
        ({ row }) => {
          const file = row.original;
          const Icon = getFileIcon(file.iconType || 'pdf');
          return (
            <div className="flex items-center gap-3">
              <Icon size={24} className={file.color || 'text-primary-600'} />
              <span className="font-medium text-gray-900 dark:text-white">
                {file.name}
              </span>
            </div>
          );
        },
        { enableSorting: true, accessorKey: 'name' }
      ),
      createBadgeColumn<FileItem>('category', t('admin.lists.tableHeaders.category')),
      createTextColumn<FileItem>('size', t('admin.forms.files.size')),
      createTextColumn<FileItem>('date', t('admin.lists.tableHeaders.date')),
      createActionsColumn<FileItem>({
        editPath: (id) => `/admin/files/${id}`,
        onDelete: handleDelete,
      }),
    ],
    [t, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.modules.files')}
        </h1>
        <Link to="/admin/files/new">
          <Button>
            <Plus size={20} className="mr-2" />
            {t('common.addNew')}
          </Button>
        </Link>
      </div>

      <DataTable<FileItem>
        data={tableData}
        columns={columns}
        searchKey="name"
        searchPlaceholder={t('admin.lists.searchPlaceholder', {
          module: t('admin.dashboard.modules.files').toLowerCase(),
        })}
        isLoading={isLoading}
        error={error}
        emptyMessage={t('admin.lists.noItemsFound', {
          module: t('admin.dashboard.modules.files').toLowerCase(),
        })}
      />
    </div>
  );
};

export default FilesList;
