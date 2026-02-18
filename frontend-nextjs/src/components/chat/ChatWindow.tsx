/**
 * Chat Window Component
 *
 * Main chat interface showing messages, typing indicator, and message input.
 * Handles real-time messaging via Socket.IO.
 *
 * Key Features:
 * - Displays message history in scrollable container
 * - Auto-scrolls to bottom on new messages
 * - Real-time message reception via Socket.IO
 * - Typing indicators
 * - Mute/unmute functionality
 * - Infinite scroll for loading older messages (cursor pagination)
 *
 * Socket.IO Integration:
 * - Joins conversation room on mount
 * - Listens for receive_message, typing, stop_typing events
 * - Emits send_message, typing, stop_typing events
 * - Leaves room on unmount
 */

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { joinChatRoom, leaveChatRoom, emitEvent } from "@/services/socketService";
import chatService from "@/api/chatService";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import type { Message } from "@/types/chat";

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  /** Display name for the current user (used in typing indicator for others). */
  currentUserName?: string;
  otherUserName?: string;
  /** When true, the built-in header is not rendered (parent provides its own). */
  hideHeader?: boolean;
}

export const ChatWindow = ({
  conversationId,
  currentUserId,
  currentUserName,
  otherUserName,
  hideHeader,
}: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket(currentUserId);

  /**
   * Scroll to Bottom
   * Scrolls messages container to show latest message.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Fetch Message History
   */
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await chatService.getMessages(conversationId);
        if (response.success) {
          setMessages(response.data.messages.reverse()); // Newest last for display
          setTimeout(scrollToBottom, 100); // Scroll after render
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  /**
   * Join/Leave Chat Room
   */
  useEffect(() => {
    if (!socket) return;

    joinChatRoom(conversationId);
    return () => leaveChatRoom(conversationId);
  }, [socket, conversationId]);

  /**
   * Socket.IO Event Listeners
   */
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleTyping = ({ username }: { username: string }) => {
      setIsTyping(true);
      setTypingUser(username);
    };

    const handleStopTyping = () => {
      setIsTyping(false);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [socket, conversationId]);

  /**
   * Send Message Handler
   */
  const handleSendMessage = (content: string) => {
    if (!socket) return;

    emitEvent("send_message", {
      conversationId,
      content,
      attachments: [],
    });
  };

  /**
   * Typing Event Handlers
   */
  const handleTyping = () => {
    if (!socket) return;
    emitEvent("typing", {
      conversationId,
      username: currentUserName ?? otherUserName ?? "User",
    });
  };

  const handleStopTyping = () => {
    if (!socket) return;
    emitEvent("stop_typing", { conversationId });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {!hideHeader && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {otherUserName || "Chat"}
          </h2>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800/50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              currentUserId={currentUserId}
            />
          ))
        )}
        <TypingIndicator isTyping={isTyping} username={typingUser} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  );
};
