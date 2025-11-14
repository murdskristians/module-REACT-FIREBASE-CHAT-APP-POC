import { FormEvent, useEffect, useState } from 'react';
import type firebaseCompat from 'firebase/compat/app';

import { PuiStack, PuiTypography } from 'piche.ui';

import type { ConversationMessage } from '../../../firebase/conversations';
import type { Contact } from '../../../firebase/users';
import type { ViewConversation } from '../Workspace';
import { ConversationInput } from './ConversationInput';
import { ConversationTopBar } from './ConversationTopBar';
import { MessageList } from './MessageList';
import { ChatAreaWrapper, MessagesContainer } from './StyledComponents';

type ChatViewProps = {
  user: firebaseCompat.User;
  conversation: ViewConversation | null;
  messages: ConversationMessage[];
  onSendMessage: (payload: { text: string; file?: File | null }) => Promise<void>;
  isSending: boolean;
  contactsMap: Map<string, Contact>;
  onContactClick?: () => void;
};

export function ChatView({ user, conversation, messages, onSendMessage, isSending, contactsMap, onContactClick }: ChatViewProps) {
  const [composerValue, setComposerValue] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    if (!conversation) {
      setComposerValue('');
      setPendingFile(null);
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

    if (!conversation) {
      return;
    }

    const text = composerValue.trim();
    if (!text && !pendingFile) {
      return;
    }

    await onSendMessage({ text, file: pendingFile });

    setComposerValue('');
    setPendingFile(null);
  };

  if (!conversation) {
    return (
      <PuiStack height="100%" justifyContent="center" alignItems="center" gap="10px">
        <PuiTypography variant="body-m-medium" color="grey.400">
          Select a conversation
        </PuiTypography>
        <PuiTypography variant="body-sm-regular" color="grey.300">
          Choose a contact from the list to start chatting.
        </PuiTypography>
      </PuiStack>
    );
  }

  return (
    <ChatAreaWrapper>
      <ConversationTopBar conversation={conversation} onContactClick={onContactClick} />

      <MessagesContainer>
        <MessageList
          messages={messages}
          currentUserId={user.uid}
          isGroup={conversation.participants.length > 2}
          contactsMap={contactsMap}
        />
      </MessagesContainer>

      <ConversationInput
        conversationTitle={conversation.displayTitle}
        composerValue={composerValue}
        setComposerValue={setComposerValue}
        pendingFile={pendingFile}
        setPendingFile={setPendingFile}
        onSubmit={handleSubmit}
        isSending={isSending}
        onSendMessage={onSendMessage}
      />
    </ChatAreaWrapper>
  );
}
