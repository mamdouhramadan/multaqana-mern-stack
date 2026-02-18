import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fileSchema, type FileFormData } from '@/schemas/file';
import { useGetData } from '@/hooks/useGetData';
import apiClient from '@/api/client';
import WordPressFormLayout from '@/components/admin/WordPressFormLayout';
import PublishSidebar from '@/components/admin/PublishSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';
import type { FileCategory } from '@/types/admin';

const FileForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories } = useGetData<FileCategory[]>('fileCategories');
  const { data: existing, isLoading } = useQuery({
    queryKey: ['files', id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await apiClient.get<{ data?: Record<string, unknown> }>(`/files/${id}`);
      const raw = res.data?.data ?? res.data;
      if (!raw || typeof raw !== 'object') return null;
      const item = raw as Record<string, unknown>;
      const cat = item.category;
      const categoryId = cat && typeof cat === 'object' && cat !== null && '_id' in cat
        ? (cat as { _id?: string })._id
        : (typeof cat === 'string' ? cat : '');
      return {
        name: (item.title as string) ?? '',
        size: (item.size as string) ?? '',
        date: item.createdAt
          ? typeof item.createdAt === 'string'
            ? item.createdAt.slice(0, 10)
            : (item.createdAt as Date).toISOString?.()?.slice(0, 10) ?? ''
          : '',
        category: categoryId,
        iconType: (item.extension as string)?.toLowerCase() ?? 'pdf',
        color: 'text-red-500',
      };
    },
    enabled: !isNew,
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FileFormData>({
    resolver: zodResolver(fileSchema) as Resolver<FileFormData>,
    defaultValues: { name: '', size: '', date: '', category: '', iconType: 'pdf', color: 'text-red-500' },
  });

  useEffect(() => {
    if (existing) {
      const { name, size, date, category: cat } = existing;
      setValue('name', name ?? '');
      setValue('size', size ?? '');
      setValue('date', date ?? '');
      setValue('category', cat ?? '');
      setCategory((cat as string) ?? '');
    }
  }, [existing, setValue]);
  useEffect(() => setValue('category', category), [category, setValue]);

  const onSubmit = async (data: FileFormData) => {
    try {
      setIsSubmitting(true);
      if (isNew) {
        if (!file) {
          toast.error('Please select a file to upload');
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', data.name);
        formData.append('description', '');
        if (category) formData.append('category', category);
        await apiClient.post('/files', formData);
        toast.success('File uploaded');
      } else {
        await apiClient.patch(`/files/${id}`, {
          title: data.name,
          description: '',
          category: category || data.category,
        });
        toast.success('Updated');
      }
      queryClient.invalidateQueries({ queryKey: ['files'] });
      navigate('/admin/files');
    } catch {
      toast.error('Failed');
    } finally {
      setIsSubmitting(false);
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
    <form onSubmit={handleSubmit((data: FileFormData) => onSubmit(data))}>
      <WordPressFormLayout
        title={isNew ? 'Add File' : 'Edit File'}
        backLink="/admin/files"
        mainContent={
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white">Title / File name</Label>
              <Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('name')} placeholder="Document title" />
              {errors.name && <p className="text-sm text-red-500 dark:text-red-400">{errors.name.message}</p>}
            </div>
            {isNew && (
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">File</Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white file:text-gray-900 dark:file:text-white"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            )}
            {!isNew && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-white">Size</Label>
                  <Input {...register('size')} readOnly className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-white">Date</Label>
                  <Input {...register('date')} readOnly className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                </div>
              </div>
            )}
          </div>
        }
        sidebar={
          <PublishSidebar
            status={status}
            onStatusChange={setStatus}
            category={category}
            categories={categories}
            onCategoryChange={setCategory}
            onSave={handleSubmit((data: FileFormData) => onSubmit(data))}
            isLoading={isSubmitting}
            isNew={isNew}
          />
        }
      />
    </form>
  );
};

export default FileForm;
