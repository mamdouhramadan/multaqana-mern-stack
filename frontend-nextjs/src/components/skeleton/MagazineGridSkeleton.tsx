export const MagazineGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-9 bg-gray-200 rounded w-full mt-4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};
