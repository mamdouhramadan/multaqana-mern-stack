/**
 * Messages Index Page
 *
 * Accessible at /admin/messages
 *
 * Features:
 * - List of users to start a chat with (online/offline status)
 * - List of existing conversations
 * - Click user to start or open conversation; click conversation to open
 */

import { ConversationsList } from '@/components/chat/ConversationsList';
import { UserList } from '@/components/chat/UserList';

const MessagesPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Start a new chat or open a conversation
          </p>
        </div>

        <div className="p-4">
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Start new chat
            </h2>
            <UserList />
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Your conversations
            </h2>
            <ConversationsList />
          </section>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
