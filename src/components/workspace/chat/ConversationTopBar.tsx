import { PuiDivider, PuiIcon, PuiStack, PuiSvgIcon } from 'piche.ui';
import { FC } from 'react';

import type { ViewConversation } from '../Workspace';
import { ConversationInfo } from './ConversationInfo';
import { StyledTopBar, StyledTopBarButton } from './StyledComponents';

interface ConversationTopBarProps {
  conversation: ViewConversation;
}

export const ConversationTopBar: FC<ConversationTopBarProps> = ({ conversation }) => {
  return (
    <PuiStack>
      <StyledTopBar>
        <ConversationInfo conversation={conversation} />
        <PuiStack direction='row' gap='16px'>
          <StyledTopBarButton aria-label="Add participant" title="Add participant">
            <PuiSvgIcon width={20} height={20} icon={PuiIcon.UserPlus1} />
          </StyledTopBarButton>
          <StyledTopBarButton className="contained" aria-label="Start a call" title="Start a call">
            <PuiSvgIcon width={16} height={16} icon={PuiIcon.Phone} />
          </StyledTopBarButton>
        </PuiStack>
      </StyledTopBar>
      <PuiDivider />
    </PuiStack>
  );
};
