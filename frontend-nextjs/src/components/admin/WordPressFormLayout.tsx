import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';

interface WordPressFormLayoutProps {
  title: string;
  backLink: string;
  backLabel?: string;
  mainContent: ReactNode;
  sidebar: ReactNode;
}

/**
 * WordPress-style Form Layout Component
 * تخطيط نموذج على غرار ووردبريس
 * 
 * Two-column layout with main content area and sidebar
 * تخطيط من عمودين مع منطقة المحتوى الرئيسي والشريط الجانبي
 */
const WordPressFormLayout = ({
  title,
  backLink,
  backLabel = 'Back to list',
  mainContent,
  sidebar,
}: WordPressFormLayoutProps) => {
  return (
    <div className="space-y-6">
      {/* Header - الرأس */}
      <div className="flex items-center gap-4">
        <Link
          to={backLink}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{backLabel}</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>

      {/* Two Column Layout - تخطيط من عمودين */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Content - المحتوى الرئيسي */}
        <div className="space-y-6">{mainContent}</div>

        {/* Sidebar - الشريط الجانبي */}
        <div className="space-y-6">{sidebar}</div>
      </div>
    </div>
  );
};

export default WordPressFormLayout;
