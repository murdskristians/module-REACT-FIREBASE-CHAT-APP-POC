import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import type firebaseCompat from 'firebase/compat/app';

import { PuiIcon, PuiSvgIcon } from 'piche.ui';

import type { ConversationMessage } from '../../../firebase/conversations';
import type { ViewConversation } from '../Workspace';
import { AddMedia } from './AddMedia';
import { MessageBubble } from './MessageBubble';
import { SendMessage } from './SendMessage';
import { VoiceInput } from './VoiceInput';

type ChatViewProps = {
  user: firebaseCompat.User;
  conversation: ViewConversation | null;
  messages: ConversationMessage[];
  onSendMessage: (payload: {
    text: string;
    file?: File | null;
  }) => Promise<void>;
  isSending: boolean;
};

export function ChatView({
  user,
  conversation,
  messages,
  onSendMessage,
  isSending,
}: ChatViewProps) {
  const [composerValue, setComposerValue] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!conversation) {
      setComposerValue('');
      setPendingFile(null);
    }
  }, [conversation]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
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
      <section
        className="chat-panel chat-panel--empty"
        aria-label="Conversation area"
      >
        <div className="chat-panel__empty">
          <h2>Select a conversation</h2>
          <p>Choose a contact from the list to start chatting.</p>
        </div>
      </section>
    );
  }

  const conversationInitials = conversation.displayTitle
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="chat-panel" aria-label="Conversation area">
      <header className="chat-panel__header">
        <div className="chat-panel__contact">
          <div
            className="chat-panel__avatar"
            style={{
              background: conversation.displayAvatarUrl
                ? undefined
                : conversation.displayAvatarColor ?? '#A8D0FF',
            }}
          >
            {conversation.displayAvatarUrl ? (
              <img
                src={conversation.displayAvatarUrl}
                alt={conversation.displayTitle}
              />
            ) : (
              conversationInitials
            )}
          </div>
          <div className="chat-panel__meta">
            <h2>{conversation.displayTitle}</h2>
            <p>{conversation.displaySubtitle}</p>
          </div>
        </div>
        <div className="chat-panel__actions">
          <button
            type="button"
            className="chat-panel__action"
            aria-label="Add participant"
            title="Add participant"
          >
            <PuiSvgIcon
              width={20}
              height={20}
              icon={PuiIcon.UserPlus1}
            />
          </button>
          <button
            type="button"
            className="chat-panel__action chat-panel__action--call"
            aria-label="Start a call"
            title="Start a call"
          >
            <PuiSvgIcon
              width={16}
              height={16}
              icon={PuiIcon.Phone}
            />
          </button>
        </div>
      </header>

      <div className="chat-panel__messages">
        <ul className="chat-messages" ref={listRef}>
          {messages.length === 0 ? (
            <li className="chat-messages__empty">
              No messages yet. Be the first to say hello.
            </li>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === user.uid}
              />
            ))
          )}
        </ul>
      </div>

      <form className="chat-panel__composer" onSubmit={handleSubmit}>
        {pendingFile ? (
          <div className="chat-panel__preview">
            <img
              src={URL.createObjectURL(pendingFile)}
              alt="Attachment preview"
            />
            <button
              type="button"
              onClick={() => setPendingFile(null)}
              aria-label="Remove attachment"
            >
              ✕
            </button>
          </div>
        ) : null}
        <div className="chat-panel__composer-row">
          <AddMedia onFileSelect={(file) => setPendingFile(file)} />
          <button
            type="button"
            className="chat-panel__composer-button chat-panel__composer-button--emoji"
            aria-label="Add emoji"
            title="Add emoji"
          >
            <PuiSvgIcon
              width={16}
              height={16}
              icon={PuiIcon.FaceSmile}
            />
          </button>
          <input
            type="text"
            placeholder={`Message ${conversation.displayTitle}`}
            value={composerValue}
            onChange={(event) => setComposerValue(event.target.value)}
            className="chat-panel__composer-input"
          />
          <VoiceInput />
          {(composerValue.trim() || pendingFile) && (
            <>
              <div className="chat-panel__composer-divider"></div>
              <SendMessage
                handleSend={async () => {
                  const text = composerValue.trim();
                  if (!text && !pendingFile) return;
                  await onSendMessage({ text, file: pendingFile });
                  setComposerValue('');
                  setPendingFile(null);
                }}
                disabled={isSending}
              />
            </>
          )}
        </div>
      </form>
    </section>
  );
}
