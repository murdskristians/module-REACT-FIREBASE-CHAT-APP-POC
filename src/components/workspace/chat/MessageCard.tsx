import { PuiStack, PuiTypography } from 'piche.ui';
import { FC } from 'react';

import type { ConversationMessage } from '../../../firebase/conversations';
import { TextMessage } from './TextMessage';

interface MessageCardProps {
  message: ConversationMessage;
  isUserMessage: boolean;
  sequenceStarted: boolean;
  senderName?: string;
  senderAvatar?: string;
  senderAvatarColor?: string;
  isGroup?: boolean;
}

export const MessageCard: FC<MessageCardProps> = ({
  message,
  isUserMessage,
  sequenceStarted,
  senderName,
  senderAvatar,
  senderAvatarColor,
  isGroup = false,
}) => {
  const time = new Date(message?.createdAt?.toDate() ?? '').toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) ?? '';

  return (
    <PuiStack
      className={`message-wrapper ${isUserMessage ? 'user-message' : 'other-message'}`}
      sx={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
        padding: '4px 32px 4px 32px',
        paddingLeft: !isUserMessage ? '40px' : '32px',
        marginTop: sequenceStarted ? '34px' : '0',
      }}
    >
      <PuiStack
        sx={{
          gap: '8px',
          flexDirection: isUserMessage ? 'row-reverse' : 'row',
          maxWidth: '814px',
          width: '100%',
        }}
      >
        {/* Avatar for non-user messages */}
        {!isUserMessage && (
          <PuiStack
            sx={{
              width: '32px',
              height: '32px',
              flexShrink: 0,
              visibility: sequenceStarted ? 'visible' : 'hidden',
              borderRadius: '50%',
              backgroundColor: senderAvatarColor || '#A8D0FF',
              backgroundImage: senderAvatar ? `url(${senderAvatar})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {!senderAvatar && sequenceStarted && (
              <PuiTypography
                sx={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {senderName ? senderName.charAt(0) : '?'}
              </PuiTypography>
            )}
          </PuiStack>
        )}

        {/* Message bubble */}
        <PuiStack
          className={`message-bubble ${isUserMessage ? 'user-message-bubble' : ''}`}
          sx={{
            width: 'min-content',
            flexWrap: 'wrap',
            alignItems: 'end',
            gap: '8px',
            borderRadius: isUserMessage ? '16px 0 16px 16px' : '0px 16px 16px 16px',
            padding: '8px 16px',
            background: isUserMessage ? 'var(--palette-gradient)' : '#ffffff',
            color: isUserMessage ? '#ffffff' : '#1f2131',
            position: 'relative',
            overflow: 'hidden',
            justifyContent: 'start',
            maxWidth: '100%',
          }}
        >
          {!isUserMessage && senderName && isGroup && (
            <PuiTypography
              variant="body-sm-medium"
              sx={{
                color: '#a0a0a0',
                marginRight: 'auto',
                textWrap: 'nowrap',
                width: '100%',
                fontFamily: "'Poppins', 'Inter', sans-serif",
                fontSize: '12px',
              }}
            >
              {senderName}
            </PuiTypography>
          )}

          <TextMessage message={message} time={time} isUserMessage={isUserMessage} />
        </PuiStack>
      </PuiStack>
    </PuiStack>
  );
};
