/**
 * Admin Module Types
 * أنواع البيانات لوحدة الإدارة
 */

// Application type - نوع التطبيق
export interface Application {
  id: number;
  name: string;
  href: string;
  image: string;
  category: string;
}

// Employee type - نوع الموظف
export interface Employee {
  id: number;
  image: string;
  name: string;
  jobTitle: string;
  alt: string;
  department: string;
  status: 'Online' | 'Offline' | 'Busy' | 'In Meeting';
}

// Video type - نوع الفيديو
export interface Video {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  videoUrl: string;
}

// Photo type - نوع الصورة
export interface Photo {
  id: number;
  src: string;
  alt: string;
  height: string;
}

// Magazine type - نوع المجلة
export interface Magazine {
  id: number;
  title: string;
  cover: string;
  date: string;
  category: string;
}

// Event type - نوع الحدث
export interface CalendarEvent {
  id: number | string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  resource: string;
  cover_image?: string;
  details?: string;
}

// FAQ type - نوع الأسئلة الشائعة
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// FAQ Category type - نوع فئة الأسئلة
export interface FAQCategory {
  id: number;
  name: string;
}

// File type - نوع الملف
export interface FileItem {
  id: string;
  name: string;
  size: string;
  date: string;
  category: string;
  iconType: string;
  color: string;
}

// File Category type - نوع فئة الملفات
export interface FileCategory {
  id: number;
  name: string;
}

// News type - نوع الأخبار
export interface News {
  id: number;
  image: string;
  title: string;
  description: string;
  date: string;
  url: string;
}

// Generic entity for forms - كيان عام للنماذج
export interface BaseEntity {
  id?: number | string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'draft' | 'published';
}

// Admin sidebar menu item - عنصر قائمة الشريط الجانبي
export interface AdminMenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  count?: number;
}

// Module names for API endpoints - أسماء الوحدات
export type ModuleName =
  | 'applications'
  | 'employees'
  | 'videos'
  | 'photos'
  | 'magazines'
  | 'events'
  | 'faqs'
  | 'faqCategories'
  | 'files'
  | 'fileCategories'
  | 'news';
