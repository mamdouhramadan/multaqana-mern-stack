import { Link } from "react-router-dom";
import { useGetData } from "@/hooks/useGetData";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
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
  category?: string | { _id?: string; title?: string; slug?: string };
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
const fileDate = (f: FileItem) =>
  f.date ?? (f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "");
const categoryLabel = (f: FileItem) =>
  typeof f.category === "object" && f.category !== null
    ? (f.category as { title?: string }).title ?? ""
    : (f.category as string) ?? "";
const fileType = (f: FileItem) =>
  (f.iconType ?? f.extension ?? "file").toLowerCase().replace(/^\./, "");

export const HomeFilesList = () => {
  const { data, isLoading } = useGetData<FileItem[]>("files", { _limit: 10 });

  if (isLoading || !data?.length) {
    if (isLoading) {
      return (
        <section className="w-full py-10 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 ">
            <HomeSectionHeader titleKey="home.recentFiles" viewAllHref="/files" />
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="w-full py-10 md:py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 ">
        <HomeSectionHeader titleKey="home.recentFiles" viewAllHref="/files" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {data.map((file) => {
            const ext = fileType(file);
            const Icon = ICON_MAP[ext] ?? File;
            return (
              <Link
                key={file.id ?? file._id ?? displayName(file)}
                to="/files"
                className="no-underline flex items-center gap-4 p-4 md:p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md dark:hover:bg-gray-700/50 transition-all"
              >
                <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-primary-50 dark:bg-primary-900/30 shrink-0">
                  <Icon size={24} weight="duotone" className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="!text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {displayName(file)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {categoryLabel(file) && (
                      <span className="text-primary-600 dark:text-primary-400">
                        {categoryLabel(file)}
                      </span>
                    )}
                    {categoryLabel(file) && <span>·</span>}
                    <span>{fileDate(file)}</span>
                    <span>·</span>
                    <span className="uppercase">{ext}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
