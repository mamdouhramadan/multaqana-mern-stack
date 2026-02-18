import { Link } from "react-router-dom";
import { Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { DataTable } from "@/components/admin/DataTable/DataTable";
import {
  ForbiddenPage,
  isForbiddenError,
} from "@/components/admin/ForbiddenPage";
import {
  createTextColumn,
  createCustomColumn,
} from "@/components/admin/DataTable/columns";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { getRoles, deleteRole } from "@/api/roleService";
import type { Role } from "@/types/role";

type RoleRow = Role & { id: string };

const RolesList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    data: roles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  const handleDelete = useCallback(
    async (id: string) => {
      if (
        !window.confirm(
          t("common.confirmDelete", {
            item: t("admin.dashboard.modules.roles").toLowerCase(),
          }),
        )
      )
        return;
      try {
        await deleteRole(id);
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        toast.success(
          t("common.deleteSuccess", {
            item: t("admin.dashboard.modules.roles"),
          }),
        );
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : t("common.deleteError", {
                item: t("admin.dashboard.modules.roles"),
              });
        toast.error(String(message));
      }
    },
    [queryClient, t],
  );

  const tableData = useMemo<RoleRow[]>(() => {
    const list = roles ?? [];
    return list.map((r) => ({ ...r, id: r._id }));
  }, [roles]);

  const columns = useMemo<ColumnDef<RoleRow>[]>(
    () => [
      createTextColumn<RoleRow>("name", t("admin.lists.tableHeaders.name")),
      createTextColumn<RoleRow>("slug", "Slug"),
      createCustomColumn<RoleRow>(
        "permissionsCount",
        "Permissions",
        ({ row }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {row.original.permissions?.length ?? 0}
          </span>
        ),
        { enableSorting: true },
      ),
      createCustomColumn<RoleRow>(
        "default",
        "Default",
        ({ row }) =>
          row.original.isDefault ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              Default
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
          ),
        { enableSorting: false },
      ),
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const r = row.original;
          const id = r._id;
          return (
            <div className="flex items-center gap-2">
              <Link
                to={`/admin/roles/${id}`}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                aria-label={t("common.edit")}
              >
                <PencilSimple size={18} />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                aria-label={t("common.delete")}
              >
                <Trash size={18} />
              </button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [t, handleDelete],
  );

  if (error && isForbiddenError(error)) {
    return <ForbiddenPage />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("admin.dashboard.modules.roles")}
        </h1>
        <Link to="/admin/roles/new">
          <Button className="rounded-lg shadow-sm">
            <Plus size={20} className="mr-2" weight="bold" />
            {t("common.addNew")}
          </Button>
        </Link>
      </header>

      <DataTable<RoleRow>
        data={tableData}
        columns={columns}
        searchKey="name"
        searchPlaceholder={t("admin.lists.searchPlaceholder", {
          module: t("admin.dashboard.modules.roles").toLowerCase(),
        })}
        isLoading={isLoading}
        error={error}
        emptyMessage={t("admin.lists.noItemsFound", {
          module: t("admin.dashboard.modules.roles").toLowerCase(),
        })}
      />
    </div>
  );
};

export default RolesList;
