import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useGetData } from "@/hooks/useGetData";
import { getImageUrl } from "@/utils/utils";
import { Spinner } from "@/components/ui/Spinner";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";

interface Employee {
  id: number;
  image: string;
  name: string;
  jobTitle?: string;
  department?: string;
}

export const HomeEmployeesSwiper = () => {
  const { data, isLoading } = useGetData<Employee[]>("employees", { _limit: 8 });

  if (isLoading || !data?.length) {
    if (isLoading) {
      return (
        <section className="w-full py-10 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 ">
            <HomeSectionHeader titleKey="home.ourTeam" viewAllHref="/employees" />
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="w-full py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 ">
        <HomeSectionHeader titleKey="home.ourTeam" viewAllHref="/employees" />
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={24}
          loop={data.length >= 4}
          navigation
          autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 12 },
            480: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="home-section-swiper pb-10"
        >
          {data.map((emp) => (
            <SwiperSlide key={emp.id}>
              <Link to="/employees">
                <div className="aegov-card card-bordered bg-white dark:bg-gray-800 rounded-xl p-6 text-center h-full flex flex-col items-center border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none hover:shadow-md dark:hover:bg-gray-700/50 transition-all">
                  <img
                    src={getImageUrl(emp.image)}
                    alt={emp.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 dark:border-gray-600 mb-3"
                  />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{emp.name}</h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400 line-clamp-2">{emp.jobTitle ?? "—"}</p>
                  {emp.department && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{emp.department}</p>
                  )}
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
