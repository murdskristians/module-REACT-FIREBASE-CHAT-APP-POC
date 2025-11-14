import { PuiStack } from 'piche.ui';
import { FC } from 'react';

import type { ViewConversation } from '../Workspace';
import { Avatar } from '../shared/Avatar';
import {
  ConversationInfoWrapper,
  StyledConversationTitle,
  StyledConversationSubtitle,
} from './StyledComponents';

interface ConversationInfoProps {
  conversation: ViewConversation;
  onContactClick?: () => void;
}

export const ConversationInfo: FC<ConversationInfoProps> = ({
  conversation,
  onContactClick,
}) => {
  console.log('[ConversationInfo] Top Bar Avatar', {
    conversationId: conversation.id,
    displayTitle: conversation.displayTitle,
    displayAvatarUrl: conversation.displayAvatarUrl ?? 'null/undefined',
    displayAvatarColor: conversation.displayAvatarColor,
    counterpartId: conversation.counterpartId,
  });

  return (
    <ConversationInfoWrapper
      onClick={onContactClick}
      style={{ cursor: onContactClick ? 'pointer' : 'default' }}
    >
      <Avatar
        className="chat-panel__avatar"
        avatarUrl={conversation.displayAvatarUrl}
        name={conversation.displayTitle}
        avatarColor={conversation.displayAvatarColor}
        size={40}
      />
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
