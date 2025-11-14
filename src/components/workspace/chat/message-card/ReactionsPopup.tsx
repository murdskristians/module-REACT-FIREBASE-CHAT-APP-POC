import { PuiFade } from 'piche.ui';
import type { FC, MouseEvent } from 'react';

import { MessageReactionsWrapper } from './MessageReactionsWrapper';
import { MessageContextMenuPopup } from './StyledComponents';

interface ReactionsPopupProps {
  isOpened: boolean;
  horizontal: 'left' | 'right';
  anchorEl: null | HTMLDivElement;
  messageId: string;
  handleClose: (e: MouseEvent<HTMLElement>) => void;
}

export const ReactionsPopup: FC<ReactionsPopupProps> = ({
  isOpened,
  anchorEl,
  horizontal = 'right',
  messageId,
  handleClose,
}) => {
  return (
    <MessageContextMenuPopup
      id='message-menu'
      elevation={0}
      anchorOrigin={{
        vertical: 'top',
        horizontal: horizontal,
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: horizontal,
      }}
      anchorEl={anchorEl}
      open={isOpened}
      TransitionComponent={PuiFade}
      horizontal={horizontal}
      onClose={handleClose}
      aria-hidden={false}
    >
      <div onMouseEnter={() => {}} onMouseLeave={handleClose}>
        <MessageReactionsWrapper
          messageId={messageId}
          handleClose={handleClose}
        />
      </div>
    </MessageContextMenuPopup>
  );
};

