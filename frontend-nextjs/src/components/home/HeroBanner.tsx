import { useTranslation } from "react-i18next";
import homeBanner from "../../assets/home-banner.jpg";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - DDA design system types may not be fully available
import { DdaHomeCarousel } from "@dubai-design-system/components-react";

import iconFileText from "@/assets/icons/file-text.svg";
import iconChats from "@/assets/icons/chat-text.svg";
import iconNewspaper from "@/assets/icons/newspaper-clipping.svg";
import iconEnvelope from "@/assets/icons/envelope.svg";
import iconBriefcase from "@/assets/icons/briefcase.svg";

/* ── Old Swiper-based carousel (kept for reference) ──────────────────────
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import {
  FileText,
  ChatsCircle,
  Newspaper,
  EnvelopeSimple,
  Briefcase,
} from "@phosphor-icons/react";

const TOP_CARD_INFO = [
  {
    key: "reports",
    titleKey: "home.cards.reports.title",
    descKey: "home.cards.reports.desc",
    bgcolor: "bg-blue-50 dark:bg-blue-900/80",
    textclr: "text-blue-800 dark:text-blue-200",
    url: "/files",
    Icon: FileText,
  },
  {
    key: "chats",
    titleKey: "home.cards.chats.title",
    descKey: "home.cards.chats.desc",
    bgcolor: "bg-teal-50 dark:bg-teal-900/80",
    textclr: "text-teal-800 dark:text-teal-200",
    url: "#",
    Icon: ChatsCircle,
  },
  {
    key: "news",
    titleKey: "home.cards.news.title",
    descKey: "home.cards.news.desc",
    bgcolor: "bg-indigo-50 dark:bg-indigo-900/80",
    textclr: "text-indigo-800 dark:text-indigo-200",
    url: "/search",
    Icon: Newspaper,
  },
  {
    key: "contact",
    titleKey: "home.cards.contact.title",
    descKey: "home.cards.contact.desc",
    bgcolor: "bg-slate-100 dark:bg-slate-800",
    textclr: "text-slate-800 dark:text-slate-200",
    url: "#",
    Icon: EnvelopeSimple,
  },
  {
    key: "services",
    titleKey: "home.cards.services.title",
    descKey: "home.cards.services.desc",
    bgcolor: "bg-amber-50 dark:bg-amber-900/80",
    textclr: "text-amber-800 dark:text-amber-200",
    url: "#",
    Icon: Briefcase,
  },
];
─────────────────────────────────────────────────────────────────────── */

const HeroBanner = () => {
  const { t } = useTranslation();

  const bannerCardList = JSON.stringify([
    {
      banner_card_href: "/files",
      image_src: iconFileText,
      image_alt: t("home.cards.reports.title"),
      banner_card_title: t("home.cards.reports.title"),
      banner_card_description: t("home.cards.reports.desc"),
      banner_card_id: "bannerCardReports",
    },
    {
      banner_card_href: "#",
      image_src: iconChats,
      image_alt: t("home.cards.chats.title"),
      banner_card_title: t("home.cards.chats.title"),
      banner_card_description: t("home.cards.chats.desc"),
      banner_card_id: "bannerCardChats",
    },
    {
      banner_card_href: "/search",
      image_src: iconNewspaper,
      image_alt: t("home.cards.news.title"),
      banner_card_title: t("home.cards.news.title"),
      banner_card_description: t("home.cards.news.desc"),
      banner_card_id: "bannerCardNews",
    },
    {
      banner_card_href: "#",
      image_src: iconEnvelope,
      image_alt: t("home.cards.contact.title"),
      banner_card_title: t("home.cards.contact.title"),
      banner_card_description: t("home.cards.contact.desc"),
      banner_card_id: "bannerCardContact",
    },
    {
      banner_card_href: "#",
      image_src: iconBriefcase,
      image_alt: t("home.cards.services.title"),
      banner_card_title: t("home.cards.services.title"),
      banner_card_description: t("home.cards.services.desc"),
      banner_card_id: "bannerCardServices",
    },
  ]);

  return (
    <div className="w-full">
      <div
        className="relative bg-cover bg-center bg-no-repeat overflow-hidden min-h-screen flex flex-col items-center justify-end pb-24"
        style={{ backgroundImage: `url(${homeBanner})` }}
      >
        <div
          className="absolute inset-0 bg-linear-to-b from-primary-800/50 to-primary-700 z-0"
          aria-hidden
        />

        <div className="relative z-10 w-full">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 hero-static-header text-center">
            <div className="hero-static-title-sm text-white!">
              {t("home.hero.subtitle")}
            </div>
            <h1 className="hero-static-title text-white! mb-20! text-center">
              {t("home.hero.title")}
            </h1>
          </div>
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <DdaHomeCarousel
              items_in_view={5}
              bannercardlist={bannerCardList}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
