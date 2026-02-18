export const ApplicationListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-lg bg-gray-200 animate-pulse mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />
          <div className="h-8 bg-gray-200 rounded w-full mt-auto animate-pulse" />
        </div>
      ))}
    </div>
  );
};
