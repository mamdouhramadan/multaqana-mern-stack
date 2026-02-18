/**
 * UserList Component
 *
 * Shows a list of users that the current user can start a chat with.
 * Displays online/offline status. Clicking a user creates (or opens) a conversation
 * and navigates to the chat.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle } from '@phosphor-icons/react';
import chatService from '@/api/chatService';
import type { ChatUser } from '@/types/chat';
import toast from 'react-hot-toast';

export const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingWithId, setStartingWithId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await chatService.getChatUsers();
        if (response.success && response.data?.users) {
          setUsers(response.data.users);
        } else {
          setError('Failed to load users');
        }
      } catch (err) {
        console.error('Error fetching chat users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleStartChat = async (user: ChatUser) => {
    if (startingWithId) return;
    setStartingWithId(user._id);
    try {
      const response = await chatService.createConversation(user._id);
      const conversationId = response.data?.conversationId;
      if (conversationId) {
        navigate(`/admin/messages/${conversationId}`, { replace: true });
      } else {
        toast.error('Could not start conversation');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to start conversation');
    } finally {
      setStartingWithId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-gray-500">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-red-500">{error}</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <UserCircle size={48} className="mb-2" />
        <p className="text-sm">No other users to chat with</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {users.map((user) => (
        <button
          key={user._id}
          type="button"
          onClick={() => handleStartChat(user)}
          disabled={!!startingWithId}
          className="flex w-full items-center gap-4 p-4 text-left hover:bg-gray-50 disabled:opacity-60 transition-colors"
        >
          <div className="relative shrink-0">
            {user.image ? (
              <img
                src={user.image}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                  {user.username.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                user.online ? 'bg-green-500' : 'bg-gray-400'
              }`}
              title={user.online ? 'Online' : 'Offline'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {user.username}
            </p>
            <p className="text-xs text-gray-500">
              {user.online ? 'Online' : 'Offline'}
            </p>
          </div>
          {startingWithId === user._id && (
            <span className="text-sm text-gray-500">Starting...</span>
          )}
        </button>
      ))}
    </div>
  );
};
