import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type firebaseCompat from 'firebase/compat/app';

import type { ConversationMessage } from '../../../firebase/conversations';
import type { ViewConversation } from '../Workspace';
import { MessageBubble } from './MessageBubble';
import { SendIcon } from './SendIcon';

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      setPendingFile(file);
    },
    []
  );

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
            aria-label="Open profile"
          >
            👤
          </button>
          <button
            type="button"
            className="chat-panel__action"
            aria-label="Start a call"
          >
            📞
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
          <button
            type="button"
            className="chat-panel__composer-button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach file"
          >
            📎
          </button>
          <input
            type="text"
            placeholder={`Message ${conversation.displayTitle}`}
            value={composerValue}
            onChange={(event) => setComposerValue(event.target.value)}
          />
          <div className="chat-panel__composer-actions">
            <button
              type="submit"
              className="chat-panel__composer-send"
              disabled={isSending || (!composerValue.trim() && !pendingFile)}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </form>
    </section>
  );
}
