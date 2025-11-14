import { PuiStack, PuiTypography, PuiBox } from 'piche.ui';
import { FC } from 'react';

import type { ViewConversation } from '../Workspace';
import { ConversationInfoWrapper, StyledConversationTitle } from './StyledComponents';

interface ConversationInfoProps {
  conversation: ViewConversation;
  onContactClick?: () => void;
}

export const ConversationInfo: FC<ConversationInfoProps> = ({ conversation, onContactClick }) => {
  const conversationInitials = conversation.displayTitle
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ConversationInfoWrapper
      onClick={onContactClick}
      style={{ cursor: onContactClick ? 'pointer' : 'default' }}
    >
      <PuiBox
        className="chat-panel__avatar"
        style={{
          background: conversation.displayAvatarUrl
            ? undefined
            : conversation.displayAvatarColor ?? '#A8D0FF',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: '13px',
          color: '#1f2131',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {conversation.displayAvatarUrl ? (
          <img
            src={conversation.displayAvatarUrl}
            alt={conversation.displayTitle}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          conversationInitials
        )}
      </PuiBox>
      <PuiStack gap='2px' sx={{ minWidth: 0 }}>
        <StyledConversationTitle variant='body-m-semibold'>
          {conversation.displayTitle}
        </StyledConversationTitle>
        <PuiTypography
          variant='body-sm-medium'
          color='grey.300'
          sx={{ textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '12px', fontWeight: 500, lineHeight: 1.6 }}
        >
          {conversation.displaySubtitle}
        </PuiTypography>
      </PuiStack>
    </ConversationInfoWrapper>
  );
};
