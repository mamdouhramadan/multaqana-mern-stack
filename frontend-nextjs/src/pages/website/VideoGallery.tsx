import { useState } from 'react';
import PageLayout from "@/layout/PageLayout";
import { useGetData } from "@/hooks/useGetData";
import { StateRenderer } from "@/components/ui/StateRenderer";
import { Play } from '@phosphor-icons/react';
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { VideoGridSkeleton } from "@/components/skeleton/VideoGridSkeleton";
import { Card } from "@aegov/design-system-react";
import { getImageUrl } from "@/utils/utils";
import { siteConfig } from "@/config/site";

const PLACEHOLDER_SRC = siteConfig.images.placeholder;

interface VideoItem {
  id?: number | string;
  _id?: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  views?: string;
  videoUrl?: string;
}

function VideoThumbnail({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const url = getImageUrl(src);
  const effectiveSrc = url && !failed ? url : PLACEHOLDER_SRC;

  return (
    <img
      alt={alt}
      className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
      src={effectiveSrc}
      onError={() => setFailed(true)}
    />
  );
}

const VideoGallery = () => {
  const { data, isLoading, error } = useGetData<VideoItem[]>('videos');
  const [index, setIndex] = useState(-1);

  const videoThumb = (v: VideoItem) => getImageUrl(v.thumbnail ?? "") || PLACEHOLDER_SRC;
  const videoId = (v: VideoItem) => v.id ?? v._id ?? v.title;

  const slides = data?.map(video => ({
    type: "video" as const,
    width: 1280,
    height: 720,
    poster: videoThumb(video),
    sources: [
      {
        src: (video.videoUrl ?? "") as string,
        type: "video/mp4"
      }
    ]
  }));

  return (
    <PageLayout isFullPage={false} hasPageTitle={true} hasBreadcrumb={true}>
      <StateRenderer
        isLoading={isLoading}
        loadingComponent={<VideoGridSkeleton />}
        error={error?.message ?? null}
        data={data}
      >
        {(videos) => (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, i) => (
                <div key={String(videoId(video))} onClick={() => setIndex(i)} className="cursor-pointer group">
                  <Card variant="creative">
                    <>
                      <VideoThumbnail src={video.thumbnail ?? ""} alt={video.title} />

                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/40 transition-colors">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600">
                            <Play size={24} weight="fill" className="ml-1" />
                          </div>
                        </div>
                      </div>

                      {video.duration && (
                        <span className="absolute top-4 right-4 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                          {video.duration}
                        </span>
                      )}

                      <div className="absolute inset-x-0 bottom-0 z-10 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <h2 className="text-2xl leading-tight font-bold text-[#fff] line-clamp-2">
                          {video.title}
                        </h2>
                        {video.views != null && (
                          <p className="text-sm text-white/70 mt-2 mb-0">
                            {video.views} views
                          </p>
                        )}
                      </div>
                    </>
                  </Card>
                </div>
              ))}
            </div>

            <Lightbox
              open={index >= 0}
              close={() => setIndex(-1)}
              index={index}
              slides={slides}
              plugins={[Video]}
            />
          </>
        )}
      </StateRenderer>
    </PageLayout>
  );
};

export default VideoGallery;
