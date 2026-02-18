/**
 * Messages Layout
 *
 * Two-column layout: left sidebar (user list + conversations), right content (outlet).
 * Matches the reference: flex container, fixed-width left, growing right.
 */

import { Outlet } from 'react-router-dom';
import { MessagesSidebar } from './MessagesSidebar';

export const MessagesLayout = () => {
  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[400px] bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Left: sidebar - hidden on small screens, show from lg */}
      <aside className="max-w-[300px] sm:max-w-[350px] w-full h-full shrink-0 hidden lg:block overflow-hidden">
        <MessagesSidebar />
      </aside>

      {/* Right: chat area or empty state */}
      <main className="grow w-[70%] flex flex-col h-full min-w-0 bg-gray-50 dark:bg-gray-800/50">
        <Outlet />
      </main>
    </div>
  );
};
