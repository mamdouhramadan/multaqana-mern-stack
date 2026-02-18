import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";

const CARD_DATA = [
  {
    titleKey: "home.albumsCards.card1",
    image:
      "https://images.unsplash.com/photo-1543487945-139a97f387d5?w=1200&auto=format&fit=crop&q=60",
  },
  {
    titleKey: "home.albumsCards.card2",
    image:
      "https://images.unsplash.com/photo-1529254479751-faeedc59e78f?w=1200&auto=format&fit=crop&q=60",
  },
  {
    titleKey: "home.albumsCards.card3",
    image:
      "https://images.unsplash.com/photo-1618327907215-4e514efabd41?w=1200&auto=format&fit=crop&q=60",
  },
  {
    titleKey: "home.albumsCards.card4",
    image:
      "https://images.unsplash.com/photo-1583407723467-9b2d22504831?w=1200&auto=format&fit=crop&q=60",
  },
];

const MARQUEE_LOOP_COPIES = 4;
const MARQUEE_DURATION_MS = CARD_DATA.length * 2500;
const LOOPED_CARDS = Array.from({ length: MARQUEE_LOOP_COPIES }, () => CARD_DATA).flat();

export function HomeAlbumsSection() {
  const { t } = useTranslation();
  const [stopScroll, setStopScroll] = useState(false);

  return (
    <section className="w-full py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <HomeSectionHeader titleKey="home.albums" viewAllHref="/photos" />
        <div
          className="overflow-hidden w-full relative mt-6"
          onMouseEnter={() => setStopScroll(true)}
          onMouseLeave={() => setStopScroll(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-linear-to-r from-gray-50 dark:from-gray-900/40 to-transparent"
            aria-hidden
          />
          <div
            className="home-albums-marquee-inner flex w-fit"
            style={{
              animationPlayState: stopScroll ? "paused" : "running",
              animationDuration: `${MARQUEE_DURATION_MS}ms`,
            }}
          >
            <div className="flex">
              {LOOPED_CARDS.map((card, index) => (
                <Link
                  key={`${card.titleKey}-${index}`}
                  to="/photos"
                  className="w-56 mx-4 h-80 relative group hover:scale-[0.98] transition-transform duration-300 block rounded-xl overflow-hidden shrink-0"
                >
                  <img
                    src={card.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="flex items-center justify-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 bg-black/40 backdrop-blur-sm">
                    <p className="text-white text-lg font-semibold text-center">
                      {t(card.titleKey)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div
            className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-linear-to-l from-gray-50 dark:from-gray-900/40 to-transparent"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
