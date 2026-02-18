/**
 * Typing Indicator Component
 * 
 * Shows a visual indicator when another user is typing in the conversation.
 * Displays animated dots to indicate active typing.
 * 
 * Features:
 * - Only shows when isTyping is true
 * - Displays username of person typing
 * - Animated dots for visual feedback
 * - Automatically hidden via Socket.IO 'stop_typing' event
 * 
 * How it works:
 * 1. Parent component listens to 'typing' Socket.IO event
 * 2. Event includes userId and username of typer
 * 3. Parent sets isTyping=true and typingUser username
 * 4. After 1 second of no typing, backend sends 'stop_typing' event
 * 5. Parent sets isTyping=false
 * 
 * Why this is important:
 * - Provides real-time feedback that someone is composing a message
 * - Prevents users from thinking the conversation is inactive
 * - Common pattern in modern chat applications (WhatsApp, Slack, etc.)
 * 
 * Usage:
 * ```tsx
 * const [isTyping, setIsTyping] = useState(false);
 * const [typingUser, setTypingUser] = useState('');
 * 
 * useEffect(() => {
 *   socket.on('typing', ({ username }) => {
 *     setIsTyping(true);
 *     setTypingUser(username);
 *   });
 *   socket.on('stop_typing', () => {
 *     setIsTyping(false);
 *   });
 * }, [socket]);
 * 
 * <TypingIndicator isTyping={isTyping} username={typingUser} />
 * ```
 */

interface TypingIndicatorProps {
  /**
   * Is Typing Flag
   * 
   * Controls whether the indicator is shown.
   * Set to true when 'typing' event is received.
   * Set to false when 'stop_typing' event is received.
   */
  isTyping: boolean;

  /**
   * Typing User's Name
   * 
   * Username of the person who is typing.
   * Displayed in the message: "{username} is typing..."
   * 
   * Optional because we might not always have the username available.
   */
  username?: string;
}

/**
 * TypingIndicator Component
 * 
 * Displays a subtle animation indicating that someone is typing.
 * 
 * @param isTyping - Whether to show the indicator
 * @param username - Name of person typing (optional)
 * @returns Typing indicator or null if not typing
 */
export const TypingIndicator = ({ isTyping, username }: TypingIndicatorProps) => {
  /**
   * Early Return
   * 
   * If nobody is typing, don't render anything.
   * This prevents the component from taking up space in the DOM.
   */
  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-gray-500 text-sm">
      {/**
       * Typing Text
       * 
       * Shows "{username} is typing..." or just "Typing..." if no username.
       * Italic font to distinguish from actual messages.
       */}
      <span className="italic">
        {username ? `${username} is typing` : 'Typing'}...
      </span>

      {/**
       * Animated Dots
       * 
       * Three dots that pulse to show activity.
       * Uses CSS animation for smooth, continuous motion.
       * 
       * How the animation works:
       * - Each dot has the same base animation
       * - Animation delays are staggered (0ms, 200ms, 400ms)
       * - Creates a wave effect as dots fade in and out
       * 
       * The animation is defined in CSS using keyframes:
       * @keyframes pulse {
       *   0%, 100% { opacity: 0.4; }
       *   50% { opacity: 1; }
       * }
       * 
       * Benefits:
       * - Pure CSS (no JavaScript needed after render)
       * - Smooth 60fps animation
       * - Low CPU usage
       * - Works even if main thread is busy
       */}
      <div className="flex gap-1">
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
          style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
          style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
        />
      </div>
    </div>
  );
};

/**
 * Implementation Notes:
 * 
 * 1. Debouncing:
 *    The typing indicator should use debouncing to avoid spam.
 *    The parent component should emit 'typing' on keypress and 'stop_typing'
 *    after 1 second of inactivity.
 * 
 * 2. Multiple Users:
 *    This component currently shows one user typing at a time.
 *    For group chats with multiple simultaneous typers, you could:
 *    - Show "Multiple people are typing..."
 *    - Show list of usernames: "Alice, Bob, and Charlie are typing..."
 *    - Show multiple indicators stacked
 * 
 * 3. Accessibility:
 *    Consider adding aria-live="polite" for screen readers.
 *    This would announce when typing starts/stops.
 * 
 * 4. Performance:
 *    The animate-pulse class uses CSS animations which are GPU-accelerated.
 *    For very long chat sessions, ensure event listeners are cleaned up.
 * 
 * Example Enhancement for Multiple Typers:
 * ```tsx
 * interface MultiTypingProps {
 *   typingUsers: string[]; // Array of usernames
 * }
 * 
 * function formatTypingUsers(users: string[]): string {
 *   if (users.length === 0) return '';
 *   if (users.length === 1) return `${users[0]} is`;
 *   if (users.length === 2) return `${users[0]} and ${users[1]} are`;
 *   return `${users.length} people are`;
 * }
 * ```
 */
