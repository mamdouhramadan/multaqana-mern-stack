import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import helpImg from "@/assets/help.png";

export function HomeCtaContact() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl ">
      <div className="w-full bg-primary-500 text-white pt-10 px-10 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
          <div className="shrink-0 w-full max-w-50 md:max-w-60">
            <img
              src={helpImg}
              alt=""
              className="w-full h-auto object-contain"
              aria-hidden
            />
          </div>
          <div className="flex-1 text-center md:text-start">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {t("home.cta.contact.title")}
            </h2>
            <p className="text-white/95 text-base md:text-lg mb-0">
              {t("home.cta.contact.description")}
            </p>
          </div>
          <div className="shrink-0 ">
            <Link
              to="#contact"
              className="inline-block bg-white text-primary-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-primary-600 dark:hover:bg-gray-200 font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm"
            >
              {t("home.cta.contact.buttonText")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
