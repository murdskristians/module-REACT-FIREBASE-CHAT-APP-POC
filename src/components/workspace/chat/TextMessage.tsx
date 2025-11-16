import { FC } from 'react';

import type { ConversationMessage } from '../../../firebase/conversations';
import { StyledMessageTextWrapper, StyledTextContent, StyledMessageStatus } from './MessageStyledComponents';

interface TextMessageProps {
  message: ConversationMessage;
  time: string;
  isUserMessage?: boolean;
}

export const TextMessage: FC<TextMessageProps> = ({ message, time, isUserMessage = false }) => {
  return (
    <StyledMessageTextWrapper>
      <StyledTextContent
        variant="body-sm-regular"
        sx={{
          color: 'var(--text-primary, #1f2131)',
        }}
      >
        {message.text}
      </StyledTextContent>
      <StyledMessageStatus
        component="span"
        sx={{
          color: 'var(--text-secondary, #939393)',
        }}
      >
        {time}
      </StyledMessageStatus>
    </StyledMessageTextWrapper>
  );
};
