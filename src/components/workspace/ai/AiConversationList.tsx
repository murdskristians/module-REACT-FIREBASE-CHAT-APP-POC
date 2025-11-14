import { PuiButton, PuiIcon, PuiStack, PuiSvgIcon, PuiTypography } from 'piche.ui';
import type { FC } from 'react';

import type { AiConversation } from '../../../firebase/ai';

interface AiConversationListProps {
  conversations: AiConversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onClose: () => void;
}

export const AiConversationList: FC<AiConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  onClose,
}) => {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <PuiStack
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <PuiStack
        sx={{
          padding: '12px 24px',
          borderBottom: '1px solid #e5e7eb',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <PuiButton
          onClick={onClose}
          sx={{
            minWidth: 'auto',
            padding: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
            '&:hover': {
              background: '#f3f4f6',
            },
          }}
        >
          <PuiSvgIcon icon={PuiIcon.ArrowLeft} width={20} height={20} sx={{ color: '#374151' }} />
        </PuiButton>
        <PuiTypography variant="body-lg-semibold" sx={{ fontSize: '16px', flex: 1 }}>
          History
        </PuiTypography>
        <PuiButton
          onClick={onNewConversation}
          sx={{
            padding: '8px 12px',
            background: '#3398DB',
            color: '#ffffff',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'background 0.2s',
            '&:hover': {
              background: '#2980b9',
            },
          }}
        >
          <PuiSvgIcon icon={PuiIcon.Plus} width={14} height={14} />
          New
        </PuiButton>
      </PuiStack>

      {/* Conversations list */}
      <PuiStack
        sx={{
          flex: 1,
          overflowY: 'auto',
          gap: '4px',
          padding: '16px 24px',
        }}
      >
        {conversations.length === 0 ? (
          <PuiStack
            sx={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <PuiTypography
              variant="body-sm-regular"
              sx={{ color: '#9ca3af', fontSize: '13px' }}
            >
              No conversations yet. Start a new one!
            </PuiTypography>
          </PuiStack>
        ) : (
          conversations.map((conversation) => (
            <PuiStack
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              sx={{
                padding: '14px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                background:
                  selectedConversationId === conversation.id
                    ? '#eef2ff'
                    : 'transparent',
                transition: 'background 0.2s',
                '&:hover': {
                  background:
                    selectedConversationId === conversation.id
                      ? '#eef2ff'
                      : '#f9fafb',
                },
              }}
            >
              <PuiStack
                sx={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '6px',
                }}
              >
                <PuiSvgIcon
                  icon={PuiIcon.Ai}
                  width={18}
                  height={18}
                  sx={{
                    color:
                      selectedConversationId === conversation.id
                        ? '#6366f1'
                        : '#9ca3af',
                    marginTop: '2px',
                  }}
                />
                <PuiTypography
                  variant="body-sm-medium"
                  sx={{
                    flex: 1,
                    fontSize: '14px',
                    color:
                      selectedConversationId === conversation.id
                        ? '#1f2937'
                        : '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.4',
                  }}
                >
                  {conversation.title}
                </PuiTypography>
              </PuiStack>
              <PuiTypography
                variant="body-xs-regular"
                sx={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  paddingLeft: '28px',
                }}
              >
                {formatDate(conversation.updatedAt)}
              </PuiTypography>
            </PuiStack>
          ))
        )}
      </PuiStack>
    </PuiStack>
  );
};
