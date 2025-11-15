import { PuiDivider, PuiFade, PuiIcon, PuiStack } from 'piche.ui';
import type { FC } from 'react';
import React, { useState } from 'react';

import {
  useNotification,
  NotificationType,
} from '../../../notifications/NotificationProvider';
import { deleteMessage, pinMessage, unpinMessage } from '../../../../firebase/conversations';
import { getCurrentUser } from '../../../../firebase/auth';
import type { ConversationMessage, MessageReply } from '../../../../firebase/conversations';
import { MessageReactionsWrapper } from './MessageReactionsWrapper';
import { ConversationMessagePopupItem } from './ConversationMessagePopupItem';
import { PopupChildren } from './PopupChildren';
import {
  StyledMessagePopup,
  StyledMessagePopupList,
  StyledMessagePopupListWrapper,
} from './StyledComponents';
import type { MessagePopupItemType } from './types';

interface ConversationMessagePopupProps {
  isOpened: boolean;
  position: { top: number; left: number };
  anchorEl: null | HTMLDivElement;
  messageId: string;
  messageText?: string | null;
  conversationId: string;
  senderId: string;
  message?: ConversationMessage;
  onClose: () => void;
  onMessageDeleted?: () => void;
  isOpenedFromRightClick: boolean;
  onReply?: (replyTo: MessageReply) => void;
}

export const ConversationMessagePopup: FC<ConversationMessagePopupProps> = ({
  isOpened,
  position,
  anchorEl,
  messageId,
  messageText,
  conversationId,
  senderId,
  message,
  onClose,
  onMessageDeleted,
  isOpenedFromRightClick,
  onReply,
}) => {
  const [activeOption, setActiveOption] = useState<MessagePopupItemType | null>(
    null
  );
  const { showNotification } = useNotification();
  const currentUser = getCurrentUser();
  const isUserMessage = currentUser?.uid === senderId;
  const isPinned = message?.isPinned ?? false;

  const handleCopyText = async () => {
    if (messageText) {
      try {
        await navigator.clipboard.writeText(messageText);
        showNotification({
          message: 'Text copied to clipboard',
          type: NotificationType.Info,
        });
        onClose();
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = messageText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          showNotification({
            message: 'Text copied to clipboard',
            type: NotificationType.Info,
          });
          onClose();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to copy text:', err);
          showNotification({
            message: 'Failed to copy text',
            type: NotificationType.Error,
          });
        }
        document.body.removeChild(textArea);
      }
    }
  };

  const handleDelete = async () => {
    if (!currentUser) {
      showNotification({
        message: 'You must be logged in to delete messages',
        type: NotificationType.Error,
      });
      return;
    }

    try {
      await deleteMessage(conversationId, messageId, currentUser.uid);
      showNotification({
        message: 'Message deleted',
        type: NotificationType.Success,
      });
      onMessageDeleted?.();
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete message:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete message';
      showNotification({
        message: errorMessage,
        type: NotificationType.Error,
      });
    }
  };

  const handlePin = async () => {
    if (!currentUser) {
      showNotification({
        message: 'You must be logged in to pin messages',
        type: NotificationType.Error,
      });
      return;
    }

    try {
      if (isPinned) {
        await unpinMessage(conversationId, messageId, currentUser.uid);
        showNotification({
          message: 'Message unpinned',
          type: NotificationType.Success,
        });
      } else {
        await pinMessage(conversationId, messageId, currentUser.uid);
        showNotification({
          message: 'Message pinned',
          type: NotificationType.Success,
        });
      }
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to pin/unpin message:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to pin/unpin message';
      showNotification({
        message: errorMessage,
        type: NotificationType.Error,
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleReply = () => {
    if (message && onReply) {
      const replyTo: MessageReply = {
        messageId: message.id,
        senderId: message.senderId,
        senderName: message.senderName ?? null,
        text: message.text ?? null,
        imageUrl: message.imageUrl ?? null,
        type: message.type,
        createdAt: message.createdAt ?? null,
      };
      onReply(replyTo);
    }
    onClose();
  };

  // Popup options with real functionality
  const popupOptions: MessagePopupItemType[] = [
    { label: 'Reply', icon: PuiIcon.CornerUpRight, onClick: handleReply },
    {
      label: isPinned ? 'Unpin' : 'Pin',
      icon: PuiIcon.Pin2,
      onClick: handlePin,
    },
    {
      label: 'Copy text',
      icon: PuiIcon.Copy,
      onClick: handleCopyText,
      disabled: !messageText,
    },
    { label: 'Forward', icon: PuiIcon.FlipBackward, onClick: () => {} },
    {
      label: 'Delete',
      icon: PuiIcon.Trash,
      onClick: handleDelete,
      className: 'delete',
      disabled: !isUserMessage,
    },
    { label: 'Select', icon: PuiIcon.CheckCircle, onClick: () => {} },
  ];

  return (
    <StyledMessagePopup
      id="conversation-menu"
      elevation={0}
      anchorReference={isOpenedFromRightClick ? 'anchorPosition' : 'anchorEl'}
      anchorPosition={position}
      anchorOrigin={{
        vertical: -16,
        horizontal: -8,
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      anchorEl={anchorEl}
      open={isOpened}
      TransitionComponent={PuiFade}
      onClose={onClose}
      onTransitionExited={() => setActiveOption(null)}
      aria-hidden={false}
    >
      <PuiStack gap="4px">
        <MessageReactionsWrapper
          messageId={messageId}
          conversationId={conversationId}
          userReactions={message?.reactions?.filter(r => r.reactedBy === getCurrentUser()?.uid) || []}
          handleClose={handleClose}
        />
        <StyledMessagePopupListWrapper>
          {activeOption ? (
            <PopupChildren
              activeOption={activeOption}
              handleBack={() => setActiveOption(null)}
            />
          ) : (
            <StyledMessagePopupList>
              {popupOptions.map((item, index) => {
                const handleClick = item.children
                  ? () => setActiveOption(item)
                  : item.onClick ?? (() => {});

                return (
                  <React.Fragment key={item.label}>
                    <ConversationMessagePopupItem
                      option={item}
                      onClick={handleClick}
                    />
                    {index === popupOptions.length - 2 && (
                      <PuiDivider sx={{ margin: '6px 0' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </StyledMessagePopupList>
          )}
        </StyledMessagePopupListWrapper>
      </PuiStack>
    </StyledMessagePopup>
  );
};
