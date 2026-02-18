import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layout/MainLayout";
import AdminLayout from "@/layout/AdminLayout";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { GuestOnlyRoute } from "@/components/auth/GuestOnlyRoute";
import Home from "@/pages/website/Home";
import NotFound from "@/pages/website/NotFound";
import ServerError from "@/pages/website/ServerError";
import LoginPage from "@/pages/auth/LoginPage";
import { RegisterRouteGuard } from "@/components/auth/RegisterRouteGuard";
import { Spinner } from '@/components/ui/Spinner';

// Lazy-loaded website pages (heavier)
const SearchPage = lazy(() => import("@/pages/website/SearchPage"));
const MagazineGrid = lazy(() => import("@/pages/website/MagazineGrid"));
const VideoGallery = lazy(() => import("@/pages/website/VideoGallery"));
const MasonryPhotoGallery = lazy(() => import("@/pages/website/MasonryPhotoGallery"));
const EmployeeList = lazy(() => import("@/pages/website/EmployeeList"));
const FaqPage = lazy(() => import("@/pages/website/FaqPage"));
const FilesPage = lazy(() => import("@/pages/website/FilesPage"));
const ApplicationsPage = lazy(() => import("@/pages/website/ApplicationsPage"));
const AttendancePage = lazy(() => import("@/pages/website/AttendancePage"));

// Lazy-loaded admin pages
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const Profile = lazy(() => import("../pages/admin/Profile"));
const ApplicationsList = lazy(() => import("../pages/admin/applications/index"));
const ApplicationForm = lazy(() => import("../pages/admin/applications/[id]"));
const EmployeesList = lazy(() => import("../pages/admin/employees/index"));
const EmployeeForm = lazy(() => import("../pages/admin/employees/[id]"));
const VideosList = lazy(() => import("../pages/admin/videos/index"));
const VideoForm = lazy(() => import("../pages/admin/videos/[id]"));
const PhotosList = lazy(() => import("../pages/admin/photos/index"));
const PhotoForm = lazy(() => import("../pages/admin/photos/[id]"));
const MagazinesList = lazy(() => import("../pages/admin/magazines/index"));
const MagazineForm = lazy(() => import("../pages/admin/magazines/[id]"));
const EventsList = lazy(() => import("../pages/admin/events/index"));
const EventForm = lazy(() => import("../pages/admin/events/[id]"));
const FAQsList = lazy(() => import("../pages/admin/faqs/index"));
const FAQForm = lazy(() => import("../pages/admin/faqs/[id]"));
const FilesList = lazy(() => import("../pages/admin/files/index"));
const FileForm = lazy(() => import("../pages/admin/files/[id]"));
const NewsList = lazy(() => import("../pages/admin/news/index"));
const NewsForm = lazy(() => import("../pages/admin/news/[id]"));
const RolesList = lazy(() => import("../pages/admin/roles/index"));
const RoleForm = lazy(() => import("../pages/admin/roles/[id]"));
const UsersList = lazy(() => import("../pages/admin/users/index"));
const UserForm = lazy(() => import("../pages/admin/users/[id]"));
const AdminSettingsPage = lazy(() => import("../pages/admin/settings/index"));
const MessagesLayout = lazy(() =>
  import("../components/chat/MessagesLayout").then((m) => ({ default: m.MessagesLayout }))
);
const MessagesEmptyState = lazy(() =>
  import("../components/chat/MessagesEmptyState").then((m) => ({ default: m.MessagesEmptyState }))
);
const ConversationView = lazy(() =>
  import("../components/chat/ConversationView").then((m) => ({ default: m.ConversationView }))
);

const PageFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <Spinner size="md" />
  </div>
);

const withSuspense = (Node: React.ReactNode) => (
  <Suspense fallback={<PageFallback />}>{Node}</Suspense>
);

