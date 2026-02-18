/**
 * Chat System Type Definitions
 * 
 * This file contains all TypeScript type definitions for the real-time chat system.
 * These types ensure type safety across the application and match the backend MongoDB models.
 * 
 * Without these types, TypeScript won't be able to provide autocomplete and type checking
 * for chat-related data structures, leading to potential runtime errors.
 */

/**
 * User Interface
 * 
 * Represents a user in the chat system.
 * This is a subset of the full User model, containing only fields needed for chat display.
 * 
 * Usage: Used in Conversation.participants and Message.sender to display user information.
 */
export interface User {
  _id: string;           // MongoDB ObjectID as string
  username: string;      // Display name shown in chat
  image?: string;        // Avatar URL (optional)
  active?: boolean;      // Online status (optional)
}

/**
 * Message Reaction Interface
 * 
 * Represents an emoji reaction to a message (e.g., 👍, ❤️, 😂).
 * Multiple users can add different reactions to the same message.
 * 
 * Usage: Displayed below message content to show user engagement.
 */
export interface MessageReaction {
  user: string;          // User ID who added the reaction
  emoji: string;         // Emoji character (e.g., "👍")
}

/**
 * Message Interface
 * 
 * Represents a single chat message in a conversation.
 * Messages can contain text content, file attachments, or both.
 * 
 * Key fields:
 * - conversationId: Links message to a conversation
 * - sender: Who sent the message (populated with User data)
 * - content: Text content (optional if attachments exist)
 * - attachments: Array of file URLs
 * - reactions: Emoji reactions from users
 * - readBy: Array of user IDs who have read the message
 * - deleted: Soft delete flag (message still exists but marked as deleted)
 * 
 * Usage: Displayed in ChatWindow as message bubbles.
 */
export interface Message {
  _id: string;
  conversationId: string;
  sender: User | string;              // Populated User object or just ID string
  content?: string;                   // Text content (optional)
  attachments?: string[];             // Array of file URLs (optional)
  replyTo?: string;                   // ID of message being replied to (optional)
  reactions?: MessageReaction[];      // Emoji reactions (optional)
  readBy?: string[];                  // User IDs who read this message (optional)
  deleted?: boolean;                  // Soft delete flag
  createdAt: string;                  // ISO timestamp
  updatedAt: string;                  // ISO timestamp
}

/**
 * Conversation Interface
 * 
 * Represents a chat conversation between users.
 * Can be either 1-on-1 or group chat.
 * 
 * Key fields:
 * - participants: Array of users in the conversation
 * - lastMessage: Most recent message (for preview)
 * - unreadCount: Number of unread messages for current user
 * - isGroup: Whether this is a group chat or 1-on-1
 * - groupName: Name for group chats (optional)
 * 
 * Important: unreadCount is calculated per-user on the backend and included
 * in the response. It's NOT part of the MongoDB model but added in the API response.
 * 
 * Usage: Displayed in ConversationsList to show all user's chats.
 */
export interface Conversation {
  _id: string;
  participants: User[];               // Array of User objects (populated)
  lastMessage?: Message;              // Last message in conversation (populated, optional)
  lastMessageAt: string;              // ISO timestamp of last message
  unreadCount?: number;               // Unread messages for current user (computed field)
  isGroup: boolean;                   // true for group chat, false for 1-on-1
  groupName?: string;                 // Name for group chats (optional)
  groupAdmin?: string;                // User ID of group admin (optional)
  createdAt: string;                  // ISO timestamp
  updatedAt: string;                  // ISO timestamp
}

/**
 * Chat User (for "start new chat" list)
 * User with online status from GET /api/chat/users
 */
export interface ChatUser {
  _id: string;
  username: string;
  image?: string;
  online: boolean;
}

/**
 * API Response Types
 * 
 * These types define the structure of responses from the chat REST API.
 * All API responses follow the format: { success, code, message, data }
 */

/**
 * Chat Users List Response
 * Returned by: GET /api/chat/users
 */
export interface ChatUsersResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    users: ChatUser[];
  };
}

/**
 * Conversations List Response
 * 
 * Returned by: GET /api/chat/conversations
 * Contains paginated list of user's conversations.
 */
export interface ConversationsResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    conversations: Conversation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

/**
 * Messages List Response
 * 
 * Returned by: GET /api/chat/messages/:conversationId
 * Contains messages for a specific conversation with cursor for pagination.
 * 
 * Note: Uses cursor-based pagination (not page numbers) for efficient loading
 * of older messages. Send nextCursor as ?cursor=xxx to load more.
 */
export interface MessagesResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    messages: Message[];
    nextCursor: string | null;        // Cursor for loading older messages
  };
}

/**
 * Socket.IO Event Types
 * 
 * These types define the structure of events sent/received via Socket.IO.
 * Using these types ensures type-safe event handling.
 * 
 * Important: Socket.IO events are different from REST API calls.
 * Events are real-time and bidirectional (server ↔ client).
 */

/**
 * send_message Event Payload
 *
 * Emitted by client to send a new message.
 * Server determines the sender from the JWT (auth.token) and does not use senderId from the client.
 *
 * Required before emitting:
 * - User must be authenticated (socket connected with JWT)
 * - User must be participant in the conversation
 * - Must provide either content or attachments (or both)
 */
export interface SendMessagePayload {
  conversationId: string;
  content?: string;
  attachments?: string[];
}

/**
 * receive_message Event Payload
 * 
 * Broadcast by server when a new message is sent in any conversation.
 * Client should listen to this to update UI in real-time.
 * 
 * When received:
 * - If conversationId matches current chat → append to messages
 * - If different conversation → increment unread badge
 */
export interface ReceiveMessagePayload extends Message {
  // Same as Message interface, fully populated with sender data
}

/**
 * typing Event Payload
 *
 * Emitted by client when user starts typing.
 * Server uses conversationId and optionally username; broadcasts to other participants.
 */
export interface TypingPayload {
  conversationId: string;
  username?: string;                  // Display name for "X is typing..."
}

/**
 * stop_typing Event Payload
 *
 * Emitted by client when user stops typing (after 1 second of inactivity).
 * Server uses conversationId only; broadcasts to other participants.
 */
export interface StopTypingPayload {
  conversationId: string;
}

/**
 * notification Event Payload
 * 
 * Emitted by server for important events (new message, mention, etc.).
 * Used to show toast notifications and update unread badge.
 * 
 * Note: This is a global notification, not specific to chat window.
 * Can be used for other notification types in the future.
 */
export interface NotificationPayload {
  type: 'chat_message' | 'mention' | 'other';
  message: string;                    // User-facing notification text
  data?: {
    conversationId?: string;
    messageId?: string;
    [key: string]: any;               // Additional data based on type
  };
}

/**
 * Socket Event Map
 * 
 * Central type for all Socket.IO events in the chat system.
 * Use this for type-safe event listeners and emitters.
 * 
 * Example usage:
 * ```typescript
 * socket.on('receive_message', (data: SocketEventMap['receive_message']) => {
 *   // TypeScript knows data is ReceiveMessagePayload
 * });
 * ```
 */
export interface SocketEventMap {
  // Events client listens to (from server)
  receive_message: ReceiveMessagePayload;
  typing: TypingPayload;              // Uses full TypingPayload with conversationId
  stop_typing: StopTypingPayload;     // Uses full StopTypingPayload with conversationId
  notification: NotificationPayload;
  error: { message: string };

  // Events client emits (to server)
  join_room: string;                  // userId
  join_chat: string;                  // conversationId
  leave_chat: string;                 // conversationId
  send_message: SendMessagePayload;
}
