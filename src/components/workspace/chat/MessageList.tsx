import { PuiBox, PuiStack } from 'piche.ui';
import { FC, useEffect, useRef } from 'react';

import type { ConversationMessage } from '../../../firebase/conversations';
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
  onMessageDeleted?: () => void;
}

export const MessageList: FC<MessageListProps> = ({
  messages,
  currentUserId,
  isGroup = false,
  contactsMap,
  conversationAvatarColor,
  counterpartId,
  conversationId,
  onMessageDeleted,
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
        position: 'relative',
        flexGrow: 1,
        overflowY: 'auto',
        height: '100%',
        paddingBottom: '24px',
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
                onMessageDeleted={onMessageDeleted}
              />
            );
          })
        )}
      </PuiStack>
    </PuiBox>
  );
};
