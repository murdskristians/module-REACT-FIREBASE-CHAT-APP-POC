import { format, isToday, isYesterday } from 'date-fns';
import type firebase from 'firebase/compat/app';
import { ChangeEvent, MouseEvent, useState } from 'react';
import { PuiIcon, PuiSvgIcon } from 'piche.ui';

import { Avatar } from './shared/Avatar';
import type { ViewConversation } from './Workspace';

type ConversationListProps = {
  conversations: ViewConversation[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onAddConversation?: () => void;
  onPinToggle: (conversationId: string, isPinned: boolean) => void;
  onHideToggle: (conversationId: string, isHidden: boolean) => void;
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
  onAddConversation,
  onPinToggle,
  onHideToggle,
}: ConversationListProps) {
  const [contextMenu, setContextMenu] = useState<{
    conversationId: string;
    x: number;
    y: number;
  } | null>(null);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleContextMenu = (
    e: MouseEvent<HTMLButtonElement>,
    conversationId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      conversationId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handlePinToggle = (conversationId: string, isPinned: boolean) => {
    onPinToggle(conversationId, !isPinned);
    handleCloseContextMenu();
  };

  const handleHideToggle = (conversationId: string, isHidden: boolean) => {
    onHideToggle(conversationId, !isHidden);
    handleCloseContextMenu();
  };

  return (
    <section className="conversation-panel" aria-label="Conversation list">
      <label className="conversation-panel__search">
        <button
          type="button"
          className="conversation-panel__search-button"
          onClick={() => {
            if (onAddConversation) {
              onAddConversation();
            }
          }}
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

          const displayTitle = conversation.displayTitle ?? 'Conversation';

          const lastMessageText =
            conversation.lastMessage?.type === 'image'
              ? `${
                  conversation.lastMessage.senderName ?? 'Someone'
                } sent a photo`
              : conversation.lastMessage?.text ?? 'No messages yet';

          const avatarUrl = conversation.displayAvatarUrl ?? null;

          const isPrivate = conversation.type === 'private';
          const isPinned = isPrivate ? true : conversation.isPinned ?? false;
          const isHidden = conversation.isHidden ?? false;

          return (
            <li key={conversation.id} style={{ position: 'relative' }}>
              <button
                type="button"
                className={`conversation-panel__item ${
                  isActive ? 'conversation-panel__item--active' : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
                onContextMenu={(e) => {
                  if (!isPrivate) {
                    handleContextMenu(e, conversation.id);
                  }
                }}
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
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {isPinned && (
                        <PuiSvgIcon
                          width={14}
                          height={14}
                          icon={PuiIcon.Pin2}
                          style={{ flexShrink: 0 }}
                        />
                      )}
                      <time className="conversation-panel__item-time">
                        {formatTimestamp(conversation.updatedAt)}
                      </time>
                    </span>
                  </span>
                  <span className="conversation-panel__item-subtitle conversation-panel__item-subtitle--message">
                    {lastMessageText}
                  </span>
                </span>
              </button>
              {contextMenu?.conversationId === conversation.id &&
                !isPrivate && (
                  <>
                    <div
                      className="popup-overlay"
                      onClick={handleCloseContextMenu}
                    />
                    <div
                      className="popup-menu"
                      style={{
                        position: 'fixed',
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`,
                        bottom: 'auto',
                        transform: 'translateY(-100%)',
                      }}
                    >
                      <button
                        type="button"
                        className="popup-menu-item"
                        onClick={() =>
                          handlePinToggle(conversation.id, isPinned)
                        }
                      >
                        <PuiSvgIcon
                          width={16}
                          height={16}
                          icon={PuiIcon.Pin2}
                        />
                        <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                      </button>
                      <button
                        type="button"
                        className="popup-menu-item"
                        onClick={() =>
                          handleHideToggle(conversation.id, isHidden)
                        }
                      >
                        <PuiSvgIcon
                          width={16}
                          height={16}
                          icon={isHidden ? PuiIcon.Eye : PuiIcon.EyeOff}
                        />
                        <span>{isHidden ? 'Unhide' : 'Hide'}</span>
                      </button>
                    </div>
                  </>
                )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
