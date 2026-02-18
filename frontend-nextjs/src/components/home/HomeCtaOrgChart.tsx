import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CaretRight } from "@phosphor-icons/react";
import orgChartImg from "@/assets/org-chart-img.png";
import orgChartBg from "@/assets/org-chart-bg.png";

export function HomeCtaOrgChart() {
  const { t } = useTranslation();
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 ">
      <div className="mx-auto px-4 sm:px-6 relative overflow-hidden text-gray-100 border-2 border-gray-800 rounded-lg">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${orgChartBg})` }}
          aria-hidden
        />
      
        <div className=" mx-auto px-4 sm:px-6 max-w-7xl py-10 md:py-14 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 lg:flex-nowrap">
            <div className="flex-1 text-center lg:text-start">
              <h2 className="text-2xl md:text-3xl font-bold text-white dark:text-gray-100 mb-3">
                {t("home.cta.orgChart.title")}{" "}
                <span className="text-primary-500">
                  {t("home.cta.orgChart.titleHighlight")}
                </span>
              </h2>
              <p className="text-gray-300 dark:text-gray-300 mb-6 text-base md:text-lg">
                {t("home.cta.orgChart.description")}
              </p>
              <Link
                to="#org-chart"
                className="aegov-btn inline-flex items-center gap-2 font-semibold text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-500 dark:hover:bg-primary-600 px-5 py-2.5 rounded-lg transition-colors"
              >
                {t("home.cta.orgChart.linkText")}
                <CaretRight
                  size={20}
                  weight="bold"
                  className="rtl:rotate-180 shrink-0"
                  aria-hidden
                />
              </Link>
            </div>
            <div className="flex-shrink-0 w-full max-w-md lg:max-w-lg">
              <img
                src={orgChartImg}
                alt={t("home.cta.orgChart.titleHighlight")}
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
