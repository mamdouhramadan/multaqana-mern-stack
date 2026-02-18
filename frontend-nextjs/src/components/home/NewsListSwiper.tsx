import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslation } from "react-i18next";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { NewsCard } from "@/components/features/news/NewsCard";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { useGetData } from "@/hooks/useGetData";
import { Spinner } from "@/components/ui/Spinner";

export interface NewsItemApi {
  id?: number;
  _id?: string;
  title: string;
  content?: string;
  thumbnail?: string;
  image?: string;
  publishedAt?: string;
  createdAt?: string;
  slug?: string;
  url?: string;
}

const formatDate = (d: string | undefined) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);

export const NewsListSwiper = () => {
  const { t } = useTranslation();
  const { data: news, isLoading } = useGetData<NewsItemApi[]>("news", { _limit: 8 });

  if (isLoading || !news) {
    return (
      <section className="w-full py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 ">
          <HomeSectionHeader titleKey="home.latestNews" viewAllHref="/search" />
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (news.length === 0) {
    return null;
  }

  const items = news.map((item) => ({
    id: item.id ?? item._id,
    image: item.thumbnail ?? item.image ?? "",
    title: item.title,
    description: item.content ? stripHtml(item.content) : "",
    date: formatDate(item.publishedAt ?? item.createdAt),
    url: item.url ?? (item.slug ? `#news-${item.slug}` : "#"),
  }));

  return (
    <section className="w-full py-10 md:py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 ">
        <HomeSectionHeader titleKey="home.latestNews" viewAllHref="/search" />
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          loop={items.length >= 4}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="news-swiper news-swiper-bullets pb-10"
        >
          {items.map((item) => (
            <SwiperSlide key={String(item.id)}>
              <NewsCard
                image={item.image}
                title={item.title}
                description={item.description}
                date={item.date}
                url={item.url}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
