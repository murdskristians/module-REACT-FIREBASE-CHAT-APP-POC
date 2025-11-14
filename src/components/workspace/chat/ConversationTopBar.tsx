import { PuiDivider, PuiIcon, PuiStack, PuiSvgIcon } from 'piche.ui';
import type { FC } from 'react';

import type { CallType } from '../../../firebase/calls';
import type { ViewConversation } from '../Workspace';
import { ConversationInfo } from './ConversationInfo';
import { StyledTopBar, StyledTopBarButton } from './StyledComponents';

interface ConversationTopBarProps {
  conversation: ViewConversation;
  onContactClick?: () => void;
}

export const ConversationTopBar: FC<ConversationTopBarProps> = ({ conversation, onContactClick }) => {
  const handleStartCall = (callType: CallType) => {
    // Call the global initiateCall function
    if ((window as any).initiateCall) {
      const counterpartId = conversation.counterpartId;
      const receiverName = conversation.displayTitle;
      const receiverAvatar = conversation.displayAvatarUrl;

      (window as any).initiateCall(
        counterpartId,
        receiverName,
        receiverAvatar,
        conversation.id,
        callType
      );
    }
  };

  // Only show call buttons for direct conversations (not groups or private)
  const canCall = conversation.type === 'direct';

  return (
    <PuiStack>
      <StyledTopBar>
        <ConversationInfo conversation={conversation} onContactClick={onContactClick} />
        <PuiStack direction='row' gap='16px'>
          {canCall && (
            <>
              {/* Video Call Button */}
              <StyledTopBarButton
                aria-label="Start video call"
                title="Start video call"
                onClick={() => handleStartCall('video')}
              >
                <PuiSvgIcon width={20} height={20} icon={PuiIcon.Video} />
              </StyledTopBarButton>

              {/* Voice Call Button */}
              <StyledTopBarButton
                className="contained"
                aria-label="Start voice call"
                title="Start voice call"
                onClick={() => handleStartCall('audio')}
              >
                <PuiSvgIcon width={16} height={16} icon={PuiIcon.Phone} />
              </StyledTopBarButton>
            </>
          )}
        </PuiStack>
      </StyledTopBar>
      <PuiDivider />
    </PuiStack>
  );
};
