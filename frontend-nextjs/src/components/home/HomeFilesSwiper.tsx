import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useGetData } from "@/hooks/useGetData";
import { Spinner } from "@/components/ui/Spinner";
import { FilePdf, FileDoc, FileXls, FilePpt, File } from "@phosphor-icons/react";

interface FileItem {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  size?: string;
  date?: string;
  createdAt?: string;
  extension?: string;
  iconType?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = {
  pdf: FilePdf,
  doc: FileDoc,
  xls: FileXls,
  ppt: FilePpt,
};

const displayName = (f: FileItem) => f.name ?? f.title ?? "File";
const fileDate = (f: FileItem) => f.date ?? (f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "");

export const HomeFilesSwiper = () => {
  const { data, isLoading } = useGetData<FileItem[]>("files", { _limit: 8 });

  if (isLoading || !data?.length) {
    if (isLoading) {
      return (
        <div className="w-full py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Recent Files</h2>
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="w-full py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Files</h2>
          <Link to="/files" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
            View all
          </Link>
        </div>
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={24}
          loop={data.length >= 4}
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
          {data.map((file) => {
            const ext = (file.iconType ?? file.extension ?? "pdf").toLowerCase().replace(/^\./, "");
            const Icon = ICON_MAP[ext] ?? File;
            return (
              <SwiperSlide key={file.id ?? file._id ?? displayName(file)}>
                <Link to="/files">
                  <div className="aegov-card card-bordered bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-4 h-full">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary-50 dark:bg-primary-900/30 shrink-0">
                      <Icon size={28} weight="duotone" className="text-primary-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayName(file)}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {file.size ?? "—"} · {fileDate(file)}
                      </p>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};
