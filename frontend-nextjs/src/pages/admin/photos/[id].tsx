import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { photoSchema, type PhotoFormData } from '@/schemas/photo';
import { useCreateData, useUpdateData } from '@/hooks/useMutateData';
import apiClient from '@/api/client';
import WordPressFormLayout from '@/components/admin/WordPressFormLayout';
import PublishSidebar from '@/components/admin/PublishSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';

// Albums API uses title, description, thumbnail; form uses alt (title), src (thumbnail)
const PhotoForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [category, _setCategory] = useState('');

  const { data: existing, isLoading } = useQuery({
    queryKey: ['photos', 'albums', id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await apiClient.get<{ data?: Record<string, unknown> }>(`/albums/${id}`);
      const raw = res.data?.data ?? res.data;
      if (!raw || typeof raw !== 'object') return null;
      const item = raw as Record<string, unknown>;
      return {
        src: (item.thumbnail as string) ?? '',
        alt: (item.title as string) ?? '',
        height: 'h-64',
      };
    },
    enabled: !isNew,
  });

  const createMutation = useCreateData<PhotoFormData & { title?: string; description?: string; category?: string }>('photos');
  const updateMutation = useUpdateData<PhotoFormData & { id: string | number; title?: string; description?: string; category?: string }>('photos');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PhotoFormData>({
    resolver: zodResolver(photoSchema) as Resolver<PhotoFormData>,
    defaultValues: { src: '', alt: '', height: 'h-64' },
  });

  const src = watch('src');

  useEffect(() => {
    if (existing) {
      reset(existing);
    }
  }, [existing, reset]);

  const onSubmit = async (data: PhotoFormData) => {
    try {
      const payload = {
        title: data.alt,
        description: '',
        category: category || undefined,
      };
      if (isNew) {
        await createMutation.mutateAsync(payload as Partial<PhotoFormData>);
        toast.success('Album created');
      } else {
        await updateMutation.mutateAsync({ ...payload, id: id!, alt: data.alt, src: data.src } as PhotoFormData & { id: string; title: string; description: string; category?: string });
        toast.success('Album updated');
      }
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      navigate('/admin/photos');
    } catch {
      toast.error('Failed');
    }
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((data: PhotoFormData) => onSubmit(data))}>
      <WordPressFormLayout
        title={isNew ? 'Add Photo Album' : 'Edit Photo Album'}
        backLink="/admin/photos"
        mainContent={
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white">Title</Label>
              <Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('alt')} placeholder="Album title" />
              {errors.alt && <p className="text-sm text-red-500 dark:text-red-400">{errors.alt.message}</p>}
            </div>
          </div>
        }
        sidebar={
          <PublishSidebar
            status={status}
            onStatusChange={setStatus}
            onSave={handleSubmit((data: PhotoFormData) => onSubmit(data))}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isNew={isNew}
            image={src}
            onImageChange={(val) => setValue('src', val, { shouldDirty: true })}
          />
        }
      />
    </form>
  );
};

export default PhotoForm;
