export const PhotoMasonrySkeleton = () => {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="break-inside-avoid rounded-xl overflow-hidden mb-6">
          <div
            className={`bg-gray-200 animate-pulse w-full rounded-xl ${i % 3 === 0 ? 'h-96' : i % 3 === 1 ? 'h-64' : 'h-72'}`}
          />
        </div>
      ))}
    </div>
  );
};
