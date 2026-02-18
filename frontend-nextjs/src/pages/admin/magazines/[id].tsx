import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { magazineSchema, type MagazineFormData } from '@/schemas/magazine';
import { useCreateData, useUpdateData } from '@/hooks/useMutateData';
import apiClient from '@/api/client';
import WordPressFormLayout from '@/components/admin/WordPressFormLayout';
import PublishSidebar from '@/components/admin/PublishSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/Spinner';

const CATEGORIES = ['Technology', 'AI', 'Design', 'Culture'];

const MagazineForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const { data: existing, isLoading } = useQuery({
    queryKey: ['magazines', id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await apiClient.get<{ data?: Record<string, unknown> }>(`/magazines/${id}`);
      const raw = res.data?.data ?? res.data;
      if (!raw || typeof raw !== 'object') return null;
      const item = raw as Record<string, unknown>;
      const publishedAt = item.publishedAt;
      const dateStr = publishedAt instanceof Date
        ? (publishedAt as Date).toISOString().slice(0, 10)
        : typeof publishedAt === 'string'
          ? publishedAt.slice(0, 10)
          : '';
      return {
        title: (item.title as string) ?? '',
        cover: (item.thumbnail as string) ?? '',
        date: dateStr,
        category: (item.category as string) ?? '',
      };
    },
    enabled: !isNew,
  });
  const createMutation = useCreateData<MagazineFormData>('magazines');
  const updateMutation = useUpdateData<MagazineFormData & { id: string | number }>('magazines');
  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<MagazineFormData>({ resolver: zodResolver(magazineSchema), defaultValues: { title: '', cover: '', date: '', category: '' } });

  const cover = watch('cover');

  useEffect(() => { if (existing) reset(existing); }, [existing, reset]);
  const onSubmit = async (data: MagazineFormData) => { try { if (isNew) { await createMutation.mutateAsync(data); toast.success('Created'); } else { await updateMutation.mutateAsync({ ...data, id: id! }); toast.success('Updated'); } navigate('/admin/magazines'); } catch { toast.error('Failed'); } };
  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner size="md" /></div>;
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WordPressFormLayout title={isNew ? 'Add Magazine' : 'Edit Magazine'} backLink="/admin/magazines" mainContent={
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Title</Label><Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('title')} />{errors.title && <p className="text-sm text-red-500 dark:text-red-400">{errors.title.message}</p>}</div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Date</Label><Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('date')} placeholder="January 2025" /></div>
            <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Category</Label><Controller name="category" control={control} render={({ field }) => (<Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">{CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">{c}</SelectItem>)}</SelectContent></Select>)} /></div>
          </div>
        </div>
      } sidebar={
        <PublishSidebar
          status={status}
          onStatusChange={setStatus}
          onSave={handleSubmit(onSubmit)}
          isLoading={createMutation.isPending || updateMutation.isPending}
          isNew={isNew}
          image={cover}
          onImageChange={(val) => setValue('cover', val, { shouldDirty: true })}
        />
      } />
    </form>
  );
};
export default MagazineForm;
