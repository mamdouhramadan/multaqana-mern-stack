export const FilesListSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center p-4 bg-white rounded-xl border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse mr-4" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  );
};
