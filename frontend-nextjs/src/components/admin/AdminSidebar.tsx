import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import {
  House,
  Stack,
  Users,
  VideoCamera,
  Image,
  BookOpen,
  CalendarBlank,
  Question,
  FolderOpen,
  Newspaper,
  SignOut,
  CaretLeft,
  CaretRight,
  Shield,
  Gear,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/utils';

interface SidebarItem {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  href: string;
}

interface SidebarGroup {
  titleKey?: string;
  items: SidebarItem[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    items: [{ id: 'dashboard', labelKey: 'admin.sidebar.dashboard', icon: House, href: '/admin' }],
  },
  {
    titleKey: 'admin.dashboard.sidebar.groups.content',
    items: [
      { id: 'applications', labelKey: 'admin.sidebar.applications', icon: Stack, href: '/admin/applications' },
      { id: 'videos', labelKey: 'admin.sidebar.videos', icon: VideoCamera, href: '/admin/videos' },
      { id: 'photos', labelKey: 'admin.sidebar.photos', icon: Image, href: '/admin/photos' },
      { id: 'magazines', labelKey: 'admin.sidebar.magazines', icon: BookOpen, href: '/admin/magazines' },
      { id: 'news', labelKey: 'admin.sidebar.news', icon: Newspaper, href: '/admin/news' },
      { id: 'events', labelKey: 'admin.sidebar.events', icon: CalendarBlank, href: '/admin/events' },
      { id: 'faqs', labelKey: 'admin.sidebar.faqs', icon: Question, href: '/admin/faqs' },
      { id: 'files', labelKey: 'admin.sidebar.files', icon: FolderOpen, href: '/admin/files' },
    ],
  },
  {
    titleKey: 'admin.dashboard.sidebar.groups.users',
    items: [
      { id: 'users', labelKey: 'admin.sidebar.users', icon: Users, href: '/admin/users' },
      { id: 'employees', labelKey: 'admin.sidebar.employees', icon: Users, href: '/admin/employees' },
    ],
  },
  {
    titleKey: 'admin.dashboard.sidebar.groups.system',
    items: [
      { id: 'roles', labelKey: 'admin.sidebar.roles', icon: Shield, href: '/admin/roles' },
      { id: 'settings', labelKey: 'admin.sidebar.settings', icon: Gear, href: '/admin/settings' },
    ],
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header - رأس القائمة */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <span className="font-bold text-lg text-gray-900 dark:text-white">{t('admin.title')}</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white text-gray-600 dark:text-gray-400 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <CaretRight size={20} /> : <CaretLeft size={20} />}
        </button>
      </div>

      {/* Navigation - التنقل */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-6 px-2">
          {sidebarGroups.map((group, groupIdx) => (
            <li key={groupIdx}>
              {group.titleKey && !collapsed && (
                <p className="px-3 mb-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t(group.titleKey)}
                </p>
              )}
              <ul className={cn('space-y-1', group.titleKey && !collapsed && 'mt-1')}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.id}>
                      <Link
                        to={item.href}
                        className={cn(
                          'no-underline flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                          active
                            ? 'bg-primary-600 text-white dark:bg-primary-500 dark:text-white'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                        )}
                      >
                        <Icon size={22} weight={active ? 'fill' : 'regular'} />
                        {!collapsed && (
                          <span className="truncate">{t(item.labelKey)}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - تذييل القائمة */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-600/20 transition-all duration-200',
            collapsed && 'justify-center'
          )}
        >
          <SignOut size={22} />
          {!collapsed && <span>{t('common.logout')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
