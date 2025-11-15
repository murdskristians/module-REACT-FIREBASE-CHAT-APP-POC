import clsx from 'clsx';
import type { FC, MouseEventHandler } from 'react';
import { PuiBox } from 'piche.ui';
import { SendDisabled, SendGradient } from 'piche.ui';

interface SendMessageProps {
  handleSend: MouseEventHandler;
  disabled?: boolean;
}

export const SendMessage: FC<SendMessageProps> = ({ handleSend, disabled }) => {
  const handleClick: MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      handleSend(e);
    }
  };

  return (
    <PuiBox
      onClick={handleClick}
      className={clsx('chat-panel__composer-send', { disabled })}
    >
      {disabled ? <SendDisabled /> : <SendGradient />}
    </PuiBox>
  );
};
