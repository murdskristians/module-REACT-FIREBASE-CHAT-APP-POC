import { PuiDivider, PuiFade, PuiIcon, PuiStack } from 'piche.ui';
import type { FC, MouseEvent } from 'react';
import React, { useState } from 'react';

import { MessageReactionsWrapper } from './MessageReactionsWrapper';
import { ConversationMessagePopupItem } from './ConversationMessagePopupItem';
import { PopupChildren } from './PopupChildren';
import { StyledMessagePopup, StyledMessagePopupList, StyledMessagePopupListWrapper } from './StyledComponents';
import type { MessagePopupItemType } from './types';

interface ConversationMessagePopupProps {
  isOpened: boolean;
  position: { top: number; left: number };
  anchorEl: null | HTMLDivElement;
  messageId: string;
  onClose: () => void;
  isOpenedFromRightClick: boolean;
}

// Mock popup options - no logic, matching the order from the photo: Reply, Pin, Copy text, Forward, Delete, Select
const mockPopupOptions: MessagePopupItemType[] = [
  { label: 'Reply', icon: PuiIcon.CornerUpRight, onClick: () => {} },
  { label: 'Pin', icon: PuiIcon.Pin2, onClick: () => {} },
  { label: 'Copy text', icon: PuiIcon.Copy, onClick: () => {} },
  { label: 'Forward', icon: PuiIcon.FlipBackward, onClick: () => {} },
  { label: 'Delete', icon: PuiIcon.Trash, onClick: () => {}, className: 'delete' },
  { label: 'Select', icon: PuiIcon.CheckCircle, onClick: () => {} },
];

export const ConversationMessagePopup: FC<ConversationMessagePopupProps> = ({
  isOpened,
  position,
  anchorEl,
  messageId,
  onClose,
  isOpenedFromRightClick,
}) => {
  const [activeOption, setActiveOption] = useState<MessagePopupItemType | null>(null);

  const handleClose = (e: MouseEvent<HTMLElement>) => {
    onClose();
  };

  return (
    <StyledMessagePopup
      id='conversation-menu'
      elevation={0}
      anchorReference={isOpenedFromRightClick ? 'anchorPosition' : 'anchorEl'}
      anchorPosition={position}
      anchorOrigin={{
        vertical: -16,
        horizontal: -8,
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      anchorEl={anchorEl}
      open={isOpened}
      TransitionComponent={PuiFade}
      onClose={onClose}
      onTransitionExited={() => setActiveOption(null)}
      aria-hidden={false}
    >
      <PuiStack gap='4px'>
        <MessageReactionsWrapper
          messageId={messageId}
          handleClose={handleClose}
        />
        <StyledMessagePopupListWrapper>
          {activeOption ? (
            <PopupChildren
              activeOption={activeOption}
              handleBack={() => setActiveOption(null)}
            />
          ) : (
            <StyledMessagePopupList>
              {mockPopupOptions.map((item, index) => {
                const handleClick = item.children ? () => setActiveOption(item) : item.onClick;

                return (
                  <React.Fragment key={item.label}>
                    <ConversationMessagePopupItem
                      option={item}
                      onClick={handleClick}
                    />
                    {index === mockPopupOptions.length - 2 && <PuiDivider sx={{ margin: '6px 0' }} />}
                  </React.Fragment>
                );
              })}
            </StyledMessagePopupList>
          )}
        </StyledMessagePopupListWrapper>
      </PuiStack>
    </StyledMessagePopup>
  );
};

