import type { FC, MouseEventHandler } from 'react';
import { SendDisabled, SendGradient } from 'piche.ui';

interface SendMessageProps {
  handleSend: MouseEventHandler;
  disabled?: boolean;
}

export const SendMessage: FC<SendMessageProps> = ({ handleSend, disabled }) => {
  return (
    <div
      onClick={handleSend}
      className={`chat-panel__composer-send${disabled ? ' disabled' : ''}`}
    >
      {disabled ? <SendDisabled /> : <SendGradient />}
    </div>
  );
};
