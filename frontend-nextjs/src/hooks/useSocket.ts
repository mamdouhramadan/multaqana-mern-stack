/**
 * useSocket Hook
 * 
 * React hook that manages Socket.IO connection lifecycle.
 * This hook handles initialization, authentication, and cleanup automatically.
 * 
 * Why Use This Hook:
 * - Automatic connection management (connect on mount, disconnect on unmount)
 * - Handles authentication with JWT token
 * - Provides socket instance to components
 * - Reconnects when token changes (e.g., after login)
 * - Cleans up properly to prevent memory leaks
 * 
 * Without this hook, you would need to manually manage socket connection
 * in every component, leading to duplicate code and potential bugs.
 * 
 * Usage:
 * ```typescript
 * function ChatComponent() {
 *   const { socket, isConnected } = useSocket();
 *   
 *   if (!isConnected) {
 *     return <div>Connecting...</div>;
 *   }
 *   
 *   // Use socket here
 * }
 * ```
 */

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, joinUserRoom } from '@/services/socketService';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Socket Hook State
 * 
 * Defines what the hook returns to components.
 * - socket: The Socket.IO instance for emitting/listening to events
 * - isConnected: Boolean indicating if socket is connected to server
 */
interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
}

/**
 * useSocket Hook
 * 
 * @param userId - Optional user ID to join user's personal room
 * @returns Socket instance and connection status
 * 
 * How it works:
 * 1. On mount: Gets access token from AuthContext
 * 2. Initializes socket connection with token
 * 3. Joins user's personal room (if userId provided)
 * 4. Listens to connection events to update isConnected state
 * 5. On unmount: Disconnects socket (if enabled)
 * 6. Re-connects if accessToken changes (e.g., after login)
 * 
 * Connection States:
 * - isConnected = false, socket = null → Not initialized yet
 * - isConnected = false, socket = Socket → Connecting/Disconnected
 * - isConnected = true, socket = Socket → Connected and ready
 * 
 * IMPORTANT: This hook will disconnect socket on unmount by default.
 * If you want to keep the connection alive, modify the cleanup function.
 */
export const useSocket = (userId?: string): UseSocketReturn => {
  // Get access token from AuthContext
  const { accessToken } = useAuth();

  // State to track socket instance
  const [socket, setSocket] = useState<Socket | null>(null);

  // State to track connection status
  // This triggers re-renders when connection status changes
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    /**
     * Initialize Socket Connection
     * 
     * Gets JWT access token from AuthContext and creates socket connection.
     * If no token exists, no connection is created (initializeSocket returns null).
     * 
     * The token is used by backend to identify the user and authorize requests.
     */

    // Initialize socket with authentication token from AuthContext (no connection when no token)
    const socketInstance = initializeSocket(accessToken);
    if (!socketInstance) {
      setSocket(null);
      setIsConnected(false);
      return () => {};
    }
    setSocket(socketInstance);

    /**
     * Connection Event Handler
     * 
     * Updates isConnected state when socket connects.
     * This allows components to show loading states or conditional UI.
     * 
     * Also joins user's personal room if userId is provided.
     * Without joining this room, user won't receive notifications.
     */
    const handleConnect = () => {
      console.log('🟢 Socket connected in useSocket');
      setIsConnected(true);

      // Join user's personal room for receiving notifications
      if (userId) {
        console.log(`👤 Joining user room: ${userId}`);
        joinUserRoom(userId);
      }
    };

    /**
     * Disconnection Event Handler
     * 
     * Updates isConnected state when socket disconnects.
     * This can happen due to:
     * - Network loss
     * - Server restart
     * - Manual disconnect
     * - Client navigation away
     * 
     * Socket.io will automatically try to reconnect unless disabled.
     */
    const handleDisconnect = () => {
      console.log('🔴 Socket disconnected in useSocket');
      setIsConnected(false);
    };

    /**
     * Error Event Handler
     * 
     * Logs connection errors for debugging.
     * Common errors:
     * - Invalid token (401 Unauthorized)
     * - Wrong server URL (404 Not Found)
     * - Network issues (ECONNREFUSED)
     */
    const handleError = (error: Error) => {
      console.error('🔴 Socket error in useSocket:', error);
      setIsConnected(false);
    };

    // Register event handlers
    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('connect_error', handleError);

    // Set initial connection status
    // Socket might already be connected from previous component
    setIsConnected(socketInstance.connected);

    /**
     * Cleanup Function
     * 
     * Called when component unmounts or dependencies change.
     * Removes event listeners and optionally disconnects socket.
     * 
     * IMPORTANT: Not disconnecting allows socket to persist across
     * component re-renders and route changes. This is usually desired
     * for chat applications to maintain real-time connection.
     * 
     * If you want to disconnect on unmount (e.g., on logout),
     * uncomment the disconnectSocket() call.
     */
    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('connect_error', handleError);

      // Optional: Disconnect socket when component unmounts
      // Uncomment if you want to close connection when component is destroyed
      // disconnectSocket();
    };
  }, [accessToken, userId]); // Re-run if accessToken or userId changes

  return { socket, isConnected };
};

/**
 * Hook Usage Examples:
 * 
 * Example 1: Basic usage without userId
 * ```typescript
 * const { socket, isConnected } = useSocket();
 * 
 * if (!isConnected) {
 *   return <div>Connecting to chat...</div>;
 * }
 * ```
 * 
 * Example 2: With userId for personal room
 * ```typescript
 * const user = useAuth(); // Get current user
 * const { socket, isConnected } = useSocket(user?.id);
 * 
 * useEffect(() => {
 *   if (socket && isConnected) {
 *     socket.on('receive_message', handleNewMessage);
 *     return () => socket.off('receive_message', handleNewMessage);
 *   }
 * }, [socket, isConnected]);
 * ```
 * 
 * Example 3: Conditional rendering based on connection
 * ```typescript
 * const MessageIcon = () => {
 *   const { isConnected } = useSocket();
 *   
 *   return (
 *     <div>
 *       <ChatIcon />
 *       {isConnected ? (
 *         <span className="green-dot" />
 *       ) : (
 *         <span className="red-dot" />
 *       )}
 *     </div>
 *   );
 * };
 * ```
 */
