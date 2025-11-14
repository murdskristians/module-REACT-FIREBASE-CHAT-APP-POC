import { PuiIcon, PuiSvgIcon } from 'piche.ui';
import type { FC, MouseEvent } from 'react';
import { useRef, useState } from 'react';

import { ReactionsPopup } from './ReactionsPopup';
import { ReactionIconWrapper } from './StyledComponents';

interface ReactionsProps {
  isUserMessage: boolean;
  messageId: string;
}

export const Reactions: FC<ReactionsProps> = ({ isUserMessage, messageId }) => {
  const [isContextMenuOpened, setIsContextMenuOpened] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsContextMenuOpened(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsContextMenuOpened(false);
    }, 200);
  };

  const handleCloseContextMenu = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsContextMenuOpened(false);
  };

  return (
    <>
      <ReactionIconWrapper
        ref={anchorRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        isOpened={isContextMenuOpened}
      >
        <PuiSvgIcon
          className='reaction-icon'
          icon={PuiIcon.FaceSmile}
        />
      </ReactionIconWrapper>
      <ReactionsPopup
        isOpened={isContextMenuOpened}
        horizontal={isUserMessage ? 'right' : 'left'}
        anchorEl={anchorRef.current}
        messageId={messageId}
        handleClose={handleCloseContextMenu}
      />
    </>
  );
};

