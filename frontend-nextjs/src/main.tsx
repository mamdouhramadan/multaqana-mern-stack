import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./providers/AuthProvider";
import { SettingsProvider } from "./providers/SettingsProvider";

import "./i18n/config"; // Initialize i18n
import "./index.css"; // includes Tailwind + global.css variables
import App from "./App.tsx";
import "@dubai-design-system/components-js/dist/dda/dda.css";
import "./assets/css/site.css";

/**
 * React Query Client Configuration
 * إعداد عميل React Query
 *
 * - staleTime: How long data is considered fresh (5 minutes)
 *              مدة اعتبار البيانات حديثة (5 دقائق)
 *
 * - gcTime: How long unused cache is kept (10 minutes)
 *           مدة الاحتفاظ بالذاكرة المؤقتة غير المستخدمة (10 دقائق)
 *
 * - retry: Number of retry attempts on failure
 *          عدد محاولات إعادة المحاولة عند الفشل
 *
 * - refetchOnWindowFocus: Refetch when window regains focus
 *                         إعادة الجلب عند العودة للنافذة
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 دقائق - 5 minutes
      gcTime: 1000 * 60 * 10, // 10 دقائق - 10 minutes (formerly cacheTime)
      retry: 1, // محاولة واحدة إضافية - 1 retry attempt
      refetchOnWindowFocus: false, // لا تعيد الجلب عند التركيز - don't refetch on focus
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* 
      مزود React Query - React Query Provider
      يوفر إمكانية الوصول إلى عميل الاستعلام في جميع أنحاء التطبيق
      Provides access to the query client throughout the app
    */}
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <App />
        
        </SettingsProvider>
      </AuthProvider>
      {/* 
        أدوات التطوير - React Query DevTools
        تظهر فقط في وضع التطوير - Only visible in development mode
        انقر على الأيقونة في الزاوية السفلية - Click the icon in the bottom corner
      */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
);
