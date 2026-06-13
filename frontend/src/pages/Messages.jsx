import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ConversationList from '../components/chat/ConversationList';
import ChatPanel from '../components/chat/ChatPanel';
import Loading from '../components/common/Loading';
import Breadcrumb from '../components/common/Breadcrumb';
import { messagesTrail } from '../utils/breadcrumbs';
import { getConversations } from '../services/chat';
import { useAuthStore } from '../store/useAuthStore';

function MessagesContent() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(!!conversationId);

  const loadConversations = async () => {
    try {
      const { data } = await getConversations();
      setConversations(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId) setMobileShowChat(true);
  }, [conversationId]);

  useEffect(() => {
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectConversation = (id) => {
    navigate(`/messages/${id}`);
    setMobileShowChat(true);
  };

  const activeId = conversationId ? parseInt(conversationId, 10) : null;
  const activeConversation = conversations.find((conv) => conv.id === activeId);
  const chatPartner = activeConversation
    ? (activeConversation.buyer?.id === user?.id
        ? activeConversation.seller
        : activeConversation.buyer)
    : null;

  if (loading) return <Loading />;

  return (
    <div className="max-w-content mx-auto px-4 py-6 h-[calc(100vh-8rem)]">
      <Breadcrumb items={messagesTrail(chatPartner?.fullName)} />
      <h1 className="text-2xl font-bold text-heading mb-4">Pesan</h1>
      <div className="surface-card overflow-hidden flex h-[calc(100%-3rem)] min-h-[400px]">
        <aside
          className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 ${
            mobileShowChat && conversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            userId={user?.id}
            onSelect={handleSelectConversation}
          />
        </aside>
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            mobileShowChat && conversationId ? 'flex' : 'hidden md:flex'
          }`}
        >
          <ChatPanel
            conversationId={activeId}
            userId={user?.id}
            onSent={loadConversations}
          />
        </div>
      </div>
    </div>
  );
}

export default function Messages() {
  return (
    <ProtectedRoute>
      <MessagesContent />
    </ProtectedRoute>
  );
}
