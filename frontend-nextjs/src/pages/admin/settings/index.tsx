import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ForbiddenPage, isForbiddenError } from '@/components/admin/ForbiddenPage';
import { Spinner } from '@/components/ui/Spinner';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';
function assetUrl(path: string): string {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http')) return path;
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  return base ? `${base}${path.startsWith('/') ? '' : '/'}${path}` : path;
}

interface SettingItem {
  key: string;
  value: unknown;
  category?: string;
  isPublic?: boolean;
}

function useSettingsAdmin() {
  return useQuery({
    queryKey: ['settings', 'admin'],
    queryFn: async (): Promise<Record<string, unknown>> => {
      const res = await apiClient.get<{ data?: SettingItem[] }>('/settings');
      const data = res.data?.data;
      if (!Array.isArray(data)) return {};
      return data.reduce<Record<string, unknown>>(
        (acc, { key, value }) => ({ ...acc, [key]: value }),
        {}
      );
    },
  });
}

const TIMEZONES = [
  'Asia/Dubai',
  'Asia/Riyadh',
  'Africa/Cairo',
  'Europe/London',
  'America/New_York',
  'UTC',
];

const AdminSettingsPage = () => {
  const queryClient = useQueryClient();
  const { data: settings = {}, isLoading, error } = useSettingsAdmin();
  const [siteTitle, setSiteTitle] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [allowRegister, setAllowRegister] = useState(true);
  const [timezone, setTimezone] = useState('');
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);

  useEffect(() => {
    setSiteTitle(String(settings.site_title ?? ''));
    setContactEmail(String(settings.contact_email ?? ''));
    setAllowRegister(settings.allow_register === true || settings.allow_register === 'true');
    setTimezone(String(settings.timezone ?? 'Asia/Dubai'));
  }, [settings.site_title, settings.contact_email, settings.allow_register, settings.timezone]);

  const upsert = useCallback(
    async (key: string, value: unknown, category: string, isPublic: boolean) => {
      await apiClient.post('/settings', { key, value, category, isPublic });
    },
    []
  );

  if (error && isForbiddenError(error)) {
    return <ForbiddenPage />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    );
  }

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await upsert('site_title', siteTitle, 'General', true);
      await upsert('contact_email', contactEmail, 'General', true);
      await upsert('allow_register', allowRegister, 'General', true);
      await upsert('timezone', timezone, 'General', true);
      queryClient.invalidateQueries({ queryKey: ['settings', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'admin'] });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const form = new FormData();
      form.append('key', 'site_logo');
      form.append('file', file);
      await apiClient.post('/settings/upload', form);
      queryClient.invalidateQueries({ queryKey: ['settings', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'admin'] });
      toast.success('Logo updated');
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconUploading(true);
    try {
      const form = new FormData();
      form.append('key', 'favicon');
      form.append('file', file);
      await apiClient.post('/settings/upload', form);
      queryClient.invalidateQueries({ queryKey: ['settings', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'admin'] });
      toast.success('Favicon updated');
    } catch {
      toast.error('Failed to upload favicon');
    } finally {
      setFaviconUploading(false);
      e.target.value = '';
    }
  };

  const siteLogo = String(settings.site_logo ?? '');
  const favicon = String(settings.favicon ?? '');

  return (
    <div className="space-y-8">
      <header className="pb-2 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Site Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage general and appearance options.</p>
      </header>

      <form onSubmit={handleSaveGeneral} className="space-y-6">
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">General</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_title" className="text-gray-900 dark:text-white font-medium">Site title</Label>
              <Input
                id="site_title"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="text-gray-900 dark:text-white font-medium">Contact email</Label>
              <Input
                id="contact_email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="allow_register"
                checked={allowRegister}
                onChange={(e) => setAllowRegister(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-primary-600 size-4"
              />
              <Label htmlFor="allow_register" className="text-gray-900 dark:text-white cursor-pointer">
                Allow registration (signup page visible)
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-gray-900 dark:text-white font-medium">Timezone</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={saving} className="rounded-lg mt-2">
              {saving ? 'Saving...' : 'Save general'}
            </Button>
          </div>
        </section>
      </form>

      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Appearance</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white font-medium">Site logo</Label>
            {siteLogo && (
              <div className="mb-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 inline-block">
                <img src={assetUrl(siteLogo)} alt="Current logo" className="h-16 object-contain" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={logoUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900/30 dark:file:text-primary-300 file:font-medium"
            />
            {logoUploading && <p className="text-sm text-amber-600 dark:text-amber-400">Uploading...</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white font-medium">Favicon</Label>
            {favicon && (
              <div className="mb-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 inline-block">
                <img src={assetUrl(favicon)} alt="Current favicon" className="h-8 w-8 object-contain" />
              </div>
            )}
            <input
              type="file"
              accept="image/*,.ico"
              onChange={handleFaviconUpload}
              disabled={faviconUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900/30 dark:file:text-primary-300 file:font-medium"
            />
            {faviconUploading && <p className="text-sm text-amber-600 dark:text-amber-400">Uploading...</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminSettingsPage;
