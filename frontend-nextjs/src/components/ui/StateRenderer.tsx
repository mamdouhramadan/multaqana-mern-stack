import { Spinner } from '@/components/ui/Spinner';

interface StateRendererProps<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null | undefined;
  isEmpty?: boolean; // Optional explicit empty check
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export function StateRenderer<T>({
  isLoading,
  error,
  data,
  isEmpty,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent
}: StateRendererProps<T>) {
  if (isLoading) {
    return loadingComponent || (
      <div className="flex items-center justify-center p-12">
        <Spinner size="md" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error) {
    return errorComponent || (
      <div className="text-center p-12 text-red-500">
        <p>Error: {error}</p>
        <button className="mt-4 text-sm underline" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Determine if empty. If isEmpty prop is provided, use it.
  // Otherwise, check if data is an empty array or null/undefined.
  const isDataEmpty = isEmpty !== undefined
    ? isEmpty
    : Array.isArray(data)
      ? data.length === 0
      : !data;

  if (isDataEmpty) {
    return emptyComponent || (
      <div className="text-center p-12 text-gray-400">
        <p>No data found.</p>
      </div>
    );
  }

  // If we get here, data is present (and T is not null/undefined)
  return <>{children(data as T)}</>;
}
