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
  onBackToConversationList?: () => void;
  showConversationList?: boolean;
}

export const ConversationTopBar: FC<ConversationTopBarProps> = ({
  conversation,
  onContactClick,
  onStartCall,
  onAddParticipant,
  onBackToConversationList,
  showConversationList = true,
}) => {
  const isPrivateConversation = conversation.type === 'private';

  const handleCallClick = useCallback(() => {
    if (onStartCall) {
      const isGroup = conversation.type === 'group';
      onStartCall(conversation.id, isGroup);
    }
  }, [conversation, onStartCall]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;

  const handleBackClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[ConversationTopBar] Back button clicked');
    console.log('[ConversationTopBar] onBackToConversationList exists:', !!onBackToConversationList);
    if (onBackToConversationList) {
      console.log('[ConversationTopBar] Calling onBackToConversationList');
      onBackToConversationList();
    } else {
      console.error('[ConversationTopBar] onBackToConversationList is not provided!');
    }
  }, [onBackToConversationList]);

  return (
    <PuiStack>
      <StyledTopBar>
        <PuiStack direction="row" alignItems="center" gap="8px" sx={{ minWidth: 0, flex: 1 }}>
          {isMobile && onBackToConversationList && (
            <StyledTopBarButton
              aria-label="Back to conversations"
              title="Back to conversations"
              onClick={handleBackClick}
              sx={{ flexShrink: 0 }}
            >
              <PuiSvgIcon width={20} height={20} icon={PuiIcon.ArrowLeft} />
            </StyledTopBarButton>
          )}
          <ConversationInfo
            conversation={conversation}
            onContactClick={onContactClick}
          />
        </PuiStack>
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
