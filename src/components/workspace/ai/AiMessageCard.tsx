import { PuiStack, PuiTypography } from 'piche.ui';
import type { FC } from 'react';

import type { AiMessage } from '../../../firebase/ai';

interface AiMessageCardProps {
  message: AiMessage;
}

export const AiMessageCard: FC<AiMessageCardProps> = ({ message }) => {
  const isUserMessage = message.role === 'user';

  const time =
    new Date(message?.createdAt?.toDate() ?? '').toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) ?? '';

  return (
    <PuiStack
      sx={{
        flexDirection: 'row',
        width: '100%',
        justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
      }}
    >
      <PuiStack
        sx={{
          width: isUserMessage ? 'auto' : 'auto',
          maxWidth: isUserMessage ? '80%' : '100%',
          flexWrap: 'wrap',
          alignItems: 'end',
          gap: '8px',
          borderRadius: isUserMessage ? '16px 0 16px 16px' : '0px 16px 16px 16px',
          padding: '8px 16px',
          background: isUserMessage ? 'var(--palette-message-bg)' : '#ffffff',
          color: '#1f2131',
          position: 'relative',
          overflow: 'hidden',
          justifyContent: 'start',
        }}
      >
        {!isUserMessage && (
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
            AI Assistant
          </PuiTypography>
        )}
        <PuiStack
          sx={{
            flexDirection: 'row',
            alignItems: 'end',
            flexWrap: 'wrap',
            gap: '8px',
            width: '100%',
          }}
        >
          <PuiTypography
            variant="body-sm-regular"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '14px',
              lineHeight: '1.5',
              color: isUserMessage ? '#1f2131' : 'inherit',
            }}
          >
            {message.content}
          </PuiTypography>
          <PuiTypography
            component="span"
            sx={{
              color: '#939393',
              fontSize: '11px',
              lineHeight: '1.5',
              marginLeft: 'auto',
              flexShrink: 0,
            }}
          >
            {time}
          </PuiTypography>
        </PuiStack>
      </PuiStack>
    </PuiStack>
  );
};
