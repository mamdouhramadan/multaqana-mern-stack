import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import magazinesBg from "@/assets/magazines.jpg";
import videoGalleryBg from "@/assets/video-gallery.jpg";
import photoGalleryBg from "@/assets/photo-gallery.jpg";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";

const CARDS = [
  {
    key: "magazines",
    titleKey: "home.explore.magazines.title",
    descKey: "home.explore.magazines.desc",
    href: "/magazines",
    backgroundImage: magazinesBg,
  },
  {
    key: "videos",
    titleKey: "home.explore.videos.title",
    descKey: "home.explore.videos.desc",
    href: "/videos",
    backgroundImage: videoGalleryBg,
  },
  {
    key: "albums",
    titleKey: "home.explore.photoAlbums.title",
    descKey: "home.explore.photoAlbums.desc",
    href: "/photos",
    backgroundImage: photoGalleryBg,
  },
];

export const HomeExploreSection = () => {
  const { t } = useTranslation();
  return (
    <section className="w-full py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <HomeSectionHeader titleKey="home.explore.title" viewAllHref="/search" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {CARDS.map(({ key, titleKey, descKey, href, backgroundImage }) => (
            <Link
              key={key}
              to={href}
              className="aegov-card card-creative group block min-h-[200px] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-none transition-all relative"
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${backgroundImage})` }}
                aria-hidden
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" aria-hidden />
              <div className="card-content flex flex-col justify-center gap-1 py-4 px-4 relative z-10">
                <h3 className="text-xl md:text-2xl font-bold text-white!">{t(titleKey)}</h3>
                <p className="text-sm mb-0 text-white/90 font-normal">{t(descKey)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
