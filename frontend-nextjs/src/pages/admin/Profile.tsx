import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { User, EnvelopeSimple, Briefcase, FloppyDisk } from '@phosphor-icons/react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ui/image-upload';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';

// Profile schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  role: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Administrator',
      bio: '',
      avatar: '',
    },
  });

  // Initialize form from auth user (no localStorage)
  useEffect(() => {
    if (user) {
      setValue('name', user.username);
      setValue('role', 'Administrator');
    }
  }, [user, setValue]);

  const handleImageChange = (val: string) => {
    setAvatar(val);
    setValue('avatar', val, { shouldDirty: true });
  };

  const onSubmit = async (_data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // TODO: Replace with profile API when available; use _data in API payload
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(t('admin.profile.messages.updateSuccess'));
    } catch (error) {
      console.error(error);
      toast.error(t('admin.profile.messages.updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.profile.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('admin.profile.description')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center text-center">
            <div className="w-full mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left w-full">
                {t('admin.profile.profilePicture')}
              </label>
              <ImageUpload
                value={avatar}
                onChange={handleImageChange}
                className="w-full aspect-square md:h-48 h-64 mx-auto"
              />
            </div>

            <div className="w-full">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {avatar ? t('admin.profile.looksGood') : t('admin.profile.uploadPhoto')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('admin.profile.recommendedSize')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Form Details */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <User size={20} className="text-primary-600 dark:text-primary-400" />
              {t('admin.profile.personalDetails')}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900 dark:text-white">{t('admin.profile.fields.name')}</Label>
                  <Input
                    id="name"
                    placeholder={t('admin.profile.fields.namePlaceholder')}
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 dark:text-red-400">{t('admin.profile.validation.nameRequired')}</p>
                  )}
                </div>

                {/* Role (Read-onlyish or editable, we'll make it editable for now) */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-900 dark:text-white">{t('admin.profile.fields.role')}</Label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="role"
                      className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      {...register('role')}
                      readOnly // Let's keep role read-only for admin usually
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-white">{t('admin.profile.fields.email')}</Label>
                <div className="relative">
                  <EnvelopeSimple size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder={t('admin.profile.fields.emailPlaceholder')}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 dark:text-red-400">{t('admin.profile.validation.emailInvalid')}</p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-900 dark:text-white">{t('admin.profile.fields.bio')}</Label>
                <Textarea
                  id="bio"
                  placeholder={t('admin.profile.fields.bioPlaceholder')}
                  className="min-h-[120px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  {...register('bio')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {t('admin.profile.fields.maxCharacters')}
                </p>
                {errors.bio && (
                  <p className="text-sm text-red-500 dark:text-red-400">{t('admin.profile.validation.bioTooLong')}</p>
                )}
              </div>

              {/* Submit Action */}
              <div className="pt-4 flex justify-end mobile:flex-col-reverse gap-4 border-t border-gray-200 dark:border-gray-700 p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" className="border-white dark:border-gray-700 border-t-transparent" />
                      {t('common.saving')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FloppyDisk size={18} />
                      {t('common.save')}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
