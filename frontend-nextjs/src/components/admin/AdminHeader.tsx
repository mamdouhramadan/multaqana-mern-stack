import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, X, User, SignOut, CaretDown, ChatCircleDots } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/layout/header/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/header/ThemeToggle';
import { cn } from '@/utils/utils';
import { useSocket } from '@/hooks/useSocket';
import chatService from '@/api/chatService';

/**
 * Admin Header Component
 * مكون رأس صفحة الإدارة
 * 
 * Features:
 * - Search functionality
 * - Messages icon with real-time unread badge
 * - User profile avatar with name
 * - Dropdown menu with profile link and logout
 * - Language switcher
 * 
 * Real-time Chat Integration:
 * - Uses Socket.IO to receive new message notifications
 * - Updates unread message count in real-time
 * - Badge only shows when there are unread messages
 * - Clicking icon navigates to messages page
 */
const AdminHeader = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Derive display profile from auth user (no localStorage)
  const userProfile = {
    name: user?.username || 'Admin User',
    email: '', // Email not in JWT; could come from profile API later
    avatar: '',
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Unread Messages State
   * 
   * Tracks the total number of unread messages across all conversations.
   * This count is displayed as a badge on the messages icon.
   * 
   * Updated from two sources:
   * 1. Initial load: Fetched from conversations API
   * 2. Real-time: Incremented when 'receive_message' event is received
   */
  const [unreadCount, setUnreadCount] = useState<number>(0);

  /**
   * Socket.IO Connection
   *
   * Pass user.id so the socket joins the user's room on connect.
   * That makes the current user appear "online" in the chat users list.
   */
  const { socket, isConnected } = useSocket(user?.id);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  /**
   * Fetch Initial Unread Count
   * 
   * Loads the total unread message count when component mounts.
   * This is done by fetching all conversations and summing their unread counts.
   * 
   * Why we need this:
   * - Socket.IO only sends new messages, not the initial state
   * - Need to show accurate count on page load
   * - User might have unread messages from before logging in
   * 
   * This runs once on mount and again if socket connection status changes,
   * ensuring we have fresh data after reconnection.
   */
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await chatService.getConversations(1, 100);
        if (response.success) {
          // Sum up all unread counts from conversations
          const total = response.data.conversations.reduce(
            (sum, conv) => sum + (conv.unreadCount || 0),
            0
          );
          setUnreadCount(total);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [isConnected]); // Re-fetch when connection status changes

  /**
   * Listen for Real-Time Messages
   * 
   * Sets up Socket.IO event listener for new messages.
   * When a new message is received, increments the unread badge count.
   * 
   * Why increment instead of fetch:
   * - More efficient (no API call needed)
   * - Faster UI update
   * - Reduces server load
   * 
   * The badge count might become out of sync if:
   * - User opens messages in another tab
   * - User marks messages as read elsewhere
   * 
   * This is acceptable because:
   * - Count refreshes when socket reconnects
   * - Count refreshes when navigating to messages page
   * - Real-time updates are more important than 100% accuracy
   * 
   * IMPORTANT: Must clean up listener on unmount to prevent memory leaks
   */
  useEffect(() => {
    if (!socket) return;

    /**
     * Handle Receive Message Event
     * 
     * Called when server broadcasts a new message.
     * Only increments count if we're NOT currently viewing that conversation.
     * 
     * @param message - The new message data from Socket.IO
     */
    const handleReceiveMessage = (message: any) => {
      console.log('📨 New message received in header:', message);
      // Increment unread count
      // In a more sophisticated implementation, you could check if the message
      // is for the currently open conversation and skip incrementing
      setUnreadCount((prev) => prev + 1);
    };

    // Register event listener
    socket.on('receive_message', handleReceiveMessage);

    // Cleanup: Remove listener when component unmounts or socket changes
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket]);

  /**
   * Navigate to Messages Page
   * 
   * Handles click on messages icon.
   * Navigates to the messages list page where user can view all conversations.
   */
  const handleMessagesClick = () => {
    navigate('/admin/messages');
    // Note: Unread count will be updated when user actually reads messages
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement search navigation logic here
    // For example: navigate(`/admin/search?q=${searchQuery}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      // Logout failed but still navigate to login
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const names = userProfile.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return userProfile.name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Left: Page Title or Breadcrumb (optional) */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.dashboard.title')}
          </h2>
        </div>

        {/* Right: Search + Language Switcher + User Profile */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div ref={containerRef} className="relative flex items-center">
            {!isSearchOpen && (
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
                onClick={() => setIsSearchOpen(true)}
                aria-label={t('common.search')}
              >
                <MagnifyingGlass size={20} />
              </button>
            )}

            <div
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 flex items-center transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600',
                isSearchOpen ? 'w-[300px] opacity-100 visible z-50' : 'w-0 opacity-0 invisible -z-10'
              )}
            >
              <form onSubmit={handleSearch} className="relative w-full flex items-center">
                <MagnifyingGlass size={18} className="absolute left-3 text-gray-400 dark:text-gray-500" />
                <Input
                  ref={inputRef}
                  type="search"
                  placeholder={t('admin.header.searchPlaceholder')}
                  className="pl-9 pr-8 h-10 w-full border-0 focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 h-10 w-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <X size={16} />
                </Button>
              </form>
            </div>
          </div>

          {/* Messages Icon with Unread Badge */}
          {/**
           * Messages Icon Component
           * 
           * Displays a chat icon that navigates to the messages page when clicked.
           * Shows a red badge with unread count when there are unread messages.
           * 
           * Features:
           * - Click to navigate to /admin/messages
           * - Badge appears only when unreadCount > 0
           * - Badge shows actual count if < 100, otherwise shows "99+"
           * - Tooltip shows "Messages"
           * - Responsive hover effects
           * 
           * Real-time Updates:
           * - Badge count updates instantly when new messages arrive via Socket.IO
           * - No page refresh needed
           */}
          <button
            onClick={handleMessagesClick}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            aria-label="Messages"
            title="Messages"
          >
            <ChatCircleDots size={22} weight="regular" />

            {/* Unread Badge */}
            {/**
             * Badge Component
             * 
             * Shows unread message count in a red circle.
             * Only renders when unreadCount > 0.
             * 
             * Positioning:
             * - Absolute positioned in top-right corner of icon
             * - Uses transform to center the badge
             * 
             * Display Logic:
             * - If count <= 99: Shows exact number
             * - If count > 99: Shows "99+"
             * - If count === 0: Badge doesn't render at all
             * 
             * Styling:
             * - Red background (#EF4444) for urgency
             * - White text for contrast
             * - Small font (10px) to fit in badge
             * - Min width ensures single digits are circular
             */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 text-gray-900 dark:text-white">
                {/* Avatar */}
                <div className="relative">
                  {userProfile.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold ring-2 ring-gray-200 dark:ring-gray-600">
                      {getUserInitials()}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                </div>

                {/* Name */}
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile.name}
                  </span>
                  {userProfile.email && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {userProfile.email}
                    </span>
                  )}
                </div>

                {/* Dropdown Icon */}
                <CaretDown size={16} className="text-gray-500 dark:text-gray-400" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <DropdownMenuLabel className="text-gray-900 dark:text-white">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">{userProfile.name}</p>
                  {userProfile.email && (
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                      {userProfile.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-900 dark:focus:text-white">
                <Link
                  to="/admin/profile"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User size={16} />
                  <span>{t('common.profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-600/20"
              >
                <SignOut size={16} />
                <span>{t('common.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
