export const EmployeeListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col items-center bg-white p-6 rounded-xl border border-gray-100">
          <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-4" />
          <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mb-1" />
          <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse mb-6" />

          <div className="flex gap-2 w-full mt-auto">
            <div className="flex-1 h-9 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1 h-9 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};
