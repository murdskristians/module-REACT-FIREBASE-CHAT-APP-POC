import { PuiBox, PuiStack, PuiTypography, useTheme } from 'piche.ui';
import type { FC } from 'react';

import type { MessageReply } from '../../../../../firebase/conversations';
import { ReplyContainer, StyledReply, StyledReplyContent, StyledReplyImage, StyledReplyName, StyledReplyText } from './StyledComponents';

interface ReplyProps {
  replyTo: MessageReply;
  onClick?: () => void;
  backgroundColor?: string;
  isUserMessage?: boolean;
}

export const Reply: FC<ReplyProps> = ({ replyTo, onClick, backgroundColor, isUserMessage = false }) => {
  const theme = useTheme();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Scroll to the replied message
      const messageElement = document.querySelector(`[data-message-id="${replyTo.messageId}"]`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the message briefly
        messageElement.classList.add('highlighted');
        setTimeout(() => {
          messageElement.classList.remove('highlighted');
        }, 2000);
      }
    }
  };

  const getBackgroundColor = () => {
    if (backgroundColor) {
      return backgroundColor;
    }
    // Default background color logic similar to Communication UI
    if (isUserMessage) {
      return theme.palette.background.default;
    }
    return theme.palette.grey[50];
  };

  return (
    <ReplyContainer>
      <StyledReply 
        onClick={handleClick}
        style={{ backgroundColor: getBackgroundColor() }}
      >
        <StyledReplyContent>
          <PuiStack sx={{ maxWidth: '100%', gap: '4px', width: 'max-content' }}>
            {replyTo.senderName && (
              <StyledReplyName variant="body-sm-medium">
                {replyTo.senderName}
              </StyledReplyName>
            )}
            {replyTo.type === 'image' && replyTo.imageUrl ? (
              <PuiBox sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <StyledReplyImage>
                  <img src={replyTo.imageUrl} alt="Reply preview" />
                </StyledReplyImage>
                {replyTo.text && (
                  <StyledReplyText variant="body-sm-regular">
                    {replyTo.text}
                  </StyledReplyText>
                )}
              </PuiBox>
            ) : replyTo.text ? (
              <PuiTypography
                variant="body-sm-regular"
                noWrap
                sx={{
                  fontSize: '13px',
                  color: theme.palette.grey[700],
                  fontWeight: 400,
                }}
              >
                {replyTo.text}
              </PuiTypography>
            ) : null}
          </PuiStack>
        </StyledReplyContent>
      </StyledReply>
    </ReplyContainer>
  );
};

