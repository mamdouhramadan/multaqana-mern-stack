import apiClient from './client';

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export interface PositionListItem {
  _id: string;
  title: string;
  slug?: string;
}

export async function getPositions(): Promise<PositionListItem[]> {
  const res = await apiClient.get<ApiResponse<PositionListItem[]>>('/positions');
  const data = res.data?.data;
  return Array.isArray(data) ? data : [];
}
