import { format, isToday, isYesterday } from 'date-fns';
import type firebase from 'firebase/compat/app';
import { ChangeEvent } from 'react';

import type { Contact } from '../../firebase/users';
import type { ViewConversation } from './Workspace';

type ConversationListProps = {
  conversations: ViewConversation[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  contactsMap: Map<string, Contact>;
  currentUserId: string;
};

const avatarFallbackPalette = ['#FFD37D', '#A8D0FF', '#FFC8DD', '#B5EAEA', '#FFABAB', '#BDB2FF'];

const formatTimestamp = (timestamp?: firebase.firestore.Timestamp | null) => {
  if (!timestamp) {
    return '';
  }

  const date = timestamp.toDate();

  if (isToday(date)) {
    return format(date, 'HH:mm');
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  return format(date, 'd MMM');
};

export function ConversationList({
  conversations,
  onSearchChange,
  searchTerm,
  selectedConversationId,
  onSelectConversation,
  contactsMap,
  currentUserId,
}: ConversationListProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <section className="conversation-panel" aria-label="Conversation list">
      <label className="conversation-panel__search">
        <button type="button" className="conversation-panel__search-button">
          ＋
        </button>
        <input
          type="search"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearchChange}
          aria-label="Search conversations"
        />
      </label>
      <ul className="conversation-panel__list">
        {conversations.map((conversation, index) => {
          const isActive = conversation.id === selectedConversationId;

          const counterpartId =
            conversation.participants.find((id) => id !== currentUserId) ??
            conversation.participants[0] ??
            currentUserId;
          const counterpart = contactsMap.get(counterpartId);

          const displayTitle =
            counterpart?.displayName ??
            counterpart?.email ??
            conversation.title ??
            'Conversation';
          const subtitle =
            counterpart?.status ?? conversation.subtitle ?? counterpart?.email ?? '';

          const lastMessageText =
            conversation.lastMessage?.type === 'image'
              ? `${conversation.lastMessage.senderName ?? 'Someone'} sent a photo`
              : conversation.lastMessage?.text ?? 'No messages yet';

          const fallbackColor =
            counterpart?.avatarColor ??
            conversation.avatarColor ??
            avatarFallbackPalette[index % avatarFallbackPalette.length];
          const avatarUrl = counterpart?.avatarUrl ?? conversation.avatarUrl ?? null;

          return (
            <li key={conversation.id}>
              <button
                type="button"
                className={`conversation-panel__item ${isActive ? 'conversation-panel__item--active' : ''}`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <span
                  className="conversation-panel__avatar"
                  style={{
                    background: avatarUrl ? undefined : fallbackColor,
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" aria-hidden="true" />
                  ) : (
                    displayTitle
                      .trim()
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || 'U'
                  )}
                </span>
                <span className="conversation-panel__item-content">
                  <span className="conversation-panel__item-header">
                    <span className="conversation-panel__item-title">{displayTitle}</span>
                    <time className="conversation-panel__item-time">{formatTimestamp(conversation.updatedAt)}</time>
                  </span>
                  <span className="conversation-panel__item-subtitle conversation-panel__item-subtitle--message">
                    {lastMessageText}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

