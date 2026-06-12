import { resolveAvatarUrl } from '../../utils/media';
import { formatDate } from '../../utils/formatters';

function getOtherParty(conversation, userId) {
  if (conversation.buyer?.id === userId) return conversation.seller;
  return conversation.buyer;
}

export default function ConversationList({ conversations, activeId, userId, onSelect }) {
  if (!conversations.length) {
    return (
      <div className="p-4 text-center text-subtle text-sm">
        Belum ada percakapan
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto">
      {conversations.map((conv) => {
        const other = getOtherParty(conv, userId);
        const isActive = conv.id === activeId;
        return (
          <li key={conv.id}>
            <button
              type="button"
              onClick={() => onSelect(conv.id)}
              className={`w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${
                isActive ? 'bg-primary/5 dark:bg-primary/10' : ''
              }`}
            >
              <img
                src={resolveAvatarUrl(other?.profileImage)}
                alt={other?.fullName || 'User'}
                className="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-gray-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-heading truncate">
                    {other?.fullName || 'Pengguna'}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                {conv.product && (
                  <p className="text-xs text-subtle truncate">{conv.product.title}</p>
                )}
                {conv.lastMessage && (
                  <p className="text-xs text-muted truncate mt-0.5">
                    {conv.lastMessage.isMine ? 'Anda: ' : ''}
                    {conv.lastMessage.content}
                  </p>
                )}
                {conv.lastMessage?.createdAt && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(conv.lastMessage.createdAt)}
                  </p>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
