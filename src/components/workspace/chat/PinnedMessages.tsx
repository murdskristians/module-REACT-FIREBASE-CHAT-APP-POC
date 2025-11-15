import clsx from 'clsx';
import { PuiIcon, PuiStack, PuiSvgIcon, PuiTypography, useTheme } from 'piche.ui';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import type { ConversationMessage } from '../../../firebase/conversations';
import type { Contact } from '../../../firebase/users';
import { StyledPinnedBar, StyledPinnedBarsContainer, StyledPinnedMessages } from './PinnedMessagesStyled';

const CONTAINER_HEIGHT = 44;
const GAP = 4;
const MAX_ITEMS = 4;
const ITEM_MIN_HEIGHT = 8;

interface PinnedMessagesProps {
  messages: ConversationMessage[];
  contactsMap: Map<string, Contact>;
  currentUserId: string;
  onMessageClick: (messageId: string) => void;
}

export const PinnedMessages: FC<PinnedMessagesProps> = ({
  messages,
  contactsMap,
  currentUserId,
  onMessageClick,
}) => {
  const { palette } = useTheme();
  const boxesRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [activePinnedMessageId, setActivePinnedMessageId] = useState<string | null>(null);

  const pinnedMessages = useMemo(() => {
    return messages.filter(msg => msg.isPinned).sort((a, b) => {
      const timeA = a.pinnedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? a.createdAt?.toDate?.()?.getTime() ?? 0;
      const timeB = b.pinnedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? b.createdAt?.toDate?.()?.getTime() ?? 0;
      return timeA - timeB;
    });
  }, [messages]);

  // Set initial active message to the last one and update when pinned messages change
  useEffect(() => {
    if (pinnedMessages.length === 0) {
      setActivePinnedMessageId(null);
      return;
    }

    const lastMessageId = pinnedMessages[pinnedMessages.length - 1].id;
    
    // Set initial active message if none is set
    if (!activePinnedMessageId) {
      setActivePinnedMessageId(lastMessageId);
      return;
    }

    // Update if current active message is no longer in the list
    const isActiveMessageStillPinned = pinnedMessages.some(msg => msg.id === activePinnedMessageId);
    if (!isActiveMessageStillPinned) {
      setActivePinnedMessageId(lastMessageId);
    }
  }, [pinnedMessages, activePinnedMessageId]);

  const activePinnedMessage = pinnedMessages.find(msg => msg.id === activePinnedMessageId) || pinnedMessages[pinnedMessages.length - 1];

  const blockHeight = useMemo(() => {
    const count = pinnedMessages.length;
    return count <= MAX_ITEMS ? (CONTAINER_HEIGHT - (count - 1) * GAP) / count : ITEM_MIN_HEIGHT;
  }, [pinnedMessages.length]);

  const handleClick = () => {
    if (!activePinnedMessage || pinnedMessages.length === 0) {
      return;
    }

    if (pinnedMessages.length === 1) {
      // If only one pinned message, just scroll to it
      onMessageClick(activePinnedMessage.id);
      return;
    }

    // Switch to next pinned message
    const currentIndex = pinnedMessages.findIndex(msg => msg.id === activePinnedMessageId);
    const nextIndex = currentIndex === 0 ? pinnedMessages.length - 1 : currentIndex - 1;
    const nextMessage = pinnedMessages[nextIndex];
    
    setActivePinnedMessageId(nextMessage.id);
    onMessageClick(nextMessage.id);
  };

  const getMessagePreview = (message: ConversationMessage): string => {
    if (message.text) {
      return message.text.length > 50 ? `${message.text.substring(0, 50)}...` : message.text;
    }
    if (message.imageUrl) {
      return '📷 Photo';
    }
    return 'Message';
  };

  if (!pinnedMessages.length || !activePinnedMessage) {
    return null;
  }

  return (
    <StyledPinnedMessages onClick={handleClick}>
      <PuiStack sx={{ flexDirection: 'row', gap: '8px', overflowX: 'hidden' }}>
        <StyledPinnedBarsContainer>
          {pinnedMessages.map((message) => (
            <StyledPinnedBar
              key={message.id}
              ref={(el: HTMLDivElement) => boxesRef.current.set(message.id, el)}
              style={{ height: blockHeight }}
              isActive={message.id === activePinnedMessageId}
            />
          ))}
        </StyledPinnedBarsContainer>
        <PuiStack sx={{ justifyContent: 'center', overflowX: 'hidden' }}>
          <PuiTypography 
            variant='body-xs-medium' 
            color='primary.main'
            sx={{ fontSize: '11px', lineHeight: 1.4 }}
          >
            Pinned message
          </PuiTypography>
          <PuiTypography
            variant='body-xs-regular'
            sx={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              fontSize: '11px',
              lineHeight: 1.4
            }}
          >
            {getMessagePreview(activePinnedMessage)}
          </PuiTypography>
        </PuiStack>
      </PuiStack>
      <PuiSvgIcon
        width={20}
        height={20}
        icon={PuiIcon.Pin2}
        stroke={palette.primary.main}
      />
    </StyledPinnedMessages>
  );
};

