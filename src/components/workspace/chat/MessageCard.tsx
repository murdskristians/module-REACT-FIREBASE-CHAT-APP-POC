import { PuiIcon, PuiStack, PuiTypography } from 'piche.ui';
import type { FC, MouseEvent } from 'react';
import { useRef, useState } from 'react';

import type { ConversationMessage } from '../../../firebase/conversations';
import { Avatar } from '../shared/Avatar';
import { ConversationMessagePopup } from './message-card/ConversationMessagePopup';
import {
  StyledConversationMessageContent,
  StyledConversationMessageWrapper,
  StyledIconWrapper,
  StyledMessageCardWrapper,
} from './message-card/StyledComponents';
import { TextMessage } from './TextMessage';

interface MessageCardProps {
  message: ConversationMessage;
  isUserMessage: boolean;
  sequenceStarted: boolean;
  senderName?: string;
  senderAvatar?: string;
  senderAvatarColor?: string;
  isGroup?: boolean;
}

const initialPositionState = { top: 0, left: 0 };
const extraWidthOffset = 220;

const getClickPosition = (e: MouseEvent<Element>, extraWidth: number = 0) => {
  return { top: e.clientY, left: e.clientX + extraWidth };
};

export const MessageCard: FC<MessageCardProps> = ({
  message,
  isUserMessage,
  sequenceStarted,
  senderName,
  senderAvatar,
  senderAvatarColor,
  isGroup = false,
}) => {
  const [isContextMenuOpened, setIsContextMenuOpened] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ top: number; left: number }>(initialPositionState);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isOpenedFromRightClick, setIsOpenedFromRightClick] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const time =
    new Date(message?.createdAt?.toDate() ?? '').toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) ?? '';

  const handleOpenContextMenu = (e: MouseEvent<Element>) => {
    e.preventDefault();
    setContextMenuPosition(getClickPosition(e, extraWidthOffset));
    setMenuAnchorEl(e.currentTarget as HTMLElement);
    setIsOpenedFromRightClick(true);
    setIsContextMenuOpened(true);
  };

  const handleOpenContextMenuFromDots = (e: MouseEvent<Element>) => {
    setMenuAnchorEl(e.currentTarget as HTMLElement);
    setIsOpenedFromRightClick(false);
    setIsContextMenuOpened(true);
  };

  const handleCloseContextMenu = () => {
    setIsContextMenuOpened(false);
    setContextMenuPosition(initialPositionState);
  };

  return (
    <>
      <StyledConversationMessageWrapper
        ref={wrapperRef}
        isUserMessage={isUserMessage}
        sx={{
          justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
          paddingLeft: !isUserMessage ? '40px' : '0',
          marginTop: sequenceStarted ? '34px' : '0',
        }}
      >
        <StyledConversationMessageContent
          sx={{
            flexDirection: isUserMessage ? 'row-reverse' : 'row',
          }}
        >
          {!isUserMessage && (
            <Avatar
              avatarUrl={senderAvatar}
              name={senderName || 'User'}
              avatarColor={senderAvatarColor}
              size={32}
              sx={{
                visibility: sequenceStarted ? 'visible' : 'hidden',
              }}
            />
          )}

          <StyledMessageCardWrapper>
            <PuiStack
              className={`message-bubble ${isUserMessage ? 'user-message-bubble' : ''}`}
              onContextMenu={handleOpenContextMenu}
              sx={{
                width: 'min-content',
                flexWrap: 'wrap',
                alignItems: 'end',
                gap: '8px',
                borderRadius: isUserMessage ? '16px 0 16px 16px' : '0px 16px 16px 16px',
                padding: '8px 16px',
                background: isUserMessage ? 'var(--palette-message-bg)' : '#ffffff',
                color: isUserMessage ? '#1f2131' : '#1f2131',
                position: 'relative',
                overflow: 'hidden',
                justifyContent: 'start',
                maxWidth: '100%',
              }}
            >
              {!isUserMessage && senderName && isGroup && (
                <PuiTypography
                  variant="body-sm-medium"
                  sx={{
                    color: '#a0a0a0',
                    marginRight: 'auto',
                    textWrap: 'nowrap',
                    width: '100%',
                    fontFamily: "'Poppins', 'Inter', sans-serif",
                    fontSize: '12px',
                  }}
                >
                  {senderName}
                </PuiTypography>
              )}

              <TextMessage message={message} time={time} isUserMessage={isUserMessage} />
            </PuiStack>
          </StyledMessageCardWrapper>
        </StyledConversationMessageContent>

        <StyledIconWrapper
          className="message-dots-menu"
          isContextMenuOpened={isContextMenuOpened}
          width={16}
          height={16}
          icon={PuiIcon.DotsVertical}
          onClick={handleOpenContextMenuFromDots}
        />
      </StyledConversationMessageWrapper>

      <ConversationMessagePopup
        isOpened={isContextMenuOpened}
        position={contextMenuPosition}
        anchorEl={menuAnchorEl as HTMLDivElement}
        messageId={message.id}
        onClose={handleCloseContextMenu}
        isOpenedFromRightClick={isOpenedFromRightClick}
      />
    </>
  );
};
