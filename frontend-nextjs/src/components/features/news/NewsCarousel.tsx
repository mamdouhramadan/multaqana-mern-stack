import { useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { NewsCard } from "./NewsCard";
import { useGetData } from "@/hooks/useGetData";

// News item interface - واجهة عنصر الأخبار
interface NewsItem {
  id: number;
  image: string;
  title: string;
  description: string;
  date: string;
  url: string;
}

export const NewsCarousel = () => {
  // Fetch news from API - جلب الأخبار من الـ API
  const { data: news, isLoading } = useGetData<NewsItem[]>('news');

  const settings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 640,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    }),
    []
  );

  // Show skeleton while loading - عرض الهيكل أثناء التحميل
  if (isLoading || !news) {
    return (
      <div className="w-full py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Latest News</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Latest News</h2>
        <Slider {...settings} className="pb-8">
          {news.map((item) => (
            <div key={item.id} className="px-3">
              <NewsCard {...item} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};
