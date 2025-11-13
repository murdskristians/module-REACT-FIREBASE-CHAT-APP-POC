import { FC } from 'react';

import type { ConversationMessage } from '../../../firebase/conversations';
import { StyledMessageTextWrapper, StyledTextContent, StyledMessageStatus } from './MessageStyledComponents';

interface TextMessageProps {
  message: ConversationMessage;
  time: string;
}

export const TextMessage: FC<TextMessageProps> = ({ message, time }) => {
  return (
    <StyledMessageTextWrapper>
      <StyledTextContent variant="body-sm-regular">
        {message.text}
      </StyledTextContent>
      <StyledMessageStatus component="span">
        {time}
      </StyledMessageStatus>
    </StyledMessageTextWrapper>
  );
};
