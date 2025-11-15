import { FormEvent, useEffect, useMemo, useState } from 'react';
import type firebaseCompat from 'firebase/compat/app';

import { PuiStack, PuiTypography } from 'piche.ui';

import type { ConversationMessage, MessageReply } from '../../../firebase/conversations';
import type { Contact } from '../../../firebase/users';
import type { ViewConversation } from '../Workspace';
import { createViewConversationFromContact } from '../utils';
import { ConversationInput } from './ConversationInput';
import { ConversationTopBar } from './ConversationTopBar';
import { MessageList } from './MessageList';
import { PinnedMessages } from './PinnedMessages';
import { ChatAreaWrapper, MessagesContainer } from './StyledComponents';

type ChatViewProps = {
  user: firebaseCompat.User;
  conversation: ViewConversation | null;
  messages: ConversationMessage[];
  onSendMessage: (payload: {
    text: string;
    file?: File | null;
    replyTo?: MessageReply | null;
  }) => Promise<void>;
  isSending: boolean;
  contactsMap: Map<string, Contact>;
  pendingUser?: Contact | null;
  onContactClick?: () => void;
};

export function ChatView({
  user,
  conversation,
  messages,
  onSendMessage,
  isSending,
  contactsMap,
  pendingUser,
  onContactClick,
}: ChatViewProps) {
  const [composerValue, setComposerValue] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<MessageReply | null>(null);

  useEffect(() => {
    if (!conversation) {
      setComposerValue('');
      setPendingFile(null);
      setReplyTo(null);
    }
  }, [conversation]);

  useEffect(() => {
    if (!messages.length) {
      setComposerValue('');
      setPendingFile(null);
    }
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!conversation && !pendingUser) {
      return;
    }

    const text = composerValue.trim();
    if (!text && !pendingFile) {
      return;
    }

    await onSendMessage({ text, file: pendingFile, replyTo });

    setComposerValue('');
    setPendingFile(null);
    setReplyTo(null);
  };

  const displayConversation: ViewConversation | null =
    conversation ||
    (pendingUser
      ? createViewConversationFromContact(pendingUser, 'pending', user.uid)
      : null);

  // Show empty state for pending conversations
  const isPendingConversation = displayConversation?.id === 'pending';
  const displayMessages = useMemo(() => {
    return isPendingConversation ? [] : messages;
  }, [isPendingConversation, messages]);

  // All hooks must be called before any early return
  const pinnedMessages = useMemo(() => {
    return displayMessages.filter(msg => msg.isPinned);
  }, [displayMessages]);

  if (!displayConversation) {
    return (
      <PuiStack
        height="100%"
        justifyContent="center"
        alignItems="center"
        gap="10px"
      >
        <PuiTypography variant="body-m-medium" color="grey.400">
          Select a conversation
        </PuiTypography>
        <PuiTypography variant="body-sm-regular" color="grey.300">
          Choose a contact from the list to start chatting.
        </PuiTypography>
      </PuiStack>
    );
  }

  const handlePinnedMessageClick = (messageId: string) => {
    // Scroll to the pinned message
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the message
      setHighlightedMessageId(messageId);
      
      // Remove highlight after 2 seconds
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    }
  };

  return (
    <ChatAreaWrapper>
      <ConversationTopBar
        conversation={displayConversation}
        onContactClick={onContactClick}
      />
      {!isPendingConversation && (
        <PinnedMessages
          messages={displayMessages}
          contactsMap={contactsMap}
          currentUserId={user.uid}
          onMessageClick={handlePinnedMessageClick}
        />
      )}

      <MessagesContainer sx={{ paddingTop: pinnedMessages.length > 0 ? '44px' : 0 }}>
        {isPendingConversation ? (
          <PuiStack
            height="100%"
            justifyContent="center"
            alignItems="center"
            gap="10px"
          >
            <PuiTypography variant="body-m-medium" color="grey.400">
              Start a conversation with{' '}
              {pendingUser?.displayName || 'this user'}
            </PuiTypography>
            <PuiTypography variant="body-sm-regular" color="grey.300">
              Send a message to begin chatting
            </PuiTypography>
          </PuiStack>
        ) : (
          <MessageList
            messages={displayMessages}
            currentUserId={user.uid}
            isGroup={displayConversation.participants.length > 2}
            contactsMap={contactsMap}
            conversationAvatarColor={displayConversation.displayAvatarColor}
            counterpartId={displayConversation.counterpartId}
            conversationId={displayConversation.id}
            highlightedMessageId={highlightedMessageId}
            onMessageDeleted={() => {
              // Messages will automatically update via Firestore subscription
            }}
            onReply={setReplyTo}
          />
        )}
      </MessagesContainer>

      <ConversationInput
        conversationTitle={displayConversation.displayTitle}
        composerValue={composerValue}
        setComposerValue={setComposerValue}
        pendingFile={pendingFile}
        setPendingFile={setPendingFile}
        onSubmit={handleSubmit}
        isSending={isSending}
        onSendMessage={onSendMessage}
        replyTo={replyTo}
        onReplyToChange={setReplyTo}
      />
    </ChatAreaWrapper>
  );
}
