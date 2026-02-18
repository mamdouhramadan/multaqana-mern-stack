import { Link } from 'react-router-dom';
import {
  Stack,
  Users,
  VideoCamera,
  Image,
  BookOpen,
  CalendarBlank,
  Question,
  FolderOpen,
  Newspaper,
  ArrowRight,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/AuthProvider';
import { useGetData } from '@/hooks/useGetData';
import type {
  Application,
  Employee,
  Video,
  Photo,
  Magazine,
  CalendarEvent,
  FAQ,
  FileItem,
  News,
} from '@/types/admin';

interface ModuleCard {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

const modules: ModuleCard[] = [
  { id: 'applications', labelKey: 'admin.dashboard.modules.applications', icon: Stack, href: '/admin/applications', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'employees', labelKey: 'admin.dashboard.modules.employees', icon: Users, href: '/admin/employees', color: 'text-green-600', bgColor: 'bg-green-100' },
  { id: 'videos', labelKey: 'admin.dashboard.modules.videos', icon: VideoCamera, href: '/admin/videos', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { id: 'photos', labelKey: 'admin.dashboard.modules.photos', icon: Image, href: '/admin/photos', color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { id: 'magazines', labelKey: 'admin.dashboard.modules.magazines', icon: BookOpen, href: '/admin/magazines', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { id: 'events', labelKey: 'admin.dashboard.modules.events', icon: CalendarBlank, href: '/admin/events', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { id: 'faqs', labelKey: 'admin.dashboard.modules.faqs', icon: Question, href: '/admin/faqs', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { id: 'files', labelKey: 'admin.dashboard.modules.files', icon: FolderOpen, href: '/admin/files', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { id: 'news', labelKey: 'admin.dashboard.modules.news', icon: Newspaper, href: '/admin/news', color: 'text-red-600', bgColor: 'bg-red-100' },
];

/**
 * Admin Dashboard Component
 * لوحة معلومات الإدارة
 */
const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  // Fetch counts for all modules - جلب عدد العناصر لجميع الوحدات
  const { data: applications } = useGetData<Application[]>('applications');
  const { data: employees } = useGetData<Employee[]>('employees');
  const { data: videos } = useGetData<Video[]>('videos');
  const { data: photos } = useGetData<Photo[]>('photos');
  const { data: magazines } = useGetData<Magazine[]>('magazines');
  const { data: events } = useGetData<CalendarEvent[]>('events');
  const { data: faqs } = useGetData<FAQ[]>('faqs');
  const { data: files } = useGetData<FileItem[]>('files');
  const { data: news } = useGetData<News[]>('news');

  const counts: Record<string, number> = {
    applications: applications?.length ?? 0,
    employees: employees?.length ?? 0,
    videos: videos?.length ?? 0,
    photos: photos?.length ?? 0,
    magazines: magazines?.length ?? 0,
    events: events?.length ?? 0,
    faqs: faqs?.length ?? 0,
    files: files?.length ?? 0,
    news: news?.length ?? 0,
  };

  const displayName = user?.username ?? 'Admin';

  return (
    <div className="space-y-8">
      {/* Header - الرأس */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.welcome')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('admin.dashboard.loggedInAs')} <span className="font-medium">{displayName}</span>
        </p>
      </div>

      {/* Module Cards Grid - شبكة بطاقات الوحدات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          const count = counts[module.id];

          return (
            <Link
              key={module.id}
              to={module.href}
              className="no-underline group bg-white dark:bg-gray-900 rounded-xl  hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                {/* Icon and Info - الأيقونة والمعلومات */}
                <div className="flex items-center gap-4">
                  <div className={`${module.bgColor} ${module.color} p-3 rounded-xl`}>
                    <Icon className='' size={28} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {t(module.labelKey)}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 mb-0">
                      {count}
                    </p>
                  </div>
                </div>

                {/* Arrow - السهم */}
                <ArrowRight
                  size={20}
                  className="text-gray-400 dark:text-gray-400 rtl:rotate-180 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-200"
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats - إحصائيات سريعة */}
      <div className="stats">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('admin.dashboard.quickOverview')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center px-4 py-8 bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-lg">
            <p className="text-3xl mb-0 font-bold text-primary-600 dark:text-primary-400">
              {Object.values(counts).reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-0">
              {t('admin.dashboard.totalItems')}
            </p>
          </div>
          <div className="text-center px-4 py-8 bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-lg">
            <p className="text-3xl mb-0 font-bold text-green-600 dark:text-green-400">
              {counts.employees}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-0">
              {t('admin.dashboard.modules.employees')}
            </p>
          </div>
          <div className="text-center px-4 py-8 bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-lg">
            <p className="text-3xl mb-0 font-bold text-blue-600 dark:text-blue-400">
              {counts.applications}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-0">
              {t('admin.dashboard.modules.applications')}
            </p>
          </div>
          <div className="text-center px-4 py-8 bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-lg">
            <p className="text-3xl mb-0 font-bold text-red-600 dark:text-red-400">
              {counts.news}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-0">
              {t('admin.dashboard.stats.newsArticles')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
