import { useState } from 'react';
import PageLayout from "@/layout/PageLayout";
import { useGetData } from "@/hooks/useGetData";
import { StateRenderer } from "@/components/ui/StateRenderer";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { PhotoMasonrySkeleton } from "@/components/skeleton/PhotoMasonrySkeleton";
import { getImageUrl } from "@/utils/utils";
import { siteConfig } from "@/config/site";

const PLACEHOLDER_SRC = siteConfig.images.placeholder;

interface Photo {
  id?: number | string;
  _id?: string;
  src?: string;
  image?: string;
  url?: string;
  alt?: string;
  title?: string;
  height?: string;
}

function PhotoImage({ src, alt, heightClass }: { src: string; alt: string; heightClass?: string }) {
  const [failed, setFailed] = useState(false);
  const url = getImageUrl(src);
  const effectiveSrc = url && !failed ? url : PLACEHOLDER_SRC;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={`w-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 ${heightClass ?? "h-auto"}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

const MasonryPhotoGallery = () => {
  const { data, isLoading, error } = useGetData<Photo[]>('photos');
  const [index, setIndex] = useState(-1);

  const photoSrc = (p: Photo) => getImageUrl(p.src ?? p.image ?? p.url ?? "") || PLACEHOLDER_SRC;
  const photoAlt = (p: Photo) => p.alt ?? p.title ?? "Photo";
  const photoId = (p: Photo) => p.id ?? p._id ?? photoSrc(p);

  const slides = data?.map(photo => ({ src: photoSrc(photo) }));

  return (
    <PageLayout isFullPage={false} hasPageTitle={true} hasBreadcrumb={true}>
      <StateRenderer
        isLoading={isLoading}
        loadingComponent={<PhotoMasonrySkeleton />}
        error={error?.message ?? null}
        data={data}
      >
        {(photos) => (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {photos.map((photo, i) => (
                <div
                  key={String(photoId(photo))}
                  className="break-inside-avoid relative group rounded-xl overflow-hidden mb-6 cursor-zoom-in"
                  onClick={() => setIndex(i)}
                >
                  <PhotoImage
                    src={photo.src ?? photo.image ?? photo.url ?? ""}
                    alt={photoAlt(photo)}
                    heightClass={photo.height}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium truncate">{photoAlt(photo)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Lightbox
              open={index >= 0}
              close={() => setIndex(-1)}
              index={index}
              slides={slides}
            />
          </>
        )}
      </StateRenderer>
    </PageLayout>
  );
};

export default MasonryPhotoGallery;
