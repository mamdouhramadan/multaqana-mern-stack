import { lazy, Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { useQueryClient } from '@tanstack/react-query';
import { newsSchema, type NewsFormData } from '@/schemas/news';
import apiClient from '@/api/client';

import WordPressFormLayout from '@/components/admin/WordPressFormLayout';
import PublishSidebar from '@/components/admin/PublishSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';

const RichTextEditor = lazy(() => import('@/components/admin/RichTextEditor'));
const RichTextEditorFallback = () => <div className="min-h-[120px] animate-pulse bg-gray-100 dark:bg-gray-700 rounded" />;

/**
 * News Edit/Add Form
 * نموذج تحرير/إضافة الأخبار
 */
const NewsForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: existingNews, isLoading: isFetching } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      if (isNew) return null;
      const response = await apiClient.get<Record<string, unknown>>(`/news/${id}`);
      const raw = (response.data as { data?: Record<string, unknown> })?.data ?? response.data;
      if (!raw || typeof raw !== 'object') return null;
      const item = raw as Record<string, unknown>;
      const publishedAt = item.publishedAt;
      const dateStr = publishedAt instanceof Date
        ? publishedAt.toISOString().slice(0, 10)
        : typeof publishedAt === 'string'
          ? publishedAt.slice(0, 10)
          : '';
      return {
        title: (item.title as string) ?? '',
        image: (item.thumbnail as string) ?? '',
        description: (item.content as string) ?? '',
        date: dateStr,
        url: (item.slug as string) ?? '',
      };
    },
    enabled: !isNew,
  });

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      image: '',
      description: '',
      date: '',
      url: '',
    },
  });

  const image = watch('image');

  useEffect(() => {
    if (existingNews) {
      reset(existingNews);
      setDescription(existingNews.description || '');
    }
  }, [existingNews, reset]);

  // Sync rich text editor with form - مزامنة محرر النص الغني مع النموذج
  useEffect(() => {
    setValue('description', description);
  }, [description, setValue]);

  const onSubmit = async (data: NewsFormData) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', description || data.description);
      if (image) formData.append('thumbnail', image);

      if (isNew) {
        await apiClient.post('/news', formData);
        toast.success('News created successfully');
      } else {
        await apiClient.put(`/news/${id}`, formData);
        toast.success('News updated successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['news'] });
      navigate('/admin/news');
    } catch (err) {
      toast.error('Failed to save news');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      try {
        await apiClient.delete(`/news/${id}`);
        queryClient.invalidateQueries({ queryKey: ['news'] });
        toast.success('News deleted');
        navigate('/admin/news');
      } catch (err) {
        toast.error('Failed to delete news');
      }
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WordPressFormLayout
        title={isNew ? 'Add New Article' : 'Edit Article'}
        backLink="/admin/news"
        backLabel="Back to News"
        mainContent={
          <div className="space-y-6">
            {/* Title Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-900 dark:text-white">Title</Label>
                <Input id="title" placeholder="Enter news title" className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('title')} />
                {errors.title && <p className="text-sm text-red-500 dark:text-red-400">{errors.title.message}</p>}
              </div>
            </div>

            {/* Content Card with Rich Text */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <Label className="text-gray-900 dark:text-white">Content</Label>
              <Suspense fallback={<RichTextEditorFallback />}>
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Write your news content here..."
                />
              </Suspense>
              {errors.description && <p className="text-sm text-red-500 dark:text-red-400">{errors.description.message}</p>}
            </div>

            {/* Additional Fields */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-900 dark:text-white">Date</Label>
                  <Input id="date" placeholder="DD/MM/YYYY" className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('date')} />
                  {errors.date && <p className="text-sm text-red-500 dark:text-red-400">{errors.date.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-gray-900 dark:text-white">URL</Label>
                  <Input id="url" placeholder="/path/to/article" className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('url')} />
                  {errors.url && <p className="text-sm text-red-500 dark:text-red-400">{errors.url.message}</p>}
                </div>
              </div>
            </div>
          </div>
        }
        sidebar={
          <PublishSidebar
            status={status}
            onStatusChange={setStatus}
            onSave={handleSubmit(onSubmit)}
            onDelete={!isNew ? handleDelete : undefined}
            isLoading={isSubmitting}
            isNew={isNew}
            image={image}
            onImageChange={(val) => setValue('image', val, { shouldDirty: true })}
          />
        }
      />
    </form>
  );
};

export default NewsForm;
