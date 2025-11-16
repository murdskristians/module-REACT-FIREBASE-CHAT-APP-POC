import { PuiDivider, PuiIcon, PuiStack, PuiSvgIcon } from 'piche.ui';
import { FC, useCallback } from 'react';

import type { ViewConversation } from '../Workspace';
import { ConversationInfo } from './ConversationInfo';
import { StyledTopBar, StyledTopBarButton } from './StyledComponents';

interface ConversationTopBarProps {
  conversation: ViewConversation;
  onContactClick?: () => void;
  onStartCall?: (conversationId: string, isGroup: boolean) => void;
  onAddParticipant?: () => void;
}

export const ConversationTopBar: FC<ConversationTopBarProps> = ({
  conversation,
  onContactClick,
  onStartCall,
  onAddParticipant,
}) => {
  const isPrivateConversation = conversation.type === 'private';

  const handleCallClick = useCallback(() => {
    if (onStartCall) {
      const isGroup = conversation.type === 'group';
      onStartCall(conversation.id, isGroup);
    }
  }, [conversation, onStartCall]);

  return (
    <PuiStack>
      <StyledTopBar>
        <ConversationInfo
          conversation={conversation}
          onContactClick={onContactClick}
        />
        {!isPrivateConversation && (
          <PuiStack direction="row" gap="16px">
            <StyledTopBarButton
              aria-label="Add participant"
              title="Add participant"
              onClick={onAddParticipant}
            >
              <PuiSvgIcon width={20} height={20} icon={PuiIcon.UserPlus1} />
            </StyledTopBarButton>
            <StyledTopBarButton
              className="contained"
              aria-label="Start a call"
              title="Start a call"
              onClick={handleCallClick}
            >
              <PuiSvgIcon width={16} height={16} icon={PuiIcon.Phone} />
            </StyledTopBarButton>
          </PuiStack>
        )}
      </StyledTopBar>
      <PuiDivider />
    </PuiStack>
  );
};
