import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '@/api/client';
import { getRoles } from '@/api/roleService';
import { getDepartments } from '@/api/departmentService';
import { getPositions } from '@/api/positionService';
import WordPressFormLayout from '@/components/admin/WordPressFormLayout';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/Spinner';
import type { AdminUser } from '@/types/user';
import type { Role } from '@/types/role';

interface UserApiResponse {
  success?: boolean;
  data?: AdminUser;
}

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [roleId, setRoleId] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [positionId, setPositionId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const res = await apiClient.get<UserApiResponse>(`/users/${id}`);
      const data = res.data?.data ?? res.data;
      if (!data || typeof data !== 'object') throw new Error('User not found');
      return data as AdminUser;
    },
    enabled: !!id,
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });
  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: getPositions,
  });

  useEffect(() => {
    if (!user) return;
    const r = user.role as { _id?: string } | undefined;
    setRoleId(r?._id ?? '');
    const dept = user.department;
    setDepartmentId(typeof dept === 'object' && dept?._id ? dept._id : typeof dept === 'string' ? dept : 'none');
    const pos = user.position;
    setPositionId(typeof pos === 'object' && pos?._id ? pos._id : typeof pos === 'string' ? pos : 'none');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      const payload: { role?: string; department?: string; position?: string } = {};
      if (roleId) payload.role = roleId;
      payload.department = departmentId && departmentId !== 'none' ? departmentId : '';
      payload.position = positionId && positionId !== 'none' ? positionId : '';
      await apiClient.patch(`/users/${id}`, payload);
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      navigate('/admin/users');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to update user';
      toast.error(String(message));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <WordPressFormLayout
        title="Edit User"
        backLink="/admin/users"
        backLabel="Back to Users"
        mainContent={
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-gray-500 dark:text-gray-400">Username</Label>
                <p className="text-gray-900 dark:text-white font-medium">{user.username}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-gray-500 dark:text-gray-400">Email</Label>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-900 dark:text-white">
                  Role
                </Label>
                <Select value={roleId || undefined} onValueChange={setRoleId}>
                  <SelectTrigger
                    id="role"
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                    {(roles ?? []).map((r: Role) => (
                      <SelectItem
                        key={r._id}
                        value={r._id}
                        className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700"
                      >
                        {r.name} ({r.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-gray-900 dark:text-white">
                  Department
                </Label>
                <Select value={departmentId || 'none'} onValueChange={setDepartmentId}>
                  <SelectTrigger
                    id="department"
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                    <SelectItem value="none" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                      None
                    </SelectItem>
                    {(departments ?? []).map((d) => (
                      <SelectItem
                        key={d._id}
                        value={d._id}
                        className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700"
                      >
                        {d.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-gray-900 dark:text-white">
                  Position
                </Label>
                <Select value={positionId || 'none'} onValueChange={setPositionId}>
                  <SelectTrigger
                    id="position"
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                    <SelectItem value="none" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                      None
                    </SelectItem>
                    {(positions ?? []).map((p) => (
                      <SelectItem
                        key={p._id}
                        value={p._id}
                        className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700"
                      >
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        }
        sidebar={
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        }
      />
    </form>
  );
};

export default UserForm;
