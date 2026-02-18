/**
 * Conversations List Component
 * 
 * Displays a list of all user's chat conversations.
 * Each conversation shows participant info, last message preview, and unread badge.
 * 
 * Features:
 * - Fetches conversations from REST API on mount
 * - Displays participant avatar and name
 * - Shows last message preview
 * - Unread message badge
 * - Click to navigate to conversation detail
 * - Real-time updates when new messages arrive
 * - Empty state when no conversations exist
 * - Loading state while fetching
 * 
 * How to use this component:
 * 1. Import and render in messages index page
 * 2. Component fetches data automatically on mount
 * 3. Listens to Socket.IO for real-time updates
 * 4. Clicking a conversation navigates using React Router
 * 5. No props required - fully self-contained
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatCircleDots } from '@phosphor-icons/react';
import { useAuth } from '@/providers/AuthProvider';
import chatService from '@/api/chatService';
import { useSocket } from '@/hooks/useSocket';
import type { Conversation } from '@/types/chat';

export const ConversationsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Component state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Socket.IO connection for real-time updates
  const { socket, isConnected } = useSocket();

  /**
   * Fetch Conversations
   * 
   * Loads user's conversations from API.
   * Called on mount and when socket reconnects.
   * 
   * Why refetch on reconnect:
   * - User might have received messages while disconnected
   * - Ensures data is fresh after connection loss
   */
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await chatService.getConversations(1, 50);

        if (response.success) {
          setConversations(response.data.conversations);
        } else {
          setError(response.message || 'Failed to load conversations');
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [isConnected]);

  /**
   * Real-time Message Updates
   * 
   * Listens for new messages via Socket.IO and updates conversation list.
   * When a message arrives, refreshes the entire list to get updated order and unread counts.
   * 
   * More efficient approach (future enhancement):
   * - Update specific conversation in state
   * - Move it to top of list
   * - Increment unread count
   * This avoids full API refetch but requires more complex state management.
   */
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async () => {
      // Refetch conversations to get updated state
      try {
        const response = await chatService.getConversations(1, 50);
        if (response.success) {
          setConversations(response.data.conversations);
        }
      } catch (err) {
        console.error('Error updating conversations:', err);
      }
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket]);

  /**
   * Handle Conversation Click
   * 
   * Navigates to conversation detail page.
   * 
   * @param conversationId - ID of conversation to open
   */
  const handleConversationClick = (conversationId: string) => {
    navigate(`/admin/messages/${conversationId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <ChatCircleDots size={64} className="mb-4" />
        <p className="text-lg font-medium">No conversations yet</p>
        <p className="text-sm">Start a new chat to begin messaging</p>
      </div>
    );
  }

  // Conversations list
  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        // Get other participant (for 1-on-1 chats)
        const otherUser = conversation.participants.find(
          (p) => p._id !== user?.id
        ) || conversation.participants[0];

        return (
          <div
            key={conversation._id}
            onClick={() => handleConversationClick(conversation._id)}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {otherUser.image ? (
                <img
                  src={otherUser.image}
                  alt={otherUser.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-lg font-semibold">
                  {otherUser.username.substring(0, 2).toUpperCase()}
                </div>
              )}
              {otherUser.active && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            {/* Conversation Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {conversation.isGroup ? conversation.groupName : otherUser.username}
                </h3>
                {conversation.lastMessageAt && (
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(conversation.lastMessageAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {conversation.lastMessage
                  ? (conversation.lastMessage as any).content || 'Attachment'
                  : 'No messages yet'}
              </p>
            </div>

            {/* Unread Badge */}
            {(conversation.unreadCount ?? 0) > 0 ? (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-primary-600 text-white text-xs font-bold rounded-full">
                  {(conversation.unreadCount ?? 0) > 99 ? '99+' : conversation.unreadCount}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
