import { format } from 'date-fns';
import { Trash, FloppyDisk, Eye, Clock, Calendar, Tag, Image as ImageIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/ui/image-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/Spinner';

interface PublishSidebarProps {
  status: 'draft' | 'published';
  onStatusChange: (status: 'draft' | 'published') => void;
  category?: string;
  categories?: Array<{ id: number | string; name: string }>;
  onCategoryChange?: (category: string) => void;
  image?: string;
  onImageChange?: (image: string) => void;
  createdAt?: string;
  updatedAt?: string;
  onSave: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  isNew?: boolean;
}

/**
 * Publish Sidebar Component
 * شريط النشر الجانبي (مثل ووردبريس)
 * 
 * WordPress-style sidebar with publish actions, status, and metadata
 */
const PublishSidebar = ({
  status,
  onStatusChange,
  category,
  categories,
  onCategoryChange,
  image,
  onImageChange,
  createdAt,
  updatedAt,
  onSave,
  onDelete,
  isLoading,
  isNew,
}: PublishSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Publish Box - صندوق النشر */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Publish
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Status - الحالة */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
              <Eye size={16} className="text-gray-500 dark:text-gray-400" />
              Status
            </Label>
            <Select value={status} onValueChange={(v) => onStatusChange(v as 'draft' | 'published')}>
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                <SelectItem value="draft" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Draft</SelectItem>
                <SelectItem value="published" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates - التواريخ */}
          {!isNew && (
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Created: {format(new Date(createdAt), 'MMM d, yyyy')}</span>
                </div>
              )}
              {updatedAt && (
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>Updated: {format(new Date(updatedAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons - أزرار الإجراءات */}
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={onSave}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" className="border-white dark:border-gray-700 border-t-transparent" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FloppyDisk size={18} />
                  {isNew ? 'Create' : 'Update'}
                </span>
              )}
            </Button>

            {!isNew && onDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={onDelete}
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-600/20 dark:hover:text-red-300 border-red-200 dark:border-red-800"
              >
                <Trash size={18} className="mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Category Box - صندوق الفئة */}
      {categories && categories.length > 0 && onCategoryChange && (
        <div className="bg-white dark:bg-gray-800 rounded-xl  border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Tag size={16} />
              Category
            </h3>
          </div>

          <div className="p-4">
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name} className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Featured Image - الصورة البارزة */}
      {onImageChange && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ImageIcon size={16} />
              Featured Image
            </h3>
          </div>
          <div className="p-4">
            <ImageUpload value={image} onChange={onImageChange} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishSidebar;
