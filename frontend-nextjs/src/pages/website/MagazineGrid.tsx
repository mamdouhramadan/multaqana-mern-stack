import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/layout/PageLayout";
import { useGetData } from "@/hooks/useGetData";
import { StateRenderer } from "@/components/ui/StateRenderer";
import { MagazineGridSkeleton } from "@/components/skeleton/MagazineGridSkeleton";
import { AnimatedList } from "@/components/ui/AnimatedList";
import { getImageUrl } from "@/utils/utils";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils/utils";
import type { Magazine } from "@/types/admin";

const PLACEHOLDER_SRC = siteConfig.images.placeholder;

function MagazineCardImage({
  className,
  src,
  alt,
}: {
  className: string;
  src: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = getImageUrl(src);
  const effectiveSrc = url && !failed ? url : PLACEHOLDER_SRC;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={cn(
        "w-full object-cover transition-transform duration-500 group-hover:scale-105",
        className,
      )}
      onError={() => setFailed(true)}
    />
  );
}

const MagazineGrid = () => {
  const { data, isLoading, error } = useGetData<Magazine[]>("magazines");

  const magId = (mag: Magazine) => mag.id ?? mag.title;
  const magCover = (mag: Magazine) => mag.cover ?? "";
  const magCategory = (mag: Magazine) =>
    typeof mag.category === "object" && mag.category !== null
      ? ((mag.category as { title?: string }).title ?? "")
      : ((mag.category as string) ?? "");

  return (
    <PageLayout isFullPage={false} hasPageTitle={true} hasBreadcrumb={true}>
      <StateRenderer
        isLoading={isLoading}
        loadingComponent={<MagazineGridSkeleton />}
        error={error?.message ?? null}
        data={data}
      >
        {(magazines) => (
          <AnimatedList
            items={magazines}
            keyExtractor={(mag) => String(magId(mag))}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            staggerDelay={0.06}
            animation="fadeUp"
            renderItem={(mag) => (
              <Link to={`/magazines/${magId(mag)}`}>
                <article className="aegov-card card-creative group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <MagazineCardImage
                      className="w-full min-h-[134px] h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={magCover(mag)}
                      alt={mag.title}
                    />
                  </div>
                  <div className="card-content p-4">
                    {magCategory(mag) && (
                      <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                        {magCategory(mag)}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1 mb-2 group-hover:text-primary-700 transition-colors line-clamp-2">
                      {mag.title}
                    </h3>
                    {mag.date && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mag.date}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            )}
          />
        )}
      </StateRenderer>
    </PageLayout>
  );
};

export default MagazineGrid;
