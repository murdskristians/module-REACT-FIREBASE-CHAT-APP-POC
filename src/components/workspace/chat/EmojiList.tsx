import clsx from 'clsx';
import type { EmojiClickData } from 'emoji-picker-react';
import EmojiPicker from 'emoji-picker-react';
import { PuiBox, PuiClickAwayListener, PuiIcon, PuiSvgIcon } from 'piche.ui';
import { useState } from 'react';

import { StyledEmojiWrapper, StyledEmojiButton } from './StyledComponents';

interface EmojiListProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiList = ({ onEmojiSelect }: EmojiListProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    open && setOpen(false);
  };

  const handleEmojiClick = (data: EmojiClickData) => {
    onEmojiSelect(data.emoji);
  };

  return (
    <PuiBox position='relative'>
      {open && (
        <>
          <PuiBox
            onClick={handleClose}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
            }}
          />
          <PuiClickAwayListener onClickAway={handleClose}>
            <StyledEmojiWrapper onClick={e => e.stopPropagation()}>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                skinTonesDisabled
                searchPlaceholder='Search emoji'
                width={336}
                height={552}
                previewConfig={{ showPreview: false }}
              />
            </StyledEmojiWrapper>
          </PuiClickAwayListener>
        </>
      )}
      <StyledEmojiButton
        className={clsx({ 'menu-is-open': open })}
        onClick={() => setOpen(true)}
        type="button"
        aria-label="Add emoji"
        title="Add emoji"
      >
        <PuiSvgIcon
          width={16}
          height={16}
          icon={PuiIcon.FaceSmile}
        />
      </StyledEmojiButton>
    </PuiBox>
  );
};

