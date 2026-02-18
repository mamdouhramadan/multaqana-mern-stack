/**
 * Socket.IO Service
 * 
 * This file provides a singleton Socket.IO client instance for the entire application.
 * Using a singleton ensures that only ONE WebSocket connection is established,
 * preventing multiple connections which would waste resources and cause sync issues.
 * 
 * Why We Need This:
 * - WebSocket connections are expensive (memory, network)
 * - Multiple components need access to the same socket
 * - Socket should persist across component re-renders
 * - Need centralized connection management
 * 
 * Without this singleton pattern, each component would create its own socket connection,
 * leading to duplicate messages and memory leaks.
 */

import { io, Socket } from 'socket.io-client';
import type { SocketEventMap } from '@/types/chat';

/**
 * Socket Configuration
 * 
 * SOCKET_URL: Backend server URL for WebSocket connection
 * - Development: http://localhost:5000
 * - Production: Should use environment variable
 * 
 * You can change this to use VITE_SOCKET_URL for environment-specific URLs
 */
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

/**
 * Global socket instance
 * 
 * This is initially null and will be created when initializeSocket() is called.
 * It remains the same instance throughout the app lifecycle unless explicitly disconnected.
 */
let socket: Socket | null = null;

/**
 * Initialize Socket Connection
 * 
 * Creates and configures a Socket.IO client connection with the backend.
 * This should be called ONCE when the app starts or when user logs in.
 * 
 * @param token - JWT authentication token from localStorage
 * @returns Socket instance
 * 
 * How it works:
 * 1. Checks if socket already exists (singleton pattern)
 * 2. Creates new socket with authentication header
 * 3. Configures automatic reconnection
 * 4. Sets up connection event handlers
 * 
 * The server expects auth.token (JWT) and determines the sender from it;
 * it does not rely on senderId from client events.
 *
 * Usage:
 * ```typescript
 * const socket = initializeSocket(localStorage.getItem('token'));
 * if (socket) { ... }
 * ```
 */
