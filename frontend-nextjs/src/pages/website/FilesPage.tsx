import { useState } from "react";
import PageLayout from "@/layout/PageLayout";
import { useGetData } from "@/hooks/useGetData";
import { StateRenderer } from "@/components/ui/StateRenderer";
import { FilesListSkeleton } from "@/components/skeleton/FilesListSkeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MagnifyingGlass, Funnel, DownloadSimple, FilePdf, FileDoc, FileXls, FilePpt } from "@phosphor-icons/react";
import { AnimatedList } from "@/components/ui/AnimatedList";

interface FileItem {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  size?: string;
  date?: string;
  createdAt?: string;
  category?: string | { _id?: string; title?: string; slug?: string };
  iconType?: string;
  color?: string;
  extension?: string;
}

interface FileCategory {
  id?: number | string;
  _id?: string;
  name?: string;
  title?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = {
  pdf: FilePdf,
  doc: FileDoc,
  xls: FileXls,
  ppt: FilePpt,
};

const fileDisplayName = (file: FileItem) => file.name ?? file.title ?? "";
const fileCategoryLabel = (file: FileItem) =>
  typeof file.category === "object" && file.category !== null
    ? (file.category as { title?: string }).title ?? ""
    : (file.category as string) ?? "";
const fileDate = (file: FileItem) => file.date ?? (file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "");
const categoryDisplayName = (cat: FileCategory) => cat.name ?? cat.title ?? "";
const categoryId = (cat: FileCategory) => cat.id ?? cat._id ?? "";

const FilesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data, isLoading, error } = useGetData<FileItem[]>('files');
  const { data: categories } = useGetData<FileCategory[]>('fileCategories');

  const filteredFiles = data?.filter((file) => {
    const name = fileDisplayName(file);
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchLower || name.toLowerCase().includes(searchLower);
    const catLabel = fileCategoryLabel(file);
    const matchesCategory = selectedCategory === "All" || catLabel === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout isFullPage={false} hasPageTitle={true} hasBreadcrumb={true}>
      <div className="flex flex-col lg:flex-row gap-8">

        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <Input
                placeholder="Search files..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100 font-semibold border-b border-gray-100 dark:border-gray-700 pb-2">
              <Funnel size={18} className="text-primary-600" />
              <h6>Categories</h6>
            </div>

            <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="All" id="cat-all" />
                <Label htmlFor="cat-all" className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">All Categories</Label>
              </div>
              {categories?.map((cat) => (
                <div key={String(categoryId(cat))} className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value={categoryDisplayName(cat)} id={`cat-${categoryId(cat)}`} />
                  <Label htmlFor={`cat-${categoryId(cat)}`} className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">{categoryDisplayName(cat)}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </aside>

        <div className="flex-1">
          <StateRenderer
            isLoading={isLoading}
            loadingComponent={<FilesListSkeleton />}
            error={error?.message ?? null}
            data={filteredFiles}
            isEmpty={filteredFiles && filteredFiles.length === 0}
          >
            {(files) => (
              <AnimatedList
                items={files}
                keyExtractor={(file) => file.id ?? file._id ?? String(file.title ?? "")}
                className="space-y-4"
                staggerDelay={0.04}
                animation="fadeUp"
                renderItem={(file) => {
                  const iconType = file.iconType ?? (file.extension ?? "pdf").toLowerCase().replace(/^\./, "");
                  const Icon = ICON_MAP[iconType] || FilePdf;
                  return (
                    <div className="flex items-center p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 mr-4 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                        <Icon size={32} weight="duotone" className={file.color ?? "text-primary-600"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base text-gray-900 dark:text-gray-100 font-semibold truncate group-hover:text-primary-600 transition-colors">{fileDisplayName(file)}</h4>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 gap-3">
                          <span>{file.size ?? "—"}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{fileDate(file)}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-primary-600 bg-primary-50 dark:bg-primary-900/40 px-2 rounded-full">{fileCategoryLabel(file) || "—"}</span>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all" title="Download">
                        <DownloadSimple size={24} />
                      </button>
                    </div>
                  );
                }}
              />
            )}
          </StateRenderer>
        </div>
      </div>
    </PageLayout>
  );
};

export default FilesPage;
