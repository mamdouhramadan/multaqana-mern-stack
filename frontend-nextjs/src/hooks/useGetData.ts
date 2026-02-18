import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import apiClient from '../api/client';

/**
 * ==============================================
 * useGetData Hook - هوك جلب البيانات العام
 * ==============================================
 * 
 * A generic hook for fetching data from the JSON server
 * هوك عام لجلب البيانات من خادم JSON
 * 
 * @template T - The type of data expected from the API
 *               نوع البيانات المتوقع من الـ API
 * 
 * @param endpoint - The API endpoint name (e.g., 'employees', 'applications')
 *                   اسم نقطة نهاية الـ API (مثل: 'employees', 'applications')
 * 
 * @param params - Optional parameters for filtering, searching, and pagination
 *                 معلمات اختيارية للتصفية والبحث والترقيم
 * 
 * @param options - Optional React Query options
 *                  خيارات React Query الاختيارية
 * 
 * @returns React Query result object with data, isLoading, error, etc.
 *          كائن نتيجة React Query يحتوي على البيانات وحالة التحميل والأخطاء
 * 
 * @example
 * // جلب جميع الموظفين
 * // Fetch all employees
 * const { data, isLoading, error } = useGetData<Employee[]>('employees');
 * 
 * @example
 * // جلب الموظفين مع البحث والترقيم
 * // Fetch employees with search and pagination
 * const { data } = useGetData<Employee[]>('employees', {
 *   q: 'Ahmed',       // بحث نصي - text search
 *   _page: 1,         // رقم الصفحة - page number
 *   _limit: 10,       // عدد العناصر - items per page
 *   department: 'IT'  // تصفية بالقسم - filter by department
 * });
 */

// معلمات الاستعلام - Query Parameters Interface
export interface QueryParams {
  /** البحث النصي - Text search (mapped to backend 'search' param) */
  q?: string;
  /** رقم الصفحة - Page number for pagination */
  _page?: number;
  /** عدد العناصر في الصفحة - Number of items per page */
  _limit?: number;
  /** الترتيب حسب - Sort by field name */
  _sort?: string;
  /** اتجاه الترتيب - Sort order (asc or desc) */
  _order?: 'asc' | 'desc';
  /** أي معلمات تصفية إضافية - Any additional filter parameters */
  [key: string]: string | number | boolean | undefined;
}

/** Node backend expects these; we accept both JSON Server style and backend style. */
const PARAM_MAP: Record<string, string> = {
  _page: 'page',
  _limit: 'limit',
  q: 'search',
};

/** Endpoints that map to backend path + fixed query (e.g. categories?module=files). */
const ENDPOINT_MAP: Record<string, { path: string; extraParams?: QueryParams }> = {
  fileCategories: { path: 'categories', extraParams: { module: 'files' } },
  faqCategories: { path: 'categories', extraParams: { module: 'faqs' } },
  photos: { path: 'albums', extraParams: undefined },
  searchResults: { path: 'search', extraParams: undefined },
};

function mapParams(params?: QueryParams): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ) as Record<string, string | number | boolean>;
  const out: Record<string, string | number | boolean> = {};
  let sortField: string | undefined;
  let sortOrder: string | undefined;
  for (const [key, value] of Object.entries(cleaned)) {
    if (key === '_sort') sortField = String(value);
    else if (key === '_order') sortOrder = String(value);
    else if (PARAM_MAP[key]) out[PARAM_MAP[key]] = value;
    else out[key] = value;
  }
  if (sortField !== undefined) {
    out.sort = sortOrder === 'asc' ? sortField : `-${sortField}`;
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Serialize params to a stable query key (same params => same string).
 * Avoids unnecessary refetches when callers pass inline objects.
 */
function stableParamsKey(params?: QueryParams): string {
  if (params == null || typeof params !== 'object') return '';
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  );
  const keys = Object.keys(cleaned).sort();
  if (keys.length === 0) return '';
  return JSON.stringify(keys.map((k) => [k, cleaned[k]]));
}

/**
 * جلب البيانات من الخادم
 * Fetches data from the server (Node.js API: response body is { success, code, message_code, message, data };
 * we return body.data so list endpoints get the array and single-resource endpoints get the document.)
 */
async function fetchData<T>(endpoint: string, params?: QueryParams): Promise<T> {
  const mapped = ENDPOINT_MAP[endpoint];
  const path = mapped ? mapped.path : endpoint;
  const baseParams = mapParams(params);
  const extraParams = mapped?.extraParams;
  const finalParams =
    extraParams == null ? baseParams : { ...extraParams, ...baseParams };

  const response = await apiClient.get<unknown>(`/${path}`, {
    params: finalParams,
  });

  // Unwrap Node API response: { success, data, pagination } or { success, data, meta }
  const body = response.data as Record<string, unknown>;
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    body.data !== undefined
  ) {
    return body.data as T;
  }
  return response.data as T;
}

/**
 * هوك جلب البيانات العام
 * Generic data fetching hook
 */
export function useGetData<T>(
  endpoint: string,
  params?: QueryParams,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    // Stable key: endpoint + serialized params so inline objects don't cause refetches
    queryKey: [endpoint, stableParamsKey(params)],

    // دالة جلب البيانات
    // Data fetching function
    queryFn: () => fetchData<T>(endpoint, params),

    // الخيارات الإضافية
    // Additional options
    ...options,
  });
}

export default useGetData;
