import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useGetData } from "@/hooks/useGetData";
import { Spinner } from "@/components/ui/Spinner";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { CalendarBlank } from "@phosphor-icons/react";
import type { CalendarEvent } from "@/types/admin";

const formatEventDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

export const HomeEventsSwiper = () => {
  const { data, isLoading, error } = useGetData<CalendarEvent[]>("events", { _limit: 8 }, { retry: false });

  if (isLoading) {
    return (
      <section className="w-full py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 ">
          <HomeSectionHeader titleKey="home.upcomingEvents" viewAllHref="/search" />
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  const events = error ? [] : (data ?? []);

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 ">
        <HomeSectionHeader titleKey="home.upcomingEvents" viewAllHref="/search" />
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={24}
          loop={events.length >= 4}
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
          {events.map((ev) => (
            <SwiperSlide key={String(ev.id)}>
              <div className="aegov-card card-bordered bg-white dark:bg-gray-800 rounded-xl p-5 md:p-6 h-full flex flex-col border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none hover:shadow-md dark:hover:bg-gray-700/50 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                    <CalendarBlank size={22} weight="duotone" className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2">{ev.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatEventDate(ev.start)}</p>
                    {ev.details && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2">{ev.details}</p>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
