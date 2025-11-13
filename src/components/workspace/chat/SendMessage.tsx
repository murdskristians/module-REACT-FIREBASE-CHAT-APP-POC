import clsx from 'clsx';
import type { FC, MouseEventHandler } from 'react';
import { PuiBox } from 'piche.ui';
import { SendDisabled, SendGradient } from 'piche.ui';

interface SendMessageProps {
  handleSend: MouseEventHandler;
  disabled?: boolean;
}

export const SendMessage: FC<SendMessageProps> = ({ handleSend, disabled }) => {
  return (
    <PuiBox
      onClick={handleSend}
      className={clsx('chat-panel__composer-send', { disabled })}
    >
      {disabled ? <SendDisabled /> : <SendGradient />}
    </PuiBox>
  );
};
