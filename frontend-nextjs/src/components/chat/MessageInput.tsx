/**
 * Message Input Component
 * 
 * Text input field for composing and sending chat messages.
 * Handles typing indicators and message submission.
 * 
 * Features:
 * - Multi-line text input (textarea)
 * - Enter to send, Shift+Enter for new line
 * - Send button with icon
 * - Auto-focus on mount
 * - Typing indicator emission on input
 * - Prevents sending empty messages
 * - Clears input after sending
 * 
 * Socket.IO Events Emitted:
 * - 'send_message': When user submits a message
 * - 'typing': When user starts typing
 * - 'stop_typing': 1 second after user stops typing
 * 
 * Why these features exist:
 * - Enter to send: Standard UX pattern, faster than clicking button
 * - Shift+Enter for newline: Allows multi-line messages
 * - Typing indicators: Let other user know you're composing
 * - Debounced stop_typing: Avoids spamming events
 * 
 * Usage:
 * ```tsx
 * <MessageInput
 *   onSendMessage={(content) => {
 *     socket.emit('send_message', {
 *       conversationId,
 *       senderId: userId,
 *       content
 *     });
 *   }}
 *   onTyping={() => socket.emit('typing', { conversationId, userId })}
 *   onStopTyping={() => socket.emit('stop_typing', { conversationId, userId })}
 * />
 * ```
 */

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { PaperPlaneRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  /**
   * Send Message Callback
   * 
   * Called when user submits a message (Enter or click send button).
   * Parent component should emit Socket.IO 'send_message' event.
   * 
   * @param content - The message text to send
   */
  onSendMessage: (content: string) => void;

  /**
   * Typing Callback
   * 
   * Called when user types a character.
   * Parent component should emit Socket.IO 'typing' event.
   * 
   * Note: This is called on every keystroke. For efficiency,
   * the parent might want to debounce or throttle this.
   */
  onTyping?: () => void;

  /**
   * Stop Typing Callback
   * 
   * Called 1 second after user stops typing.
   * Parent component should emit Socket.IO 'stop_typing' event.
   * 
   * This is automatically debounced within this component.
   */
  onStopTyping?: () => void;

  /**
   * Placeholder Text
   * 
   * Shown in empty input field.
   * Default: "Type a message..."
   */
  placeholder?: string;

  /**
   * Disabled State
   * 
   * If true, input is disabled and user cannot type.
   * Useful when socket is disconnected or conversation is archived.
   */
  disabled?: boolean;
}

/**
 * MessageInput Component
 * 
 * Provides input field and send button for chat messages.
 * Handles keyboard shortcuts and typing indicator logic.
 * 
 * @param props - Component props including callbacks
 * @returns Message input UI
 */
