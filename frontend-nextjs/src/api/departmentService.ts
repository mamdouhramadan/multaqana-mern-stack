import apiClient from './client';

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export interface DepartmentListItem {
  _id: string;
  title: string;
  slug?: string;
}

export async function getDepartments(): Promise<DepartmentListItem[]> {
  const res = await apiClient.get<ApiResponse<DepartmentListItem[]>>('/departments');
  const data = res.data?.data;
  return Array.isArray(data) ? data : [];
}
