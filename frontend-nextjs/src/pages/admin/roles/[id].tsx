import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import WordPressFormLayout from '@/components/admin/WordPressFormLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { getRoleById, getPermissions, createRole, updateRole } from '@/api/roleService';
import type { RoleFormPayload } from '@/types/role';
import { ForbiddenPage, isForbiddenError } from '@/components/admin/ForbiddenPage';
import { Spinner } from '@/components/ui/Spinner';

const ACTIONS = ['create', 'read', 'update', 'delete'] as const;
const ACTION_LABELS: Record<string, string> = { create: 'Create', read: 'View', update: 'Edit', delete: 'Delete' };

const RoleForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: existing, isLoading: loadingRole, error: roleError } = useQuery({
    queryKey: ['roles', id],
    queryFn: () => getRoleById(id!),
    enabled: !isNew && !!id,
  });

  const { data: permissionsGrouped, error: permissionsError } = useQuery({
    queryKey: ['roles', 'permissions'],
    queryFn: getPermissions,
  });

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setSlug(existing.slug);
      setIsDefault(!!existing.isDefault);
      setPermissions(existing.permissions ?? []);
    } else if (isNew) {
      setName('');
      setSlug('');
      setIsDefault(false);
      setPermissions([]);
    }
  }, [existing, isNew]);

  const toggleResource = (resourcePerms: string[], checked: boolean) => {
    setPermissions((prev) => {
      const without = prev.filter((p) => !resourcePerms.includes(p));
      return checked ? [...without, ...resourcePerms] : without;
    });
  };

  const hasPermission = (perm: string) => permissions.includes(perm);
  const setPermission = (perm: string, checked: boolean) => {
    setPermissions((prev) =>
      checked ? (prev.includes(perm) ? prev : [...prev, perm]) : prev.filter((p) => p !== perm)
    );
  };

  const handleSlugFromName = () => {
    const s = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setSlug(s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const payload: RoleFormPayload = {
        name: name.trim(),
        slug: slug.trim() || '',
        permissions,
        isDefault,
      };
      if (isNew) {
        await createRole(payload);
        toast.success('Role created');
      } else {
        await updateRole(id!, payload);
        toast.success('Role updated');
      }
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      navigate('/admin/roles');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to save role';
      toast.error(String(message));
    } finally {
      setSaving(false);
    }
  };

  if (isForbiddenError(roleError) || isForbiddenError(permissionsError)) {
    return <ForbiddenPage />;
  }

  if (!isNew && loadingRole) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <WordPressFormLayout
        title={isNew ? 'Add New Role' : 'Edit Role'}
        backLink="/admin/roles"
        backLabel="Back to Roles"
        mainContent={
          <div className="space-y-8">
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Details
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900 dark:text-white font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg"
                    placeholder="e.g. Editor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-gray-900 dark:text-white font-medium">
                    Slug (optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg flex-1"
                      placeholder="e.g. editor"
                    />
                    <Button type="button" variant="outline" onClick={handleSlugFromName} className="rounded-lg shrink-0">
                      From name
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 size-4"
                  />
                  <Label htmlFor="isDefault" className="text-gray-900 dark:text-white cursor-pointer">
                    Default role for new registrations
                  </Label>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                Permissions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                      <th className="text-left px-6 py-3 font-medium text-gray-700 dark:text-gray-300 capitalize">
                        Resource
                      </th>
                      <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 text-center w-20">
                        All
                      </th>
                      {ACTIONS.map((action) => (
                        <th
                          key={action}
                          className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 text-center w-24"
                        >
                          {ACTION_LABELS[action]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {permissionsGrouped?.map((group) => {
                      const allChecked = group.permissions.every((p) => permissions.includes(p));
                      const permByAction = Object.fromEntries(
                        group.permissions.map((p) => {
                          const [, action] = p.split(':');
                          return [action, p];
                        })
                      );
                      return (
                        <tr
                          key={group.resource}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                        >
                          <td className="px-6 py-3 font-medium text-gray-900 dark:text-white capitalize">
                            {group.resource}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={allChecked}
                                onCheckedChange={(checked) =>
                                  toggleResource(group.permissions, checked)
                                }
                              />
                            </div>
                          </td>
                          {ACTIONS.map((action) => {
                            const perm = permByAction[action];
                            if (!perm) return <td key={action} className="px-6 py-3" />;
                            return (
                              <td key={action} className="px-6 py-3 text-center">
                                <div className="flex justify-center">
                                  <Switch
                                    checked={hasPermission(perm)}
                                    onCheckedChange={(checked) => setPermission(perm, checked)}
                                  />
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        }
        sidebar={
          <div className="sticky top-6 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <Button type="submit" className="w-full rounded-lg" disabled={saving}>
                {saving ? 'Saving...' : 'Save Role'}
              </Button>
            </div>
          </div>
        }
      />
    </form>
  );
};

export default RoleForm;
