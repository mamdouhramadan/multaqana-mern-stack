/**
 * Shown in the right panel when no conversation is selected.
 * On mobile (lg:hidden), we show the sidebar list instead so users can select a chat.
 */

import { ChatCircleDots } from '@phosphor-icons/react';
import { MessagesSidebar } from './MessagesSidebar';

export const MessagesEmptyState = () => {
  return (
    <>
      {/* Mobile: show list full width */}
      <div className="flex-1 overflow-hidden lg:hidden block h-full">
        <MessagesSidebar />
      </div>
      {/* Desktop: show empty state */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-gray-200 p-6 mb-4">
          <ChatCircleDots size={64} className="text-gray-400" weight="duotone" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Select a conversation
        </h2>
        <p className="text-gray-500  max-w-sm">
          Choose a user from the list to start chatting, or open an existing conversation.
        </p>
      </div>
    </>
  );
};
