import { format, isToday, isYesterday } from 'date-fns';
import type firebase from 'firebase/compat/app';
import { ChangeEvent } from 'react';

import type { Contact } from '../../firebase/users';
import { Avatar } from './shared/Avatar';
import type { ViewConversation } from './Workspace';

type ConversationListProps = {
  conversations: ViewConversation[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  contactsMap: Map<string, Contact>;
  currentUserId: string;
  onAddConversation?: () => void;
};

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
  onAddConversation,
}: ConversationListProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <section className="conversation-panel" aria-label="Conversation list">
      <label className="conversation-panel__search">
        <button
          type="button"
          className="conversation-panel__search-button"
          onClick={onAddConversation}
        >
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
        {conversations.map((conversation) => {
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

          const lastMessageText =
            conversation.lastMessage?.type === 'image'
              ? `${
                  conversation.lastMessage.senderName ?? 'Someone'
                } sent a photo`
              : conversation.lastMessage?.text ?? 'No messages yet';

          const isGroupConversation = conversation.participants.length > 2;
          const currentUserProfile = contactsMap.get(currentUserId);
          const currentUserAvatarUrl = currentUserProfile?.avatarUrl ?? null;
          const avatarUrl = isGroupConversation
            ? conversation.displayAvatarUrl ?? conversation.avatarUrl ?? null
            : conversation.displayAvatarUrl ??
              (conversation.avatarUrl !== currentUserAvatarUrl
                ? conversation.avatarUrl
                : null) ??
              counterpart?.avatarUrl ??
              null;

          console.log('[ConversationList] Avatar Debug', {
            conversationId: conversation.id,
            displayTitle: counterpart?.displayName ?? conversation.title,
            counterpartId,
            counterpartFound: !!counterpart,
            counterpartAvatarUrl: counterpart?.avatarUrl ?? 'null/undefined',
            conversationDisplayAvatarUrl:
              conversation.displayAvatarUrl ?? 'null/undefined',
            conversationAvatarUrl: conversation.avatarUrl ?? 'null/undefined',
            currentUserAvatarUrl: currentUserAvatarUrl ?? 'null/undefined',
            isGroupConversation,
            finalAvatarUrl: avatarUrl ?? 'null',
            displayAvatarColor: conversation.displayAvatarColor,
          });

          return (
            <li key={conversation.id}>
              <button
                type="button"
                className={`conversation-panel__item ${
                  isActive ? 'conversation-panel__item--active' : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <Avatar
                  className="conversation-panel__avatar"
                  avatarUrl={avatarUrl}
                  name={displayTitle}
                  avatarColor={conversation.displayAvatarColor}
                  size={40}
                />
                <span className="conversation-panel__item-content">
                  <span className="conversation-panel__item-header">
                    <span className="conversation-panel__item-title">
                      {displayTitle}
                    </span>
                    <time className="conversation-panel__item-time">
                      {formatTimestamp(conversation.updatedAt)}
                    </time>
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
