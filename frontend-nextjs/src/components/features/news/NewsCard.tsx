import { useTranslation } from "react-i18next";
import { getImageUrl } from "@/utils/utils";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - DDA design system types may not be fully available
import { DdaEventCard } from "@dubai-design-system/components-react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

interface NewsCardProps {
  image: string;
  title: string;
  description: string;
  date: string;
  url: string;
}

/** Parse "Oct 26, 2024" or similar into { month: "Oct", day: "26" } */
function parseEventDate(dateStr: string): { month: string; day: string } {
  if (!dateStr || !dateStr.trim()) return { month: "", day: "" };
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 2) {
    const month = parts[0].replace(/,/g, "");
    const day = parts[1].replace(/,/g, "");
    return { month, day };
  }
  return { month: dateStr, day: "" };
}

export const NewsCard = ({ image, title, description, date, url }: NewsCardProps) => {
  const { t } = useTranslation();
  const { month, day } = parseEventDate(date);
  const imageSrc = getImageUrl(image) || "https://lipsum.app/id/12/1800x700";
  const chipList = JSON.stringify([{ chip_text: date }]);
  const avatarList = JSON.stringify([]);

  return (
    <a href={url} className="news-card-link-wrapper [&_.h5]:!text-xl [&_.h5]:!font-semibold block h-full relative" title={`${t("common.viewDetails")} - ${title}`}>
      <DdaEventCard
        card_header_icon_id="newsCardHeaderAction"
        image_src={imageSrc}
        image_alt="News Image"
        event_month={month}
        event_date={day}
        header_text={title}
        body_text={description}
        custom_class=""
        component_mode=""
        data-chip-list={chipList}
        data-avatar-list={avatarList}
        
      />
      <span className="news-card-view-details" aria-hidden="true">
        <ArrowLeftIcon size={16} weight="bold" className="news-card-view-details-arrow rtl:rotate-180" />
        {t("common.viewDetails")}
      </span>
    </a>
  );
};
