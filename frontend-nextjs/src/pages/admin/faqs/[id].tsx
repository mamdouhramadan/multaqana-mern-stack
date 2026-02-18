import { lazy, Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { faqSchema, type FAQFormData } from '@/schemas/faq';
import { useCreateData, useUpdateData } from '@/hooks/useMutateData';
import { useGetData } from '@/hooks/useGetData';
import apiClient from '@/api/client';

import WordPressFormLayout from '@/components/admin/WordPressFormLayout';
import PublishSidebar from '@/components/admin/PublishSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';
import type { FAQCategory } from '@/types/admin';

const RichTextEditor = lazy(() => import('@/components/admin/RichTextEditor'));
const RichTextEditorFallback = () => <div className="min-h-[120px] animate-pulse bg-gray-100 dark:bg-gray-700 rounded" />;

const FAQForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');

  const { data: categories } = useGetData<FAQCategory[]>('faqCategories');

  const { data: existing, isLoading } = useQuery({
    queryKey: ['faqs', id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await apiClient.get<{ data?: { title?: string; description?: string; category?: string } }>(`/faqs/${id}`);
      const raw = res.data?.data ?? (res.data as Record<string, unknown>);
      if (!raw) return null;
      const cat = raw.category && typeof raw.category === 'object' && raw.category !== null && '_id' in raw.category
        ? (raw.category as { _id: string })._id
        : (typeof raw.category === 'string' ? raw.category : '');
      return {
        question: (raw.title ?? '') as string,
        answer: (raw.description ?? '') as string,
        category: cat,
      };
    },
    enabled: !isNew,
  });

  const createMutation = useCreateData<FAQFormData>('faqs');
  const updateMutation = useUpdateData<FAQFormData & { id: string }>('faqs');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: { question: '', answer: '', category: '' },
  });

  useEffect(() => {
    if (existing) {
      reset({ question: existing.question, answer: existing.answer, category: existing.category });
      setAnswer(existing.answer || '');
      setCategory(existing.category || '');
    }
  }, [existing, reset]);
  useEffect(() => { setValue('answer', answer); }, [answer, setValue]);
  useEffect(() => { setValue('category', category); }, [category, setValue]);

  const onSubmit = async (data: FAQFormData) => {
    try {
      const payload = {
        title: data.question,
        description: answer || data.answer,
        category: category || data.category,
      };
      if (isNew) {
        await createMutation.mutateAsync(payload as unknown as Partial<FAQFormData>);
        toast.success('FAQ created');
      } else {
        await updateMutation.mutateAsync({ ...payload, id: id! } as unknown as FAQFormData & { id: string });
        toast.success('FAQ updated');
      }
      navigate('/admin/faqs');
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this FAQ?')) {
      try {
        await apiClient.delete(`/faqs/${id}`);
        toast.success('Deleted');
        navigate('/admin/faqs');
      } catch { toast.error('Failed'); }
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner size="md" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WordPressFormLayout
        title={isNew ? 'Add New FAQ' : 'Edit FAQ'}
        backLink="/admin/faqs"
        backLabel="Back to FAQs"
        mainContent={
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Question</Label><Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('question')} />{errors.question && <p className="text-sm text-red-500 dark:text-red-400">{errors.question.message}</p>}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <Label className="text-gray-900 dark:text-white">Answer</Label>
              <Suspense fallback={<RichTextEditorFallback />}>
                <RichTextEditor content={answer} onChange={setAnswer} />
              </Suspense>
              {errors.answer && <p className="text-sm text-red-500 dark:text-red-400">{errors.answer.message}</p>}
            </div>
          </div>
        }
        sidebar={
          <PublishSidebar
            status={status}
            onStatusChange={setStatus}
            category={category}
            categories={categories}
            onCategoryChange={setCategory}
            onSave={handleSubmit(onSubmit)}
            onDelete={!isNew ? handleDelete : undefined}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isNew={isNew}
          />
        }
      />
    </form>
  );
};

export default FAQForm;
