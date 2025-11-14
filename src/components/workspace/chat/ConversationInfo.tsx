import { PuiBox, PuiStack } from 'piche.ui';
import { FC } from 'react';

import type { ViewConversation } from '../Workspace';
import {
  ConversationInfoWrapper,
  StyledConversationTitle,
  StyledConversationAvatar,
  StyledConversationSubtitle,
} from './StyledComponents';

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
        sx={{
          background: conversation.displayAvatarUrl
            ? undefined
            : conversation.displayAvatarColor ?? '#A8D0FF',
        }}
      >
        {conversation.displayAvatarUrl ? (
          <img
            src={conversation.displayAvatarUrl}
            alt={conversation.displayTitle}
            referrerPolicy="no-referrer"
          />
        ) : (
          conversationInitials
        )}
      </PuiBox>
      <PuiStack gap="2px" sx={{ minWidth: 0 }}>
        <StyledConversationTitle variant="body-m-semibold">
          {conversation.displayTitle}
        </StyledConversationTitle>
        <StyledConversationSubtitle variant="body-sm-medium" color="grey.300">
          {conversation.displaySubtitle}
        </StyledConversationSubtitle>
      </PuiStack>
    </ConversationInfoWrapper>
  );
};
