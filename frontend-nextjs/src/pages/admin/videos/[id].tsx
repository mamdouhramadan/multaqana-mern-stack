import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { videoSchema, type VideoFormData } from '@/schemas/video';
import { useCreateData, useUpdateData } from '@/hooks/useMutateData';
import apiClient from '@/api/client';
import WordPressFormLayout from '@/components/admin/WordPressFormLayout';
import PublishSidebar from '@/components/admin/PublishSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';

const VideoForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  const { data: existing, isLoading } = useQuery({
    queryKey: ['videos', id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await apiClient.get<{ data?: Record<string, unknown> }>(`/videos/${id}`);
      const raw = res.data?.data ?? res.data;
      if (!raw || typeof raw !== 'object') return null;
      const item = raw as Record<string, unknown>;
      return {
        title: (item.title as string) ?? '',
        thumbnail: (item.thumbnail as string) ?? '',
        duration: (item.duration as string) ?? '',
        views: (item.views as string) ?? '0',
        videoUrl: (item.videoUrl as string) ?? '',
      };
    },
    enabled: !isNew,
  });

  const createMutation = useCreateData<VideoFormData & { videoType?: string; description?: string }>('videos');
  const updateMutation = useUpdateData<VideoFormData & { id: string | number; videoType?: string; description?: string }>('videos');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema) as Resolver<VideoFormData>,
    defaultValues: { title: '', thumbnail: '', duration: '', views: '0', videoUrl: '' },
  });

  const thumbnail = watch('thumbnail');

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const onSubmit = async (data: VideoFormData) => {
    try {
      const payload = {
        title: data.title,
        thumbnail: data.thumbnail,
        videoType: 'url' as const,
        videoUrl: data.videoUrl,
        views: data.views ?? '0',
        description: '',
      };
      if (isNew) {
        await createMutation.mutateAsync(payload);
        toast.success('Video created');
      } else {
        await updateMutation.mutateAsync({ ...payload, id: id! } as VideoFormData & { id: string | number; videoType?: string; description?: string });
        toast.success('Video updated');
      }
      navigate('/admin/videos');
    } catch {
      toast.error('Failed');
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner size="md" /></div>;

  return (
    <form onSubmit={handleSubmit((data: VideoFormData) => onSubmit(data))}>
      <WordPressFormLayout
        title={isNew ? 'Add Video' : 'Edit Video'}
        backLink="/admin/videos"
        mainContent={
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Title</Label><Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('title')} />{errors.title && <p className="text-sm text-red-500 dark:text-red-400">{errors.title.message}</p>}</div>
            <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Video URL</Label><Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('videoUrl')} />{errors.videoUrl && <p className="text-sm text-red-500 dark:text-red-400">{errors.videoUrl.message}</p>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Duration</Label><Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('duration')} placeholder="00:00" /></div>
              <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Views</Label><Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" {...register('views')} /></div>
            </div>
          </div>
        }
        sidebar={
          <PublishSidebar
            status={status}
            onStatusChange={setStatus}
            onSave={handleSubmit((data: VideoFormData) => onSubmit(data))}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isNew={isNew}
            image={thumbnail}
            onImageChange={(val) => setValue('thumbnail', val, { shouldDirty: true })}
          />
        }
      />
    </form>
  );
};

export default VideoForm;
