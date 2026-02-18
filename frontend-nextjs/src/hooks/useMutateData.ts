import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import apiClient from '../api/client';

/**
 * Map frontend endpoint names to backend API paths (e.g. photos -> albums)
 */
const MUTATE_ENDPOINT_MAP: Record<string, string> = {
  photos: 'albums',
};

function getMutatePath(endpoint: string): string {
  return MUTATE_ENDPOINT_MAP[endpoint] ?? endpoint;
}

/**
 * ==============================================
 * useMutateData Hook - هوك تعديل البيانات العام
 * ==============================================
 *
 * Generic hooks for creating, updating, and deleting data
 * هوكات عامة لإنشاء وتحديث وحذف البيانات
 */

// Create mutation - إنشاء عنصر جديد
export function useCreateData<T>(
  endpoint: string,
  options?: Omit<UseMutationOptions<T, Error, Partial<T>>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  const path = getMutatePath(endpoint);

  return useMutation<T, Error, Partial<T>>({
    mutationFn: async (data: Partial<T>) => {
      const response = await apiClient.post<{ data?: T }>(`/${path}`, data);
      const body = response.data as Record<string, unknown>;
      if (body && typeof body === 'object' && 'data' in body && body.data !== undefined) {
        return body.data as T;
      }
      return response.data as T;
    },
    onSuccess: () => {
      // Invalidate queries to refetch updated data
      // إبطال الاستعلامات لإعادة جلب البيانات المحدثة
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    ...options,
  });
}

// Update mutation - تحديث عنصر موجود
export function useUpdateData<T extends { id: string | number }>(
  endpoint: string,
  options?: Omit<UseMutationOptions<T, Error, T>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  const path = getMutatePath(endpoint);

  return useMutation<T, Error, T>({
    mutationFn: async (data: T) => {
      const response = await apiClient.put<{ data?: T }>(`/${path}/${data.id}`, data);
      const body = response.data as Record<string, unknown>;
      if (body && typeof body === 'object' && 'data' in body && body.data !== undefined) {
        return body.data as T;
      }
      return response.data as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    ...options,
  });
}

// Delete mutation - حذف عنصر
export function useDeleteData(
  endpoint: string,
  options?: Omit<UseMutationOptions<void, Error, string | number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  const path = getMutatePath(endpoint);

  return useMutation<void, Error, string | number>({
    mutationFn: async (id: string | number) => {
      await apiClient.delete(`/${path}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    ...options,
  });
}

