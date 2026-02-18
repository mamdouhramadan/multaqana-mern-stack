import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CaretRight } from "@phosphor-icons/react";

interface HomeSectionHeaderProps {
  /** Translation key for section title (e.g. home.latestNews) */
  titleKey: string;
  /** Route for "View all" link (e.g. /magazines, /files) */
  viewAllHref: string;
}

/**
 * Consistent section header for home page: title + "View all" link with arrow.
 * RTL-aware arrow rotation. Use with same spacing/sizing across sections.
 */
export function HomeSectionHeader({ titleKey, viewAllHref }: HomeSectionHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 md:mb-8">
      <h2 className="text-xl sm:!text-3xl !font-semibold text-gray-900 dark:text-gray-100 tracking-tight m-0">
        {t(titleKey)}
      </h2>
      <Link
        to={viewAllHref}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors w-fit"
      >
        {t("common.viewAll")}
        <CaretRight
          size={18}
          weight="bold"
          className="rtl:rotate-180 shrink-0"
          aria-hidden
        />
      </Link>
    </div>
  );
}
