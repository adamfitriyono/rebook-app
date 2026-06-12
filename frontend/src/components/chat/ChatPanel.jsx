import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import Loading from '../common/Loading';
import { getMessages, sendMessage, markAsRead } from '../../services/chat';
import { resolveAvatarUrl } from '../../utils/media';
import { formatDate } from '../../utils/formatters';

export default function ChatPanel({ conversationId, userId, onSent }) {
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const loadMessages = async () => {
    if (!conversationId) return;
    try {
      const { data } = await getMessages(conversationId);
      setConversation(data.data.conversation);
      setMessages(data.data.messages);
      await markAsRead(conversationId);
      onSent?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return undefined;
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    try {
      setSending(true);
      const { data } = await sendMessage(conversationId, content);
      setMessages((prev) => [...prev, data.data]);
      setInput('');
      onSent?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-subtle text-sm p-8">
        Pilih percakapan untuk mulai chat
      </div>
    );
  }

  if (loading) return <Loading />;

  const other =
    conversation?.buyer?.id === userId ? conversation?.seller : conversation?.buyer;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 shrink-0">
        <img
          src={resolveAvatarUrl(other?.profileImage)}
          alt={other?.fullName || 'User'}
          className="w-10 h-10 rounded-full object-cover bg-gray-100 dark:bg-gray-700"
        />
        <div>
          <p className="font-semibold text-heading">{other?.fullName || 'Pengguna'}</p>
          {conversation?.product && (
            <p className="text-xs text-subtle">{conversation.product.title}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                msg.isMine
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-heading rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.isMine ? 'text-white/70' : 'text-gray-400'}`}>
                {formatDate(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan..."
          maxLength={1000}
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="btn-primary px-4 py-2 flex items-center gap-1 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
