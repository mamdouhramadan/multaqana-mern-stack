import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { employeeSchema, type EmployeeFormData } from '@/schemas/employee';
import { useCreateData, useUpdateData } from '@/hooks/useMutateData';
import apiClient from '@/api/client';

import WordPressFormLayout from '@/components/admin/WordPressFormLayout';
import PublishSidebar from '@/components/admin/PublishSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/Spinner';

const DEPARTMENTS = ['HR', 'IT', 'Policy', 'Projects', 'Strategy', 'Partnerships', 'Management'];
const STATUSES = ['Online', 'Offline', 'Busy', 'In Meeting'] as const;

const EmployeeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  const { data: existing, isLoading: isFetching } = useQuery({
    queryKey: ['employees', id],
    queryFn: async () => { if (isNew) return null; const res = await apiClient.get(`/employees/${id}`); return res.data; },
    enabled: !isNew,
  });

  const createMutation = useCreateData<EmployeeFormData>('employees');
  const updateMutation = useUpdateData<EmployeeFormData & { id: number }>('employees');

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: '', image: '', jobTitle: '', department: '', status: 'Online', alt: '' },
  });

  const image = watch('image');

  useEffect(() => { if (existing) reset(existing); }, [existing, reset]);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (isNew) { await createMutation.mutateAsync({ ...data, alt: data.name }); toast.success('Employee created'); }
      else { await updateMutation.mutateAsync({ ...data, id: Number(id), alt: data.name }); toast.success('Employee updated'); }
      navigate('/admin/employees');
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this employee?')) {
      try { await apiClient.delete(`/employees/${id}`); toast.success('Deleted'); navigate('/admin/employees'); }
      catch { toast.error('Failed to delete'); }
    }
  };

  if (isFetching) return <div className="flex items-center justify-center h-64"><Spinner size="md" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WordPressFormLayout
        title={isNew ? 'Add New Employee' : 'Edit Employee'}
        backLink="/admin/employees"
        backLabel="Back to Employees"
        mainContent={
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Name</Label><Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('name')} />{errors.name && <p className="text-sm text-red-500 dark:text-red-400">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label className="text-gray-900 dark:text-white">Job Title</Label><Input className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" {...register('jobTitle')} />{errors.jobTitle && <p className="text-sm text-red-500 dark:text-red-400">{errors.jobTitle.message}</p>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">Department</Label>
                <Controller name="department" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">{DEPARTMENTS.map((d) => <SelectItem key={d} value={d} className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">{d}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.department && <p className="text-sm text-red-500 dark:text-red-400">{errors.department.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">Status</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">{STATUSES.map((s) => <SelectItem key={s} value={s} className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">{s}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
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
            isLoading={createMutation.isPending || updateMutation.isPending}
            isNew={isNew}
            image={image}
            onImageChange={(val) => setValue('image', val, { shouldDirty: true })}
          />
        }
      />
    </form>
  );
};

export default EmployeeForm;
