import { Link } from "react-router-dom";
import { PencilSimple } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useGetData } from "@/hooks/useGetData";
import { getRoles } from "@/api/roleService";
import { DataTable } from "@/components/admin/DataTable/DataTable";
import {
  createTextColumn,
  createCustomColumn,
} from "@/components/admin/DataTable/columns";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { AdminUser } from "@/types/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Role } from "@/types/role";

type UserRow = AdminUser & { id: string };

const UsersList = () => {
  const { t } = useTranslation();
  const [roleFilter, setRoleFilter] = useState<string>("");
  const { data: roles } = useQuery({ queryKey: ["roles"], queryFn: getRoles });
  const {
    data: users,
    isLoading,
    error,
  } = useGetData<AdminUser[]>(
    "users",
    roleFilter ? { role: roleFilter } : undefined,
  );

  const tableData = useMemo<UserRow[]>(() => {
    const list = users ?? [];
    return list.map((u) => ({ ...u, id: u._id }));
  }, [users]);

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      createTextColumn<UserRow>("username", t("admin.lists.tableHeaders.name")),
      createTextColumn<UserRow>("email", "Email"),
      createCustomColumn<UserRow>(
        "role",
        "Role",
        ({ row }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {row.original.role?.name ?? row.original.role?.slug ?? "—"}
          </span>
        ),
        { enableSorting: true },
      ),
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Link
            to={`/admin/users/${row.original._id}`}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors inline-flex"
            aria-label={t("common.edit")}
          >
            <PencilSimple size={18} />
          </Link>
        ),
        enableSorting: false,
      },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("admin.dashboard.modules.users")}
        </h1>
      </div>

      <DataTable<UserRow>
        data={tableData}
        columns={columns}
        searchKey="username"
        searchPlaceholder={t("admin.lists.searchPlaceholder", {
          module: t("admin.dashboard.modules.users").toLowerCase(),
        })}
        toolbarFilters={
          <div className="flex items-center gap-2">
            <Label
              htmlFor="role-filter"
              className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
            >
              {t("admin.users.filterByRole", { defaultValue: "Filter by role" })}
            </Label>
            <Select
              value={roleFilter || "all"}
              onValueChange={(v) => setRoleFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger
                id="role-filter"
                className="w-50 bg-white dark:bg-gray-800"
              >
                <SelectValue
                  placeholder={t("admin.users.allRoles", {
                    defaultValue: "All roles",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.users.allRoles", { defaultValue: "All roles" })}
                </SelectItem>
                {(roles ?? []).map((r: Role) => (
                  <SelectItem key={r._id} value={r._id}>
                    {r.name} ({r.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        isLoading={isLoading}
        error={error}
        emptyMessage={t("admin.lists.noItemsFound", {
          module: t("admin.dashboard.modules.users").toLowerCase(),
        })}
      />
    </div>
  );
};

export default UsersList;
