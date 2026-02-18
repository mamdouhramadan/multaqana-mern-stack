/**
 * Chat API Service
 * 
 * This file provides functions to interact with the chat REST API.
 * All functions use the centralized apiClient for consistent error handling and auth.
 * 
 * Why We Need This:
 * - Centralized API logic for chat operations
 * - Reusable across components
 * - Type-safe API calls
 * - Consistent error handling
 * - Easy to test and maintain
 * 
 * Without this service, each component would duplicate API logic,
 * leading to inconsistent error handling and harder maintenance.
 * 
 * Note: This handles REST API calls only. Real-time events use Socket.IO.
 */

import apiClient from './client';
import type {
  ConversationsResponse,
  MessagesResponse,
  ChatUsersResponse,
} from '@/types/chat';

/**
 * Generic API Response Type
 * 
 * All backend API responses follow this structure:
 * { success: boolean, code: number, message: string, data: any }
 */
interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}

/**
 * Chat Service Object
 * 
 * Contains all chat-related API methods.
 * Import and use like: chatService.getConversations()
 */
const chatService = {
  /**
   * Get list of users to start a chat with (includes online status).
   * Excludes current user. Used on messages page to show "Start new chat" list.
   */
  getChatUsers: async (): Promise<ChatUsersResponse> => {
    const response = await apiClient.get<ChatUsersResponse>('/chat/users');
    return response.data;
  },

  /**
   * Get User Conversations
   * 
   * Fetches a list of all conversations for the current user.
   * Each conversation includes participants, last message, and unread count.
   * 
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of conversations per page (default: 20)
   * @returns Promise with conversations list and pagination info
   * 
   * How to use:
   * ```typescript
   * const response = await chatService.getConversations(1, 20);
   * const conversations = response.data.conversations;
   * 
   * conversations.forEach(conv => {
   *   console.log(`Conversation with: ${conv.participants[0].username}`);
   *   console.log(`Unread messages: ${conv.unreadCount}`);
   * });
   * ```
   * 
   * When to call:
   * - On messages page load
   * - After sending a new message
   * - When refreshing conversation list
   * 
   * IMPORTANT: Requires authentication token in localStorage
   * (automatically added by apiClient interceptor)
   */
  getConversations: async (
    page: number = 1,
    limit: number = 20
  ): Promise<ConversationsResponse> => {
    const response = await apiClient.get<ConversationsResponse>(
      '/chat/conversations',
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  /**
   * Get Messages for a Conversation
   * 
   * Fetches message history for a specific conversation.
   * Uses cursor-based pagination for efficient loading of older messages.
   * 
   * @param conversationId - ID of the conversation
   * @param cursor - Cursor for pagination (optional, for loading older messages)
   * @param limit - Number of messages to fetch (default: 50)
   * @returns Promise with messages array and nextCursor
   * 
   * How cursor pagination works:
   * 1. First call: chatService.getMessages(convId) → Gets latest 50 messages
   * 2. Response includes nextCursor
   * 3. Second call: chatService.getMessages(convId, nextCursor) → Gets next 50 older messages
   * 4. Repeat until nextCursor is null (no more messages)
   * 
   * Why cursor instead of page numbers:
   * - More efficient for large datasets
   * - Handles new messages arriving while paginating
   * - Prevents skipping/duplicate messages
   * 
   * Usage example:
   * ```typescript
   * // Load initial messages
   * const response = await chatService.getMessages(conversationId);
   * const messages = response.data.messages;
   * const nextCursor = response.data.nextCursor;
   * 
   * // Load older messages when user scrolls up
   * if (nextCursor) {
   *   const olderMessages = await chatService.getMessages(conversationId, nextCursor);
   * }
   * ```
   * 
   * When to call:
   * - When user opens a conversation
   * - When user scrolls to top (load more history)
   * 
   * IMPORTANT: Messages are returned newest-first, so you may need to reverse
   * the array before displaying in ascending order.
   */
  getMessages: async (
    conversationId: string,
    cursor?: string,
    limit: number = 50
  ): Promise<MessagesResponse> => {
    const response = await apiClient.get<MessagesResponse>(
      `/chat/messages/${conversationId}`,
      {
        params: { cursor, limit },
      }
    );
    return response.data;
  },

  /**
   * Create or Get Conversation
   * 
   * Starts a new conversation with a user or gets existing conversation.
   * Backend checks if a 1-on-1 conversation already exists between the two users.
   * 
   * @param recipientId - MongoDB ObjectID of the user to chat with
   * @returns Promise with conversation ID
   * 
   * How it works:
   * 1. Backend checks if conversation exists between current user and recipient
   * 2. If exists → Returns existing conversation ID
   * 3. If not exists → Creates new conversation and returns ID
   * 
   * Usage example:
   * ```typescript
   * const recipientId = '507f1f77bcf86cd799439011'; // User to chat with
   * const response = await chatService.createConversation(recipientId);
   * 
   * if (response.success) {
   *   const conversationId = response.data.conversationId;
   *   // Navigate to conversation page
   *   navigate(`/admin/messages/${conversationId}`);
   * }
   * ```
   * 
   * When to call:
   * - When user clicks "Start New Chat" button
   * - When user clicks "Message" button on a user profile
   * 
   * Error cases:
   * - Invalid recipientId format → 400 Bad Request
   * - Recipient doesn't exist → Error from backend
   * - Same user (can't chat with yourself) → May be handled on backend
   * 
   * IMPORTANT: recipientId must be a valid MongoDB ObjectID
   * (24 character hexadecimal string)
   */
  createConversation: async (
    recipientId: string
  ): Promise<ApiResponse<{ conversationId: string }>> => {
    const response = await apiClient.post<
      ApiResponse<{ conversationId: string }>
    >('/chat/conversations', {
      recipientId,
    });
    return response.data;
  },

  /**
   * Toggle Mute User
   * 
   * Mutes or unmutes a user to stop/resume receiving notifications from them.
   * This is a toggle endpoint - calling it when muted will unmute, and vice versa.
   * 
   * @param userId - ID of user to mute/unmute
   * @returns Promise with success message
   * 
   * How it works:
   * - Backend checks if user is in current user's mutedUsers array
   * - If yes → Removes from array (unmute)
   * - If no → Adds to array (mute)
   * 
   * What muting does:
   * - User still receives messages (stored in database)
   * - User does NOT receive real-time notifications for muted user's messages
   * - Muted status is checked on backend before emitting 'notification' event
   * 
   * What muting does NOT do:
   * - Does NOT hide messages from the muted user
   * - Does NOT prevent viewing conversation
   * - Does NOT block the user
   * 
   * Usage example:
   * ```typescript
   * const handleMuteClick = async () => {
   *   try {
   *     const response = await chatService.toggleMuteUser(otherUserId);
   *     toast.success(response.message); // "User muted" or "User unmuted"
   *     setIsMuted(prev => !prev); // Update button state
   *   } catch (error) {
   *     toast.error('Failed to toggle mute');
   *   }
   * };
   * ```
   * 
   * When to call:
   * - When user clicks "Mute" button in conversation header
   * - When user clicks "Unmute" to resume notifications
   * 
   * UI considerations:
   * - Button should show current state ("Mute" vs "Unmute")
   * - Provide visual feedback after toggle
   * - Consider showing muted status in conversation list
   */
  toggleMuteUser: async (
    userId: string
  ): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(
      `/chat/mute/${userId}`
    );
    return response.data;
  },
};

/**
 * Export Default
 * 
 * Export the chatService object so it can be imported in components:
 * 
 * import chatService from '@/api/chatService';
 * 
 * Then use:
 * chatService.getConversations()
 * chatService.getMessages(id)
 * etc.
 */
export default chatService;

/**
 * Complete Usage Example in a Component:
 * 
 * ```typescript
 * import { useEffect, useState } from 'react';
 * import chatService from '@/api/chatService';
 * import type { Conversation } from '@/types/chat';
 * 
 * function ConversationsList() {
 *   const [conversations, setConversations] = useState<Conversation[]>([]);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState<string | null>(null);
 * 
 *   useEffect(() => {
 *     const loadConversations = async () => {
 *       try {
 *         setLoading(true);
 *         const response = await chatService.getConversations(1, 20);
 *         
 *         if (response.success) {
 *           setConversations(response.data.conversations);
 *         } else {
 *           setError(response.message);
 *         }
 *       } catch (err) {
 *         setError('Failed to load conversations');
 *       } finally {
 *         setLoading(false);
 *       }
 *     };
 * 
 *     loadConversations();
 *   }, []);
 * 
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 * 
 *   return (
 *     <div>
 *       {conversations.map(conv => (
 *         <div key={conv._id}>
 *           {conv.participants[0].username}
 *           {conv.unreadCount > 0 && (
 *             <span className="badge">{conv.unreadCount}</span>
 *           )}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
