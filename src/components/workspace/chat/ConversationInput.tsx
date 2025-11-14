import { PuiBox } from 'piche.ui';
import { FormEvent, useState } from 'react';

import { AddMedia } from './AddMedia';
import { EmojiList } from './EmojiList';
import { SendMessage } from './SendMessage';
import { StyledConversationInput, StyledInputBox, StyledInputWrapper } from './StyledComponents';
import { VoiceInput } from './VoiceInput';

interface ConversationInputProps {
  conversationTitle: string;
  composerValue: string;
  setComposerValue: (value: string) => void;
  pendingFile: File | null;
  setPendingFile: (file: File | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isSending: boolean;
  onSendMessage: (payload: { text: string; file?: File | null }) => Promise<void>;
}

export function ConversationInput({
  conversationTitle,
  composerValue,
  setComposerValue,
  pendingFile,
  setPendingFile,
  onSubmit,
  isSending,
  onSendMessage,
}: ConversationInputProps) {
  const [isInputActive, setIsInputActive] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    setComposerValue(composerValue + emoji);
  };

  return (
    <StyledInputWrapper>
      {pendingFile && (
        <PuiBox
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#f6f8ff',
            padding: '8px 12px',
            borderRadius: '12px',
          }}
        >
          <img
            src={URL.createObjectURL(pendingFile)}
            alt="Attachment preview"
            style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '12px' }}
          />
          <button
            type="button"
            onClick={() => setPendingFile(null)}
            aria-label="Remove attachment"
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#939393' }}
          >
            ✕
          </button>
        </PuiBox>
      )}
      <StyledConversationInput
        className={isInputActive ? 'active' : ''}
        component="form"
        onSubmit={onSubmit}
      >
        <StyledInputBox>
          <AddMedia onFileSelect={(file) => setPendingFile(file)} />
          <EmojiList onEmojiSelect={handleEmojiSelect} />
          <input
            type="text"
            placeholder={`Message ${conversationTitle}`}
            value={composerValue}
            onChange={(event) => setComposerValue(event.target.value)}
            onFocus={() => setIsInputActive(true)}
            onBlur={() => setIsInputActive(false)}
            className="chat-panel__composer-input"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              fontFamily: 'Poppins, Inter, sans-serif',
              color: '#272727',
            }}
          />
          <VoiceInput />
          {(composerValue.trim() || pendingFile) && (
            <>
              <div
                style={{
                  width: '1px',
                  height: '24px',
                  background: '#f0f0f0',
                  margin: '0 11px',
                }}
              />
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
        </StyledInputBox>
      </StyledConversationInput>
    </StyledInputWrapper>
  );
}
