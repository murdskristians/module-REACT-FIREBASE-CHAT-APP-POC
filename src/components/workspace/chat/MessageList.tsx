import { PuiBox, PuiStack } from 'piche.ui';
import { FC, useEffect, useRef } from 'react';

import type { ConversationMessage, MessageReply } from '../../../firebase/conversations';
import type { Contact } from '../../../firebase/users';
import { MessageCard } from './MessageCard';

interface MessageListProps {
  messages: ConversationMessage[];
  currentUserId: string;
  isGroup?: boolean;
  contactsMap: Map<string, Contact>;
  conversationAvatarColor?: string | null;
  counterpartId?: string;
  conversationId: string;
  highlightedMessageId?: string | null;
  onMessageDeleted?: () => void;
  onReply?: (replyTo: MessageReply) => void;
  onForward?: (message: ConversationMessage) => void;
}

export const MessageList: FC<MessageListProps> = ({
  messages,
  currentUserId,
  isGroup = false,
  contactsMap,
  conversationAvatarColor,
  counterpartId,
  conversationId,
  highlightedMessageId,
  onMessageDeleted,
  onReply,
  onForward,
}) => {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <PuiBox
      ref={listRef}
      className="messages-container"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingBottom: '24px',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#d1d5db',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#9ca3af',
        },
      }}
    >
      <PuiStack
        sx={{
          width: '100%',
          gap: '4px',
          padding: '0 32px',
        }}
      >
        {messages.length === 0 ? (
          <PuiBox
            sx={{
              textAlign: 'center',
              color: '#939393',
              fontSize: '13px',
              marginTop: '40px',
            }}
          >
            No messages yet. Be the first to say hello.
          </PuiBox>
        ) : (
          messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const isUserMessage = message.senderId === currentUserId;
            const messageTime = message.createdAt?.toMillis?.() ?? message.createdAt?.toDate?.()?.getTime() ?? 0;
            const prevMessageTime = prevMessage?.createdAt?.toMillis?.() ?? prevMessage?.createdAt?.toDate?.()?.getTime() ?? 0;
            const sequenceStarted =
              !prevMessage ||
              prevMessage.senderId !== message.senderId ||
              messageTime - prevMessageTime >
                5 * 60 * 1000; // 5 minutes

            const senderProfile = contactsMap.get(message.senderId);
            const isCounterpartMessage = !isGroup && message.senderId === counterpartId;
            const avatarColor = isCounterpartMessage && conversationAvatarColor
              ? conversationAvatarColor
              : senderProfile?.avatarColor ?? '#A8D0FF';

            if (!isUserMessage) {
              console.log('[MessageList] Message Avatar Debug', {
                messageId: message.id,
                senderId: message.senderId,
                senderName: message.senderName,
                senderProfileFound: !!senderProfile,
                senderProfileDisplayName: senderProfile?.displayName ?? 'not found',
                senderProfileAvatarUrl: senderProfile?.avatarUrl ?? 'null/undefined',
                messageSenderAvatarUrl: message.senderAvatarUrl ?? 'null/undefined',
                senderProfileAvatarColor: senderProfile?.avatarColor ?? 'not found',
                conversationAvatarColor,
                counterpartId,
                isCounterpartMessage,
                finalAvatarColor: avatarColor,
              });
            }

            return (
              <MessageCard
                key={message.id}
                message={message}
                isUserMessage={isUserMessage}
                sequenceStarted={sequenceStarted}
                senderName={!isUserMessage ? (senderProfile?.displayName || message.senderName) : undefined}
                senderAvatar={!isUserMessage ? senderProfile?.avatarUrl : undefined}
                senderAvatarColor={!isUserMessage ? avatarColor : undefined}
                isGroup={isGroup}
                conversationId={conversationId}
                isHighlighted={highlightedMessageId === message.id}
                onMessageDeleted={onMessageDeleted}
                onReply={onReply}
                onForward={onForward}
                contactsMap={contactsMap}
              />
            );
          })
        )}
      </PuiStack>
    </PuiBox>
  );
};
