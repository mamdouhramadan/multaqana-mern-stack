/**
 * Conversation view: chat header + ChatWindow.
 * Used inside MessagesLayout when a conversation is selected.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { List } from '@phosphor-icons/react';
import chatService from '@/api/chatService';
import { useAuth } from '@/providers/AuthProvider';
import { ChatWindow } from './ChatWindow';
import type { Conversation } from '@/types/chat';

export const ConversationView = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || '';
  const [otherUser, setOtherUser] = useState<{ username: string; image?: string; online?: boolean } | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    const load = async () => {
      try {
        const [convRes, usersRes] = await Promise.all([
          chatService.getConversations(1, 100),
          chatService.getChatUsers(),
        ]);
        const conv = convRes.data?.conversations?.find((c: Conversation) => c._id === conversationId);
        if (conv?.participants?.length) {
          const other = conv.participants.find((p: { _id: string }) => p._id !== currentUserId) || conv.participants[0];
          const chatUser = usersRes.data?.users?.find((u: { _id: string }) => u._id === other._id);
          setOtherUser({
            username: other.username,
            image: other.image,
            online: chatUser?.online ?? (other as { active?: boolean }).active,
          });
        }
      } catch (err) {
        console.error('Failed to load conversation', err);
      }
    };
    load();
  }, [conversationId, currentUserId]);

  if (!conversationId) {
    return null;
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Chat header: back (mobile), avatar, name, online */}
      <div className="flex items-center justify-between shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/admin/messages')}
            className="lg:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            aria-label="Back to messages"
          >
            <List size={22} weight="bold" />
          </button>
          <div className="relative shrink-0">
            {otherUser?.image ? (
              <img
                src={otherUser.image}
                alt={otherUser.username}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-600 ">
                  {otherUser?.username?.substring(0, 2).toUpperCase() || '?'}
                </span>
              </div>
            )}
            {otherUser?.online && (
              <span
                className="absolute bottom-0 end-0 block h-2 w-2 rounded-full border-2 border-white  bg-green-500"
                title="Online"
              />
            )}
          </div>
          <div className="min-w-0">
            <h5 className="text-base font-semibold text-gray-900 truncate">
              {otherUser?.username || 'Loading...'}
            </h5>
            <p className="text-sm text-gray-500 ">
              {otherUser?.online ? 'online' : 'offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages + input */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatWindow
          conversationId={conversationId}
          currentUserId={currentUserId}
          currentUserName={user?.username}
          otherUserName={otherUser?.username}
          hideHeader
        />
      </div>
    </div>
  );
};
