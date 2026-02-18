/**
 * Message Bubble Component
 * 
 * Displays an individual message in a chat conversation.
 * Automatically styles differently for sent vs received messages.
 * 
 * Features:
 * - Different visual styles for sent/received messages
 * - Shows sender name (for received messages)
 * - Displays message content with support for multiline text
 * - Shows timestamp in human-readable format
 * - Supports attachments (displayed as links)
 * - Optional reactions display
 * 
 * Visual Design:
 * - Sent messages: Right-aligned, blue background
 * - Received messages: Left-aligned, gray background
 * - WhatsApp-style chat bubble with tail effect
 * 
 * Usage:
 * ```tsx
 * <MessageBubble
 *   message={message}
 *   currentUserId={user.id}
 * />
 * ```
 */

import { format } from 'date-fns';
import type { Message } from '@/types/chat';

interface MessageBubbleProps {
  /**
   * Message Data
   * 
   * The message object containing all message information.
   * Must include: _id, sender, content, createdAt
   * Optional: attachments, reactions
   */
  message: Message;

  /**
   * Current User ID
   * 
   * ID of the logged-in user. Used to determine if this message
   * was sent by the current user or received from someone else.
   * 
   * This controls:
   * - Message alignment (right for sent, left for received)
   * - Background color (blue for sent, gray for received)
   * - Whether to show sender name (hide for sent messages)
   */
  currentUserId: string;
}

/**
 * MessageBubble Component
 * 
 * Renders a single chat message with appropriate styling based on sender.
 * 
 * @param message - The message data to display
 * @param currentUserId - ID of current user to determine sent vs received
 * @returns Styled message bubble
 */
export const MessageBubble = ({ message, currentUserId }: MessageBubbleProps) => {
  /**
   * Determine if Message is Sent or Received
   * 
   * Compares message sender ID with current user ID.
   * Message.sender can be either:
   * - A string (just the ID)
   * - A User object (when populated from backend)
   * 
   * We handle both cases to avoid errors.
   */
  const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
  const isMe = senderId === currentUserId;

  /**
   * Get Sender Display Name
   * 
   * For received messages, shows the sender's username.
   * For sent messages, shows "You".
   * 
   * If sender isn't populated (just an ID string), falls back to "User".
   */
  const senderName = isMe
    ? 'You'
    : typeof message.sender === 'string'
      ? 'User'
      : message.sender.username || 'User';

  /**
   * Format Timestamp
   * 
   * Converts ISO timestamp to human-readable time.
   * Examples: "10:30 AM", "2:45 PM"
   * 
   * Uses date-fns for consistent formatting across the app.
   * If createdAt is missing (shouldn't happen), uses current time.
   */
  const messageTime = message.createdAt
    ? format(new Date(message.createdAt), 'p') // 'p' = localized time format
    : '';

  return (
    <div
      className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      {/**
       * Message Bubble Container
       * 
       * Max width prevents messages from spanning the entire screen.
       * Allows long messages to wrap while keeping reasonable width.
       * 
       * Conditional classes based on isMe:
       * - Sent: Blue background, right-aligned, rounded on left
       * - Received: Gray background, left-aligned, rounded on right
       */}
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl ${isMe
            ? 'bg-primary-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
          }`}
      >
        {/**
         * Sender Name
         * 
         * Only shown for received messages (when isMe is false).
         * Helps identify who sent the message in group chats or multi-user contexts.
         * 
         * Font is smaller and bold to distinguish from message content.
         */}
        {!isMe && (
          <div className="text-xs font-semibold mb-1 opacity-75">
            {senderName}
          </div>
        )}

        {/**
         * Message Content
         * 
         * Displays the actual text of the message.
         * If no content exists (attachment-only message), shows placeholder.
         * 
         * whitespace-pre-wrap: Preserves line breaks from user input
         * break-words: Prevents long words from overflowing
         */}
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content || <em className="opacity-75">Attachment</em>}
        </div>

        {/**
         * Attachments
         * 
         * Displays file attachments as clickable links.
         * Each attachment opens in a new tab when clicked.
         * 
         * In a production app, you might want to:
         * - Show file icons based on type
         * - Display image attachments inline
         * - Show file name and size
         * - Add download button
         */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs underline block ${isMe ? 'text-white' : 'text-primary-600'
                  }`}
              >
                📎 Attachment {index + 1}
              </a>
            ))}
          </div>
        )}

        {/**
         * Message Timestamp
         * 
         * Shows when the message was sent.
         * Positioned in bottom-right of bubble for consistent placement.
         * 
         * Small font and reduced opacity to not compete with content.
         * Different text color for sent vs received to ensure readability.
         */}
        <div
          className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-600'
            }`}
        >
          {messageTime}
        </div>

        {/**
         * TODO: Reactions Display
         * 
         * Future enhancement to show emoji reactions.
         * Would display as small emoji buttons below the message.
         * 
         * Implementation example:
         * {message.reactions && message.reactions.length > 0 && (
         *   <div className="flex gap-1 mt-1">
         *     {message.reactions.map((reaction, idx) => (
         *       <span key={idx} className="text-xs">
         *         {reaction.emoji}
         *       </span>
         *     ))}
         *   </div>
         * )}
         */}
      </div>
    </div>
  );
};
