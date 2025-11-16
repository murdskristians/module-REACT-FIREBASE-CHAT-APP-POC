import { PuiBox, PuiButton, PuiIcon, PuiStack, PuiSvgIcon, PuiTypography } from 'piche.ui';
import type { FC, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { AiMessage } from '../../../firebase/ai';
import { AiMessageCard } from './AiMessageCard';

interface AiChatViewProps {
  messages: AiMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isSending: boolean;
  conversationTitle?: string;
  onShowHistory: () => void;
  onNewConversation: () => void;
}

export const AiChatView: FC<AiChatViewProps> = ({
  messages,
  onSendMessage,
  isSending,
  conversationTitle = 'AI Assistant',
  onShowHistory,
  onNewConversation,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isInputActive, setIsInputActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!inputValue.trim() || isSending) return;

    const messageToSend = inputValue;
    setInputValue('');

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally restore the message in case of error
      setInputValue(messageToSend);
    }
  };

  return (
    <PuiStack
      sx={{
        flex: 1,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Chat header */}
      <PuiStack
        sx={{
          padding: '12px 24px',
          borderBottom: '1px solid #e5e7eb',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <PuiSvgIcon
          icon={PuiIcon.Ai}
          width={24}
          height={24}
          sx={{ color: '#6366f1' }}
        />
        <PuiTypography
          variant="body-lg-semibold"
          sx={{
            fontSize: '12px',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {conversationTitle}
        </PuiTypography>

        {/* Action buttons */}
        <PuiButton
          onClick={onNewConversation}
          sx={{
            padding: '8px 12px',
            background: '#3398DB',
            color: '#ffffff',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'background 0.2s',
            '&:hover': {
              background: '#2980b9',
            },
          }}
        >
          New
        </PuiButton>
        <PuiButton
          onClick={onShowHistory}
          sx={{
            padding: '8px 12px',
            background: '#3398DB',
            color: '#ffffff',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'background 0.2s',
            '&:hover': {
              background: '#2980b9',
            },
          }}
        >
          History
        </PuiButton>
      </PuiStack>

      {/* Messages area */}
      <PuiStack
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          gap: '12px',
        }}
      >
        {messages.length === 0 ? (
          <PuiStack
            sx={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <PuiSvgIcon
              icon={PuiIcon.Ai}
              width={48}
              height={48}
              sx={{ color: '#6366f1', opacity: 0.5 }}
            />
            <PuiTypography
              variant="body-m-regular"
              sx={{ color: '#9ca3af', textAlign: 'center' }}
            >
              Start a conversation with AI Assistant
            </PuiTypography>
          </PuiStack>
        ) : (
          messages.map((message) => (
            <AiMessageCard key={message.id} message={message} />
          ))
        )}

        {isSending && (
          <PuiStack
            sx={{
              flexDirection: 'row',
              gap: '8px',
              padding: '12px',
              alignItems: 'center',
            }}
          >
            <PuiSvgIcon
              icon={PuiIcon.Ai}
              width={16}
              height={16}
              sx={{ color: '#6366f1' }}
            />
            <PuiTypography
              variant="body-m-regular"
              sx={{ color: '#9ca3af', fontStyle: 'italic' }}
            >
              AI is typing...
            </PuiTypography>
          </PuiStack>
        )}

        <div ref={messagesEndRef} />
      </PuiStack>

      {/* Input area */}
      <PuiBox
        sx={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color, #e5e7eb)',
        }}
      >
        <PuiBox
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            gap: '12px',
            background: 'var(--bg-tertiary, #f9fafb)',
            borderRadius: '12px',
            padding: '12px 16px',
            border: isInputActive ? '2px solid #6366f1' : '2px solid var(--border-color, transparent)',
            transition: 'border-color 0.2s',
          }}
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsInputActive(true)}
            onBlur={() => setIsInputActive(false)}
            disabled={isSending}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              resize: 'none',
              color: 'var(--text-primary, #1f2131)',
            }}
          />
          <PuiButton
            type="submit"
            disabled={!inputValue.trim() || isSending}
            sx={{
              minWidth: 'auto',
              padding: '8px 16px',
              background: inputValue.trim() && !isSending ? '#6366f1' : 'var(--bg-tertiary, #e5e7eb)',
              color: inputValue.trim() && !isSending ? '#ffffff' : 'var(--text-secondary, #9ca3af)',
              borderRadius: '8px',
              border: 'none',
              cursor: inputValue.trim() && !isSending ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              '&:hover': {
                background: inputValue.trim() && !isSending ? '#4f46e5' : 'var(--bg-tertiary, #e5e7eb)',
              },
            }}
          >
            <PuiSvgIcon icon={PuiIcon.Send} width={16} height={16} />
          </PuiButton>
        </PuiBox>
      </PuiBox>
    </PuiStack>
  );
};
