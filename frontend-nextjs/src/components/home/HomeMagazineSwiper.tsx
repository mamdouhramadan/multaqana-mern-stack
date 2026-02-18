import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useGetData } from "@/hooks/useGetData";
import { getImageUrl } from "@/utils/utils";
import { Spinner } from "@/components/ui/Spinner";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { siteConfig } from "@/config/site";
import type { Magazine } from "@/types/admin";
import magazinesBg from "@/assets/magazines.jpg";

const PLACEHOLDER = siteConfig.images.placeholder;

export const HomeMagazineSwiper = () => {
  const { data, isLoading } = useGetData<Magazine[]>("magazines", { _limit: 8 });

  if (isLoading || !data?.length) {
    if (isLoading) {
      return (
        <section className="w-full py-10 md:py-12 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 dark:opacity-20"
            style={{ backgroundImage: `url(${magazinesBg})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gray-50/90 dark:bg-gray-900/90" aria-hidden />
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
            <HomeSectionHeader titleKey="home.magazines" viewAllHref="/magazines" />
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  const magId = (m: Magazine) => m.id ?? (m as { _id?: string })._id ?? m.title;
  const magCover = (m: Magazine) => m.cover ?? "";

  return (
    <section className="w-full py-10 md:py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 dark:opacity-20"
        style={{ backgroundImage: `url(${magazinesBg})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gray-50/90 dark:bg-gray-900/90" aria-hidden />
      <div className="container  mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <HomeSectionHeader titleKey="home.magazines" viewAllHref="/magazines" />
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          loop={data.length >= 4}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 12 },
            480: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="home-section-swiper home-swiper-bullets pb-10"
        >
          {data.map((mag) => (
            <SwiperSlide key={String(magId(mag))}>
              <Link to={`/magazines/${magId(mag)}`} className="block h-full">
                <div className="aegov-card card-creative h-full group border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md dark:hover:bg-gray-700/50 transition-all rounded-xl overflow-hidden">
                  <img
                    src={getImageUrl(magCover(mag)) || PLACEHOLDER}
                    alt={mag.title}
                    className="min-h-134 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER;
                    }}
                  />
                  <div className="card-content">
                    <h3 className="text-2xl font-bold text-white  line-clamp-2 group-hover:text-primary-100 transition-colors">
                      {mag.title}
                    </h3>
                    {mag.date && (
                      <p className="text-sm text-white! mt-1">{mag.date}</p>
                    )}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