export const MessageInput = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  placeholder = 'Type a message...',
  disabled = false,
}: MessageInputProps) => {
  /**
   * Message Content State
   * 
   * Stores the current text in the input field.
   * Updated on every keystroke.
   */
  const [message, setMessage] = useState('');

  /**
   * Textarea Reference
   * 
   * DOM reference to the textarea element.
   * Used for:
   * - Auto-focusing on mount
   * - Programmatically resetting height
   * - Accessing raw DOM element for measurements
   */
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Typing Timeout Reference
   * 
   * Stores the timeout ID for the debounced stop typing event.
   * Used to clear/reset the timeout on new keystrokes.
   * 
   * Why we need this:
   * - Prevents memory leaks by clearing old timeouts
   * - Implements debouncing logic (only fire after inactivity)
   * - Ref ensures timeout survives re-renders
   */
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Auto-focus Input on Mount
   * 
   * Focuses the textarea when component mounts.
   * This UX improvement allows users to start typing immediately
   * without clicking the input first.
   * 
   * Only runs once (empty dependency array).
   */
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  /**
   * Handle Input Change
   * 
   * Called on every keystroke in the textarea.
   * Updates message state and triggers typing indicators.
   * 
   * Workflow:
   * 1. Update message state with new text
   * 2. Emit 'typing' event to server
   * 3. Clear any existing stop_typing timeout
   * 4. Set new timeout to emit 'stop_typing' after 1 second
   * 
   * Why 1 second delay:
   * - Balances real-time feedback with performance
   * - Avoids spamming events while actively typing
   * - Long enough that brief pauses don't trigger stop_typing
   * - Short enough that indicator disappears quickly after stopping
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // Emit typing event
    if (onTyping) {
      onTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout for stop_typing
    if (onStopTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping();
      }, 1000);
    }
  };

  /**
   * Handle Send Message
   * 
   * Validates and sends the message.
   * Called by send button click or Enter key press.
   * 
   * Validation:
   * - Trims whitespace from message
   * - Checks if message is empty
   * - Prevents sending blank messages
   * 
   * After sending:
   * - Clears input field
   * - Clears typing timeout
   * - Emits stop_typing immediately (since message was sent)
   * 
   * Why we trim:
   * - Prevents sending messages with only spaces/newlines
   * - Cleans up accidental whitespace
   * - Common pattern in chat applications
   */
  const handleSend = () => {
    const trimmedMessage = message.trim();

    // Don't send empty messages
    if (!trimmedMessage) return;

    // Send to parent callback
    onSendMessage(trimmedMessage);

    // Clear input
    setMessage('');

    // Clear typing timeout and emit stop_typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (onStopTyping) {
      onStopTyping();
    }

    // Re-focus input for continuous chatting
    textareaRef.current?.focus();
  };

  /**
   * Handle Key Down
   * 
   * Implements keyboard shortcuts:
   * - Enter: Send message
   * - Shift+Enter: Insert newline (default textarea behavior)
   * 
   * Why prevent default on Enter:
   * - Default Enter behavior would insert newline
   * - We want Enter to send, not add newline
   * - Shift+Enter still works because we only preventDefault for plain Enter
   * 
   * @param e - Keyboard event from textarea
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift = Send
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent newline insertion
      handleSend();
    }
    // Enter with Shift = Newline (default behavior, no preventDefault)
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-end gap-2">
        {/**
         * Textarea Input
         * 
         * Multi-line input for message composition.
         * 
         * Properties:
         * - rows={1}: Starts as single line, expands with content
         * - resize-none: Prevents manual vertical resizing (auto-sizing instead)
         * - min-h-[40px]: Minimum height for single line
         * - max-h-[200px]: Maximum height before scrolling
         * - overflow-y-auto: Scrollbar appears when content exceeds max height
         * 
         * Why textarea instead of input:
         * - Supports multi-line messages
         * - Auto-expands with content
         * - Better for longer messages
         * 
         * Accessibility:
         * - aria-label: Screen reader description
         * - disabled prop: Prevents input when not available
         */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none min-h-[40px] max-h-[200px] overflow-y-auto rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Message input"
        />

        {/**
         * Send Button
         * 
         * Clicking sends the message (alternative to pressing Enter).
         * 
         * Visual States:
         * - Disabled when input is empty (prevents sending blank messages)
         * - Disabled when component is disabled (e.g., socket disconnected)
         * - Primary color when enabled
         * - Gray when disabled
         * 
         * Icon:
         * - PaperPlaneRight: Universal symbol for "send"
         * - Size 20: Balanced with button size
         * - Weight "bold": More visible/clickable appearance
         * 
         * Why disable when empty:
         * - Visual feedback that there's nothing to send
         * - Prevents accidental clicks
         * - Common UX pattern in messaging apps
         */}
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          className="h-10 w-10 shrink-0"
          aria-label="Send message"
        >
          <PaperPlaneRight size={20} weight="bold" />
        </Button>
      </div>
    </div>
  );
};

/**
 * Enhancement Ideas:
 * 
 * 1. File Attachments:
 *    Add a button to attach files/images
 *    ```tsx
 *    <Button onClick={handleAttachFile}>
 *      <Paperclip size={20} />
 *    </Button>
 *    ```
 * 
 * 2. Emoji Picker:
 *    Add emoji selector button
 *    ```tsx
 *    <EmojiPicker onSelect={(emoji) => setMessage(msg + emoji)} />
 *    ```
 * 
 * 3. Auto-resize Textarea:
 *    Dynamically adjust height based on content
 *    ```tsx
 *    useEffect(() => {
 *      if (textareaRef.current) {
 *        textareaRef.current.style.height = 'auto';
 *        textareaRef.current.style.height = 
 *          textareaRef.current.scrollHeight + 'px';
 *      }
 *    }, [message]);
 *    ```
 * 
 * 4. Draft Persistence:
 *    Save draft to localStorage
 *    ```tsx
 *    useEffect(() => {
 *      const draft = localStorage.getItem(`draft_${conversationId}`);
 *      if (draft) setMessage(draft);
 *    }, [conversationId]);
 *    
 *    useEffect(() => {
 *      localStorage.setItem(`draft_${conversationId}`, message);
 *    }, [message, conversationId]);
 *    ```
 * 
 * 5. Character Counter:
 *    Show remaining characters if there's a limit
 *    ```tsx
 *    <span className="text-xs text-gray-500">
 *      {message.length} / 1000
 *    </span>
 *    ```
 */