const router = createBrowserRouter([
  // Public Routes - المسارات العامة
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <MainLayout />
      </ErrorBoundary>
    ),
    errorElement: <ServerError />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: {
          title: "Home Page",
        },
      },
      {
        path: "search",
        element: withSuspense(<SearchPage />),
        handle: { title: "Search" },
      },
      {
        path: "magazines",
        element: withSuspense(<MagazineGrid />),
        handle: { title: "Magazines" },
      },
      {
        path: "videos",
        element: withSuspense(<VideoGallery />),
        handle: { title: "Videos" },
      },
      {
        path: "photos",
        element: withSuspense(<MasonryPhotoGallery />),
        handle: { title: "Photo Gallery" },
      },
      {
        path: "employees",
        element: withSuspense(<EmployeeList />),
        handle: { title: "Employees" },
      },
      {
        path: "faqs",
        element: withSuspense(<FaqPage />),
        handle: { title: "Frequently Asked Questions" },
      },
      {
        path: "files",
        element: withSuspense(<FilesPage />),
        handle: { title: "Important Files" },
      },
      {
        path: "applications",
        element: withSuspense(<ApplicationsPage />),
        handle: { title: "Applications" },
      },
      {
        path: "attendance",
        element: withSuspense(<AttendancePage />),
        handle: { title: "My Attendance" },
      },
      // 404 Route for public layout
      {
        path: "*",
        element: <NotFound />,
        handle: { title: "Page Not Found" },
      },
    ],
  },

  // Login Route - مسار تسجيل الدخول (redirect to /admin if already authenticated)
  {
    path: "/login",
    element: (
      <GuestOnlyRoute>
        <LoginPage />
      </GuestOnlyRoute>
    ),
    handle: { title: "Admin Login" },
    errorElement: <ServerError />,
  },

  // Register Route - مسار التسجيل (404 when allow_register is false)
  {
    path: "/register",
    element: (
      <GuestOnlyRoute>
        <RegisterRouteGuard />
      </GuestOnlyRoute>
    ),
    handle: { title: "Register" },
    errorElement: <ServerError />,
  },

  // 500 Error Page generic route
  {
    path: "/500",
    element: <ServerError />,
    handle: { title: "Server Error" },
  },

  // Admin Routes - مسارات الإدارة (auth + loading handled inside AdminLayout)
  {
    path: "/admin",
    element: (
      <ErrorBoundary>
        <AdminLayout />
      </ErrorBoundary>
    ),
    errorElement: <ServerError />,
    children: [
      {
        index: true,
        element: withSuspense(<Dashboard />),
        handle: { title: "Admin Dashboard" },
      },
      {
        path: "profile",
        element: withSuspense(<Profile />),
        handle: { title: "My Profile" },
      },
      // Applications - التطبيقات
      {
        path: "applications",
        element: withSuspense(<ApplicationsList />),
        handle: { title: "Applications" },
      },
      {
        path: "applications/:id",
        element: withSuspense(<ApplicationForm />),
        handle: { title: "Edit Application" },
      },
      // Roles & Permissions
      {
        path: "roles",
        element: withSuspense(<RolesList />),
        handle: { title: "Roles & Permissions" },
      },
      {
        path: "roles/:id",
        element: withSuspense(<RoleForm />),
        handle: { title: "Edit Role" },
      },
      // Settings
      {
        path: "settings",
        element: withSuspense(<AdminSettingsPage />),
        handle: { title: "Settings" },
      },
      // Users (system users with role)
      {
        path: "users",
        element: withSuspense(<UsersList />),
        handle: { title: "Users" },
      },
      {
        path: "users/:id",
        element: withSuspense(<UserForm />),
        handle: { title: "Edit User" },
      },
      // Employees - الموظفين
      {
        path: "employees",
        element: withSuspense(<EmployeesList />),
        handle: { title: "Employees" },
      },
      {
        path: "employees/:id",
        element: withSuspense(<EmployeeForm />),
        handle: { title: "Edit Employee" },
      },
      // Videos - الفيديوهات
      {
        path: "videos",
        element: withSuspense(<VideosList />),
        handle: { title: "Videos" },
      },
      {
        path: "videos/:id",
        element: withSuspense(<VideoForm />),
        handle: { title: "Edit Video" },
      },
      // Photos - الصور
      {
        path: "photos",
        element: withSuspense(<PhotosList />),
        handle: { title: "Photos" },
      },
      {
        path: "photos/:id",
        element: withSuspense(<PhotoForm />),
        handle: { title: "Edit Photo" },
      },
      // Magazines - المجلات
      {
        path: "magazines",
        element: withSuspense(<MagazinesList />),
        handle: { title: "Magazines" },
      },
      {
        path: "magazines/:id",
        element: withSuspense(<MagazineForm />),
        handle: { title: "Edit Magazine" },
      },
      // Events - الأحداث
      {
        path: "events",
        element: withSuspense(<EventsList />),
        handle: { title: "Events" },
      },
      {
        path: "events/:id",
        element: withSuspense(<EventForm />),
        handle: { title: "Edit Event" },
      },
      // FAQs - الأسئلة الشائعة
      {
        path: "faqs",
        element: withSuspense(<FAQsList />),
        handle: { title: "FAQs" },
      },
      {
        path: "faqs/:id",
        element: withSuspense(<FAQForm />),
        handle: { title: "Edit FAQ" },
      },
      // Files - الملفات
      {
        path: "files",
        element: withSuspense(<FilesList />),
        handle: { title: "Files" },
      },
      {
        path: "files/:id",
        element: withSuspense(<FileForm />),
        handle: { title: "Edit File" },
      },
      // News - الأخبار
      {
        path: "news",
        element: withSuspense(<NewsList />),
        handle: { title: "News" },
      },
      {
        path: "news/:id",
        element: withSuspense(<NewsForm />),
        handle: { title: "Edit News" },
      },
      // Messages - two-column layout: sidebar + chat
      {
        path: "messages",
        element: withSuspense(<MessagesLayout />),
        handle: { title: "Messages" },
        children: [
          {
            index: true,
            element: withSuspense(<MessagesEmptyState />),
            handle: { title: "Messages" },
          },
          {
            path: ":conversationId",
            element: withSuspense(<ConversationView />),
            handle: { title: "Chat" },
          },
        ],
      },
      // Admin 404 Catch-all
      {
        path: "*",
        element: <NotFound />,
        handle: { title: "Page Not Found" },
      },
    ],
  },
]);

export default router;
