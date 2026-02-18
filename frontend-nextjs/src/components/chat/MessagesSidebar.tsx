/**
 * Messages Sidebar
 *
 * Left column: current user block, search, then scrollable list of
 * conversations and users to start a chat with (with online/offline status).
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ListMagnifyingGlass, ChatCircleDots } from "@phosphor-icons/react";
import chatService from "@/api/chatService";
import { useAuth } from "@/providers/AuthProvider";
import type { Conversation, ChatUser } from "@/types/chat";
import toast from "react-hot-toast";

export const MessagesSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [startingWithId, setStartingWithId] = useState<string | null>(null);

  const currentConversationId = location.pathname.split("/").pop();
  const isConversationRoute = /^[a-f0-9]{24}$/i.test(
    currentConversationId || "",
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [convRes, usersRes] = await Promise.all([
          chatService.getConversations(1, 50),
          chatService.getChatUsers(),
        ]);
        if (convRes.success && convRes.data?.conversations) {
          setConversations(convRes.data.conversations);
        }
        if (usersRes.success && usersRes.data?.users) {
          setUsers(usersRes.data.users);
        }
      } catch (err) {
        console.error("Error loading messages sidebar:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const participantIdsInConversations = new Set(
    conversations.flatMap((c) => c.participants.map((p) => p._id)),
  );
  const usersWithoutChat = users.filter(
    (u) => !participantIdsInConversations.has(u._id),
  );

  const filterSearch = (name: string) =>
    !search.trim() || name.toLowerCase().includes(search.trim().toLowerCase());

  const handleConversationClick = (conversationId: string) => {
    navigate(`/admin/messages/${conversationId}`);
  };

  const handleUserClick = async (targetUser: ChatUser) => {
    if (startingWithId) return;
    setStartingWithId(targetUser._id);
    try {
      const response = await chatService.createConversation(targetUser._id);
      const conversationId = response.data?.conversationId;
      if (conversationId) {
        navigate(`/admin/messages/${conversationId}`, { replace: true });
      } else {
        toast.error("Could not start conversation");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to start conversation",
      );
    } finally {
      setStartingWithId(null);
    }
  };

  const currentUserId = user?.id;

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Current user block */}
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="h-12 w-12 rounded-full bg-primary-100/30 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                {user?.username?.substring(0, 2).toUpperCase() || "AD"}
              </span>
            </div>
            <span
              className="absolute bottom-0 end-0 block h-2 w-2 rounded-full border-2 border-white dark:border-gray-900 bg-green-500"
              title="Online"
            />
          </div>
          <div className="min-w-0">
            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user?.username || "User"}
            </h5>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <ListMagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={18}
            weight="duotone"
          />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent dark:bg-gray-800 py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Recent Chats label */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Chats</p>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto min-h-0 md:h-[calc(100vh-320px)]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
          </div>
        ) : (
          <>
            {/* Conversation items */}
            {conversations
              .filter((c) => {
                const other =
                  c.participants.find((p) => p._id !== currentUserId) ||
                  c.participants[0];
                return other && filterSearch(other.username);
              })
              .map((conversation) => {
                const otherUser =
                  conversation.participants.find(
                    (p) => p._id !== currentUserId,
                  ) || conversation.participants[0];
                if (!otherUser) return null;
                const isActive =
                  isConversationRoute &&
                  currentConversationId === conversation._id;
                const lastMsg = conversation.lastMessage as
                  | { content?: string }
                  | undefined;
                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleConversationClick(conversation._id)}
                    className={`flex cursor-pointer items-center justify-between gap-2 py-4 px-4 transition-colors ${
                      isActive
                        ? "bg-primary-50/20 dark:bg-primary-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="relative min-w-12 shrink-0">
                        {otherUser.image ? (
                          <img
                            src={otherUser.image}
                            alt={otherUser.username}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-100/30 dark:bg-primary-900/30 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                              {otherUser.username.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {(otherUser as { active?: boolean }).active && (
                          <span className="absolute bottom-0 end-0 block h-2 w-2 rounded-full border-2 border-white dark:border-gray-900 bg-green-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                          {conversation.isGroup
                            ? conversation.groupName
                            : otherUser.username}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {lastMsg?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      {conversation.lastMessageAt
                        ? new Date(
                            conversation.lastMessageAt,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </div>
                    {conversation.unreadCount &&
                      conversation.unreadCount > 0 && (
                        <span className="shrink-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-medium text-white">
                          {conversation.unreadCount > 99
                            ? "99+"
                            : conversation.unreadCount}
                        </span>
                      )}
                  </div>
                );
              })}

            {/* Users to start new chat (not in any conversation yet) */}
            {usersWithoutChat.filter((u) => filterSearch(u.username)).length >
              0 && (
              <>
                <div className="px-4 pt-2 pb-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Start new chat
                  </p>
                </div>
                {usersWithoutChat
                  .filter((u) => filterSearch(u.username))
                  .map((targetUser) => (
                    <div
                      key={targetUser._id}
                      onClick={() => handleUserClick(targetUser)}
                      className="flex cursor-pointer items-center justify-between gap-2 py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="relative min-w-12 shrink-0">
                          {targetUser.image ? (
                            <img
                              src={targetUser.image}
                              alt={targetUser.username}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-primary-100/30 dark:bg-primary-900/30 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                {targetUser.username
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span
                            className={`absolute bottom-0 end-0 block h-2 w-2 rounded-full border-2 border-white dark:border-gray-900 ${
                              targetUser.online ? "bg-green-500" : "bg-gray-400"
                            }`}
                            title={targetUser.online ? "Online" : "Offline"}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                            {targetUser.username}
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {targetUser.online ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                      {startingWithId === targetUser._id && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Starting...
                        </span>
                      )}
                    </div>
                  ))}
              </>
            )}

            {conversations.length === 0 && usersWithoutChat.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <ChatCircleDots size={48} className="mb-2" />
                <p className="text-sm">No chats yet</p>
                <p className="text-xs">Select a user above to start</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
