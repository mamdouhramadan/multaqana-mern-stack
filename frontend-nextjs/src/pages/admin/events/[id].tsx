import { lazy, Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { eventSchema, type EventFormData } from '@/schemas/event';
import { useCreateData, useUpdateData } from '@/hooks/useMutateData';
import apiClient from '@/api/client';
import WordPressFormLayout from '@/components/admin/WordPressFormLayout';
import PublishSidebar from '@/components/admin/PublishSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';

const RichTextEditor = lazy(() => import('@/components/admin/RichTextEditor'));
const RichTextEditorFallback = () => <div className="min-h-[120px] animate-pulse bg-gray-100 dark:bg-gray-700 rounded" />;

const EventForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const { data: existing, isLoading } = useQuery({
    queryKey: ['events', id],
    queryFn: async (): Promise<EventFormData | null> => {
      if (isNew) return null;
      const res = await apiClient.get<{ data?: Record<string, unknown> }>(`/events/${id}`);
      const raw = (res.data?.data ?? res.data) as Record<string, unknown> | null | undefined;
      if (!raw || typeof raw !== 'object') return null;
      const startVal = raw.start;
      const endVal = raw.end;
      const start = startVal instanceof Date ? startVal.toISOString().slice(0, 16) : String(startVal ?? '').slice(0, 16);
      const end = endVal instanceof Date ? endVal.toISOString().slice(0, 16) : String(endVal ?? '').slice(0, 16);
      return { ...raw, start, end, allDay: Boolean(raw.allDay) } as EventFormData;
    },
    enabled: !isNew,
  });
  const createMutation = useCreateData<EventFormData>('events');
  const updateMutation = useUpdateData<EventFormData & { id: string | number }>('events');
  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as Resolver<EventFormData>,
    defaultValues: { title: '', start: '', end: '', allDay: false, resource: '', cover_image: '', details: '' },
  });

  const coverImage = watch('cover_image');

  useEffect(() => { if (existing) reset(existing); }, [existing, reset]);

  const onSubmit = async (data: EventFormData) => {
    try {
      if (isNew) {
        await createMutation.mutateAsync(data);
        toast.success('Created');
      } else {
        // id from params is string, but backend might accept string or number
        await updateMutation.mutateAsync({ ...data, id: id! });
        toast.success('Updated');
      }
      navigate('/admin/events');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save event');
    }
  };
  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner size="md" /></div>;
  return (
    <form onSubmit={handleSubmit((data: EventFormData) => onSubmit(data))}>
      <WordPressFormLayout title={isNew ? 'Add Event' : 'Edit Event'} backLink="/admin/events" mainContent={
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Title</Label><Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('title')} />{errors.title && <p className="text-sm text-red-500 dark:text-red-400">{errors.title.message}</p>}</div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Start</Label><Input type="datetime-local" className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" {...register('start')} /></div>
            <div className="space-y-2"><Label className="text-gray-900 dark:text-white">End</Label><Input type="datetime-local" className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" {...register('end')} /></div>
          </div>
          <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Location/Resource</Label><Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('resource')} placeholder="Room A, Remote, etc." /></div>

          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white">Details</Label>
            <Controller
              name="details"
              control={control}
              render={({ field }) => (
                <Suspense fallback={<RichTextEditorFallback />}>
                  <RichTextEditor
                    content={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Event details..."
                  />
                </Suspense>
              )}
            />
          </div>
        </div>
      } sidebar={
        <PublishSidebar
          status={status}
          onStatusChange={setStatus}
          onSave={handleSubmit((data: EventFormData) => onSubmit(data))}
          isLoading={createMutation.isPending || updateMutation.isPending}
          isNew={isNew}
          image={coverImage}
          onImageChange={(val) => setValue('cover_image', val, { shouldDirty: true })}
        />
      } />
    </form>
  );
};
export default EventForm;
