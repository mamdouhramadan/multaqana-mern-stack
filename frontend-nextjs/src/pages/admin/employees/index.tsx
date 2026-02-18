import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useGetData } from '@/hooks/useGetData';
import { useDeleteData } from '@/hooks/useMutateData';
import { getRoles } from '@/api/roleService';
import { Button } from '@/components/ui/button';
import type { Employee } from '@/types/admin';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/admin/DataTable/DataTable';
import { createImageColumn, createTextColumn, createBadgeColumn, createActionsColumn } from '@/components/admin/DataTable/columns';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

/** Table row: Employee with string id (from API _id) and optional email */
type EmployeeRow = Omit<Employee, 'id'> & { id: string; email?: string };

/** User from GET /users with role, department, position populated */
interface UserWithRefs {
  _id: string;
  username: string;
  email?: string;
  image?: string;
  department?: { _id: string; title?: string } | null;
  position?: { _id: string; title?: string } | null;
}

/** Map API user to table row shape expected by Employee columns */
function userToEmployeeRow(u: UserWithRefs): EmployeeRow {
  return {
    id: u._id,
    image: u.image ?? '',
    name: u.username,
    email: u.email ?? '',
    jobTitle: (u.position && typeof u.position === 'object' ? u.position.title : '') ?? '',
    alt: u.username,
    department: (u.department && typeof u.department === 'object' ? u.department.title : '') ?? '',
    status: 'Offline',
  };
}

const EmployeesList = () => {
  const { t } = useTranslation();
  const { data: roles, isLoading: rolesLoading } = useQuery({ queryKey: ['roles'], queryFn: getRoles });
  const employeeRoleId = useMemo(
    () => roles?.find((r) => r.slug === 'employee')?._id,
    [roles]
  );
  const { data: users, isLoading: usersLoading, error } = useGetData<UserWithRefs[]>(
    'users',
    employeeRoleId ? { role: employeeRoleId } : undefined,
    { enabled: !!employeeRoleId }
  );
  const isLoading = rolesLoading || usersLoading;
  const employees = useMemo(
    () => (Array.isArray(users) ? users.map(userToEmployeeRow) : []),
    [users]
  );
  const deleteMutation = useDeleteData('users');

  const handleDelete = useCallback(
    async (id: number | string) => {
      if (window.confirm(t('common.confirmDelete', { item: t('admin.dashboard.modules.employees').toLowerCase() }))) {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success(t('common.deleteSuccess', { item: t('admin.dashboard.modules.employees') }));
        } catch (err) {
          toast.error(t('common.deleteError', { item: t('admin.dashboard.modules.employees') }));
        }
      }
    },
    [deleteMutation, t]
  );

  // Define columns (employee users: name, email, job title, department, status)
  const columns = useMemo<ColumnDef<EmployeeRow>[]>(
    () => [
      createImageColumn<EmployeeRow>('image', t('admin.lists.tableHeaders.image'), 'name'),
      createTextColumn<EmployeeRow>('name', t('admin.lists.tableHeaders.name'), {
        subtitle: 'jobTitle',
      }),
      createTextColumn<EmployeeRow>('email', t('admin.users.email', { defaultValue: 'Email' })),
      createTextColumn<EmployeeRow>('department', t('admin.forms.employees.department')),
      createBadgeColumn<EmployeeRow>('status', t('admin.lists.tableHeaders.status'), {
        colorMap: {
          'Online': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          'Busy': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          'Offline': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
          'In Meeting': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        },
      }),
      createActionsColumn<EmployeeRow>({
        editPath: (id) => `/admin/users/${id}`,
        onDelete: handleDelete,
      }),
    ],
    [t, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.modules.employees')}
        </h1>
        <Link to="/admin/users">
          <Button variant="outline">
            {t('admin.employees.manageInUsers', { defaultValue: 'Add / manage in Users' })}
          </Button>
        </Link>
      </div>

      {!rolesLoading && !employeeRoleId && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 text-amber-800 dark:text-amber-200 text-sm">
          {t('admin.employees.noEmployeeRole', {
            defaultValue: 'No "Employee" role found. Create it in Admin → Roles, or assign it to users in Admin → Users to see them here.',
          })}
        </div>
      )}

      <DataTable<EmployeeRow>
        data={employees || []}
        columns={columns}
        searchKey="name"
        searchPlaceholder={t('admin.lists.searchPlaceholder', {
          module: t('admin.dashboard.modules.employees').toLowerCase(),
        })}
        isLoading={isLoading}
        error={error}
        emptyMessage={
          !employeeRoleId
            ? ''
            : t('admin.lists.noItemsFound', {
                module: t('admin.dashboard.modules.employees').toLowerCase(),
              })
        }
      />
    </div>
  );
};

export default EmployeesList;
