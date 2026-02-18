/**
 * Conversation Page
 * 
 * Individual conversation detail page.
 * Accessible at /admin/messages/:conversationId
 * 
 * Features:
 * - Displays chat window for specific conversation
 * - Real-time messaging
 * - Back button to messages list
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { useAuth } from '@/providers/AuthProvider';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/button';

const ConversationPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id ?? '';

  if (!conversationId) {
    return <div>Invalid conversation</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 h-full flex flex-col">
        {/* Back Button */}
        <div className="border-b border-gray-200 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/messages')}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back to Messages
          </Button>
        </div>

        {/* Chat Window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow
            conversationId={conversationId}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
