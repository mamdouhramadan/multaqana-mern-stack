import apiClient from './client';
import type { Role, RoleFormPayload, PermissionsGrouped } from '@/types/role';

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export async function getRoles(): Promise<Role[]> {
  const res = await apiClient.get<ApiResponse<Role[]>>('/roles');
  const data = res.data?.data;
  return Array.isArray(data) ? data : [];
}

export async function getPermissions(): Promise<PermissionsGrouped[]> {
  const res = await apiClient.get<ApiResponse<PermissionsGrouped[]>>('/roles/permissions');
  const data = res.data?.data;
  return Array.isArray(data) ? data : [];
}

export async function getRoleById(id: string): Promise<Role> {
  const res = await apiClient.get<ApiResponse<Role>>(`/roles/${id}`);
  const data = res.data?.data;
  if (!data) throw new Error('Role not found');
  return data;
}

export async function createRole(payload: RoleFormPayload): Promise<Role> {
  const res = await apiClient.post<ApiResponse<Role>>('/roles', payload);
  const data = res.data?.data;
  if (!data) throw new Error('Invalid response');
  return data;
}

export async function updateRole(id: string, payload: Partial<RoleFormPayload>): Promise<Role> {
  const res = await apiClient.patch<ApiResponse<Role>>(`/roles/${id}`, payload);
  const data = res.data?.data;
  if (!data) throw new Error('Invalid response');
  return data;
}

export async function setDefaultRole(id: string): Promise<Role> {
  const res = await apiClient.patch<ApiResponse<Role>>(`/roles/${id}/set-default`, {});
  const data = res.data?.data;
  if (!data) throw new Error('Invalid response');
  return data;
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/roles/${id}`);
}