export const initializeSocket = (token: string | null): Socket | null => {
  const hasToken = typeof token === 'string' && token.trim().length > 0;
  if (!hasToken) {
    // Do not create or reuse connection without a token; server would reject or leave user unidentified
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  // If socket already exists and is connected, return it
  if (socket?.connected) {
    return socket;
  }

  // Create new socket instance with configuration
  socket = io(SOCKET_URL, {
    // Authentication: server expects auth.token (JWT) for identification
    auth: {
      token,
    },

    // Automatic reconnection settings
    // If connection drops, socket.io will try to reconnect automatically
    reconnection: true,              // Enable auto-reconnection
    reconnectionAttempts: 5,         // Try 5 times before giving up
    reconnectionDelay: 1000,         // Wait 1s before first retry
    reconnectionDelayMax: 5001,      // Max wait time between retries

    // Transport settings
    // 'polling' is fallback if 'websocket' fails (useful for restrictive networks)
    transports: ['websocket', 'polling'],
  });

  // Connection event handlers
  // These provide visibility into connection status for debugging

  socket.on('connect', () => {
    console.log('✅ Socket.IO connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason);
    // Reasons can be: 'io server disconnect', 'transport close', etc.
    // Socket.io will auto-reconnect unless reason is 'io server disconnect'
  });

  socket.on('connect_error', (error) => {
    console.error('🔴 Socket.IO connection error:', error.message);
    // This happens when connection fails (wrong URL, no network, auth failure, etc.)
  });

  return socket;
};

/**
 * Get Current Socket Instance
 * 
 * Returns the existing socket instance without creating a new one.
 * Useful for components that need to access an already-initialized socket.
 * 
 * @returns Existing socket instance or null if not initialized
 * 
 * IMPORTANT: This returns null if socket hasn't been initialized yet.
 * Always check for null before using the socket.
 * 
 * Usage:
 * ```typescript
 * const socket = getSocket();
 * if (socket) {
 *   socket.emit('some_event', data);
 * }
 * ```
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Disconnect Socket
 * 
 * Manually disconnects the socket and cleans up the instance.
 * This should be called when user logs out to prevent unauthorized connections.
 * 
 * After calling this, you need to call initializeSocket() again to reconnect.
 * 
 * Usage:
 * ```typescript
 * disconnectSocket(); // Call on logout
 * ```
 */
export const disconnectSocket = (): void => {
  if (socket) {
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};

/**
 * Type-Safe Event Emitter
 * 
 * Wrapper around socket.emit() with TypeScript type checking.
 * Prevents typos in event names and ensures correct payload structure.
 * 
 * @param event - Event name from SocketEventMap
 * @param data - Event payload (type-checked)
 * 
 * Benefits:
 * - Autocomplete for event names
 * - Type checking for event payloads
 * - Compile-time error if event name is wrong
 * 
 * Usage:
 * ```typescript
 * emitEvent('send_message', {
 *   conversationId: '123',
 *   content: 'Hello!'
 * });
 * ```
 */
export const emitEvent = <K extends keyof SocketEventMap>(
  event: K,
  data: SocketEventMap[K]
): void => {
  if (!socket) {
    console.error('❌ Cannot emit event: Socket not initialized');
    return;
  }

  if (!socket.connected) {
    console.error('❌ Cannot emit event: Socket not connected');
    return;
  }

  socket.emit(event as string, data);
};

/**
 * Type-Safe Event Listener
 * 
 * Wrapper around socket.on() with TypeScript type checking.
 * 
 * @param event - Event name from SocketEventMap
 * @param callback - Event handler (typed)
 * @returns Cleanup function to remove listener
 * 
 * IMPORTANT: Always call the cleanup function when component unmounts
 * to prevent memory leaks and duplicate event handlers.
 * 
 * Usage:
 * ```typescript
 * useEffect(() => {
 *   const cleanup = onEvent('receive_message', (message) => {
 *     console.log('New message:', message);
 *   });
 *   
 *   return cleanup; // Remove listener on unmount
 * }, []);
 * ```
 */
export const onEvent = <K extends keyof SocketEventMap>(
  event: K,
  callback: (data: SocketEventMap[K]) => void
): (() => void) => {
  if (!socket) {
    console.error('❌ Cannot add listener: Socket not initialized');
    return () => { };
  }

  // Add listener
  socket.on(event as string, callback);

  // Return cleanup function
  return () => {
    socket?.off(event as string, callback);
  };
};

/**
 * Join User Room
 * 
 * Joins the user's personal room for receiving direct notifications.
 * This MUST be called after connecting to receive messages.
 * 
 * @param userId - Current user's ID
 * 
 * How it works:
 * - Backend creates a Socket.IO room with the user's ID
 * - All messages/notifications for this user are sent to this room
 * - Without joining, user won't receive any real-time updates
 * 
 * Usage:
 * ```typescript
 * joinUserRoom(currentUser.id);
 * ```
 */
export const joinUserRoom = (userId: string): void => {
  emitEvent('join_room', userId);
};

/**
 * Join Chat Room
 * 
 * Joins a specific conversation room to receive messages in real-time.
 * Call this when user opens a conversation.
 * 
 * @param conversationId - Conversation to join
 * 
 * How it works:
 * - Backend creates a room for each conversation
 * - When anyone sends a message, it's broadcast to everyone in the room
 * - You must join the room to receive messages in real-time
 * 
 * Usage:
 * ```typescript
 * joinChatRoom(conversation._id);
 * ```
 */
export const joinChatRoom = (conversationId: string): void => {
  emitEvent('join_chat', conversationId);
};

/**
 * Leave Chat Room
 * 
 * Leaves a conversation room when user navigates away.
 * This prevents receiving messages for conversations user is not viewing.
 * 
 * @param conversationId - Conversation to leave
 * 
 * IMPORTANT: Always call this when component unmounts or user switches chats
 * to avoid memory leaks and incorrect message delivery.
 * 
 * Usage:
 * ```typescript
 * useEffect(() => {
 *   joinChatRoom(conversationId);
 *   return () => leaveChatRoom(conversationId);
 * }, [conversationId]);
 * ```
 */
export const leaveChatRoom = (conversationId: string): void => {
  emitEvent('leave_chat', conversationId);
};
