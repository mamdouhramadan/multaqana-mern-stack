import { Outlet } from 'react-router-dom';
// import { useThemeStore } from '@/store/useThemeStore';
import Header from '@/components/layout/header/index';
// import Sidebar from '@/components/layout/Sidebar';
// import Footer from '@/components/layout/Footer';
import StickyFooter from '@/components/layout/StickyFooter';

// const SIDEBAR_WIDTH_COLLAPSED = 72;
// const SIDEBAR_WIDTH_EXPANDED = 250;

const MainLayout = () => {
  // const expanded = useThemeStore((s) => s.sidebarExpanded);
  // const sidebarWidth = expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 gap-4 pb-20">
      {/* <Sidebar width={sidebarWidth} /> */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        {/* <Footer /> */}
        <StickyFooter />
      </div>
    </div>
  );
};

export default MainLayout;
