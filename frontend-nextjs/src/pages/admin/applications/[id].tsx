import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import { applicationSchema, type ApplicationFormData } from '@/schemas/application';
import { useCreateData, useUpdateData } from '@/hooks/useMutateData';
import apiClient from '@/api/client';

import WordPressFormLayout from '@/components/admin/WordPressFormLayout';
import PublishSidebar from '@/components/admin/PublishSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/Spinner';

const APPLICATION_CATEGORIES = [
  'General',
  'Services',
  'IT Services',
  'HR',
  'Finance',
  'Academic',
  'Management',
];

/**
 * Application Edit/Add Form
 * نموذج تحرير/إضافة التطبيق
 */
const ApplicationForm = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [status, setStatus] = useState<'draft' | 'published'>('published');

  // Fetch existing application if editing - جلب التطبيق الموجود إذا كان تحريرًا
  const { data: existingApp, isLoading: isFetching } = useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      if (isNew) return null;
      const response = await apiClient.get(`/applications/${id}`);
      return response.data;
    },
    enabled: !isNew,
  });

  const createMutation = useCreateData<ApplicationFormData>('applications');
  const updateMutation = useUpdateData<ApplicationFormData & { id: number }>('applications');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: '',
      href: '',
      image: '',
      category: '',
    },
  });

  // Populate form with existing data - ملء النموذج بالبيانات الموجودة
  useEffect(() => {
    if (existingApp) {
      reset(existingApp);
    }
  }, [existingApp, reset]);

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      if (isNew) {
        await createMutation.mutateAsync(data);
        toast.success(t('admin.forms.createSuccess', { module: t('admin.dashboard.modules.applications') }));
      } else {
        await updateMutation.mutateAsync({ ...data, id: Number(id) });
        toast.success(t('admin.forms.updateSuccess', { module: t('admin.dashboard.modules.applications') }));
      }
      navigate('/admin/applications');
    } catch (err) {
      toast.error(t('admin.forms.saveError', { module: t('admin.dashboard.modules.applications') }));
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('common.confirmDelete', { item: t('admin.dashboard.modules.applications').toLowerCase() }))) {
      try {
        await apiClient.delete(`/applications/${id}`);
        toast.success(t('admin.forms.deleteSuccess', { module: t('admin.dashboard.modules.applications') }));
        navigate('/admin/applications');
      } catch (err) {
        toast.error(t('admin.forms.deleteError', { module: t('admin.dashboard.modules.applications') }));
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
        title={isNew ? t('admin.forms.addNew', { module: t('admin.dashboard.modules.applications') }) : t('admin.forms.edit', { module: t('admin.dashboard.modules.applications') })}
        backLink="/admin/applications"
        backLabel={t('admin.forms.backTo', { module: t('admin.dashboard.modules.applications') })}
        mainContent={
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            {/* Name Field - حقل الاسم */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 dark:text-white">{t('admin.forms.applications.name')}</Label>
              <Input
                id="name"
                placeholder={t('admin.forms.applications.namePlaceholder')}
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* URL Field - حقل الرابط */}
            <div className="space-y-2">
              <Label htmlFor="href" className="text-gray-900 dark:text-white">{t('admin.forms.applications.url')}</Label>
              <Input
                id="href"
                placeholder={t('admin.forms.applications.urlPlaceholder')}
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                {...register('href')}
              />
              {errors.href && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.href.message}</p>
              )}
            </div>

            {/* Image Field - حقل الصورة */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-gray-900 dark:text-white">{t('admin.forms.applications.image')}</Label>
              <Input
                id="image"
                placeholder={t('admin.forms.applications.imagePlaceholder')}
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                {...register('image')}
              />
              {errors.image && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.image.message}</p>
              )}
            </div>

            {/* Category Field - حقل الفئة */}
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white">{t('admin.forms.applications.category')}</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder={t('admin.forms.applications.categoryPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                      {APPLICATION_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.category.message}</p>
              )}
            </div>
          </div>
        }
        sidebar={
          <PublishSidebar
            status={status}
            onStatusChange={setStatus}
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

export default ApplicationForm;
