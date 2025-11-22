import { PuiIcon, PuiStack, PuiTypography } from 'piche.ui';
import type { FC, MouseEvent } from 'react';
import { useRef, useState } from 'react';

import type { ConversationMessage, MessageReply } from '../../../firebase/conversations';
import { getCurrentUser } from '../../../firebase/auth';
import { Avatar } from '../shared/Avatar';
import { ConversationMessagePopup } from './message-card/ConversationMessagePopup';
import { ForwardedMessageTitle } from './message-card/ForwardedMessageTitle';
import { MessageReactions } from './message-card/MessageReactions';
import { Reply } from './message-card/reply/Reply';
import {
  StyledConversationMessageContent,
  StyledConversationMessageWrapper,
  StyledIconWrapper,
  StyledMessageCardWrapper,
} from './message-card/StyledComponents';
import { MessageFiles } from './message-card/files/MessageFiles';
import { VoiceMessage } from './message-card/VoiceMessage';
import { TextMessage } from './TextMessage';

interface MessageCardProps {
  message: ConversationMessage;
  isUserMessage: boolean;
  sequenceStarted: boolean;
  senderName?: string;
  senderAvatar?: string;
  senderAvatarColor?: string;
  isGroup?: boolean;
  conversationId: string;
  isHighlighted?: boolean;
  onMessageDeleted?: () => void;
  onReply?: (replyTo: MessageReply) => void;
  onForward?: (message: ConversationMessage) => void;
  contactsMap?: Map<string, { displayName?: string | null; avatarUrl?: string | null; avatarColor?: string | null }>;
}

const initialPositionState = { top: 0, left: 0 };
const extraWidthOffset = 220;

const getClickPosition = (e: MouseEvent<Element>, extraWidth: number = 0) => {
  return { top: e.clientY, left: e.clientX + extraWidth };
};

export const MessageCard: FC<MessageCardProps> = ({
  message,
  isUserMessage,
  sequenceStarted,
  senderName,
  senderAvatar,
  senderAvatarColor,
  isGroup = false,
  conversationId,
  isHighlighted = false,
  onMessageDeleted,
  onReply,
  onForward,
  contactsMap,
}) => {
  const [isContextMenuOpened, setIsContextMenuOpened] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ top: number; left: number }>(initialPositionState);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isOpenedFromRightClick, setIsOpenedFromRightClick] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const time =
    new Date(message?.createdAt?.toDate() ?? '').toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) ?? '';

  const handleOpenContextMenu = (e: MouseEvent<Element>) => {
    e.preventDefault();
    setContextMenuPosition(getClickPosition(e, extraWidthOffset));
    setMenuAnchorEl(e.currentTarget as HTMLElement);
    setIsOpenedFromRightClick(true);
    setIsContextMenuOpened(true);
  };

  const handleOpenContextMenuFromDots = (e: MouseEvent<Element>) => {
    setMenuAnchorEl(e.currentTarget as HTMLElement);
    setIsOpenedFromRightClick(false);
    setIsContextMenuOpened(true);
  };

  const handleCloseContextMenu = () => {
    setIsContextMenuOpened(false);
    setContextMenuPosition(initialPositionState);
  };

  return (
    <>
      <StyledConversationMessageWrapper
        ref={wrapperRef}
        isUserMessage={isUserMessage}
        data-message-id={message.id}
        sx={{
          marginTop: sequenceStarted ? '34px' : '0',
        }}
      >
        <StyledConversationMessageContent
          sx={{
            flexDirection: isUserMessage ? 'row-reverse' : 'row',
          }}
        >
          {!isUserMessage && (
            <Avatar
              avatarUrl={senderAvatar}
              name={senderName || 'User'}
              avatarColor={senderAvatarColor}
              size={32}
              sx={{
                visibility: sequenceStarted ? 'visible' : 'hidden',
              }}
            />
          )}

          <StyledMessageCardWrapper>
            <PuiStack
              className={`message-bubble ${isUserMessage ? 'user-message-bubble' : ''}`}
              onContextMenu={handleOpenContextMenu}
              sx={{
                width: 'fit-content',
                maxWidth: '100%',
                minWidth: 0,
                flexWrap: 'wrap',
                alignItems: 'end',
                gap: '8px',
                borderRadius: isUserMessage ? '16px 0 16px 16px' : '0px 16px 16px 16px',
                padding: '8px 16px',
                border: '1px solid var(--border-color, #f0f0f0)',
                background: isHighlighted
                  ? (isUserMessage ? '#B3D9F2' : '#E3F2FD')
                  : (isUserMessage ? 'var(--palette-message-bg)' : 'var(--bg-primary, #ffffff)'),
                color: 'var(--text-primary, #1f2131)',
                position: 'relative',
                overflow: 'visible',
                justifyContent: 'start',
                transition: 'background-color 0.3s ease-in-out',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                '@media (max-width: 768px)': {
                  padding: '6px 12px',
                  gap: '6px',
                  borderRadius: isUserMessage ? '14px 0 14px 14px' : '0px 14px 14px 14px',
                },
                '@media (max-width: 480px)': {
                  padding: '6px 10px',
                  gap: '4px',
                  borderRadius: isUserMessage ? '12px 0 12px 12px' : '0px 12px 12px 12px',
                },
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

              {message.forwardedFrom && (() => {
                const forwardedContact = contactsMap?.get(message.forwardedFrom.originalSenderId);
                return (
                  <ForwardedMessageTitle
                    forwardedFromName={message.forwardedFrom.originalSenderName || forwardedContact?.displayName || 'Unknown'}
                    authorContactId={message.forwardedFrom.originalSenderId}
                    authorAvatarUrl={forwardedContact?.avatarUrl ?? null}
                    authorAvatarColor={forwardedContact?.avatarColor ?? null}
                  />
                );
              })()}

              {message.replyTo && (() => {
                const currentUserId = getCurrentUser()?.uid;
                const isReplyFromCurrentUser = message.replyTo.senderId === currentUserId;
                const isMessageFromCurrentUser = isUserMessage;

                // Determine background color based on Communication UI logic
                let replyBgColor: string | undefined;
                if (isReplyFromCurrentUser && isMessageFromCurrentUser) {
                  replyBgColor = 'var(--bg-secondary, #E8F4FD)'; // primary[25] equivalent
                } else if (isReplyFromCurrentUser) {
                  replyBgColor = 'var(--bg-secondary, #E8F4FD)'; // primary.light equivalent
                } else if (isMessageFromCurrentUser) {
                  replyBgColor = 'var(--bg-primary, #ffffff)'; // background.default
                } else {
                  replyBgColor = undefined; // Will use default var(--bg-tertiary)
                }

                return (
                  <Reply
                    replyTo={message.replyTo}
                    isUserMessage={isUserMessage}
                    backgroundColor={replyBgColor}
                  />
                );
              })()}

              {/* Display audio message - check both audioUrl and fileUrls for audio files */}
              {(message.type === 'audio' && message.audioUrl) || 
               (message.fileUrls && message.fileUrls.length > 0 && 
                message.fileUrls.some(url => /\.(mp3|wav|ogg|m4a|aac|flac|wma|opus)(\?|$)/i.test(url)) &&
                !message.imageUrl) ? (
                <>
                  <VoiceMessage 
                    message={{
                      ...message,
                      audioUrl: message.audioUrl || (message.fileUrls && message.fileUrls[0]) || undefined,
                    }} 
                    isUserMessage={isUserMessage} 
                  />
                  {/* Show time for audio messages if no text */}
                  {(!message.text || message.text.trim() === '') && (
                    <PuiTypography 
                      component="span"
                      sx={{
                        fontSize: '11px',
                        color: '#939393',
                        marginTop: '4px',
                        width: '100%',
                        textAlign: isUserMessage ? 'right' : 'left',
                      }}
                    >
                      {time}
                    </PuiTypography>
                  )}
                </>
              ) : null}

              {/* Display files/images/videos before text - exclude audio files */}
              {message.type !== 'audio' && 
               !(message.fileUrls && message.fileUrls.length > 0 && 
                 message.fileUrls.some(url => /\.(mp3|wav|ogg|m4a|aac|flac|wma|opus)(\?|$)/i.test(url))) &&
               ((message.fileUrls && message.fileUrls.length > 0) || message.imageUrl) ? (
                <MessageFiles 
                  message={message.forwardedFrom ? {
                    ...message,
                    fileUrls: message.forwardedFrom.originalFileUrls ?? message.fileUrls,
                    imageUrl: message.forwardedFrom.originalImageUrl ?? message.imageUrl,
                    type: message.forwardedFrom.originalType,
                  } : message}
                  onFileClick={(url) => window.open(url, '_blank')}
                />
              ) : null}

              {/* Only show text if there is text content */}
              {message.text && (
                <TextMessage 
                  message={message.forwardedFrom ? {
                    ...message,
                    text: message.forwardedFrom.originalText,
                    imageUrl: message.forwardedFrom.originalImageUrl,
                    fileUrls: message.forwardedFrom.originalFileUrls ?? undefined,
                    type: message.forwardedFrom.originalType,
                  } : message} 
                  time={time} 
                  isUserMessage={isUserMessage} 
                />
              )}
              
              {/* Show time if there are files but no text */}
              {(!message.text || message.text.trim() === '') && message.type !== 'audio' && ((message.fileUrls && message.fileUrls.length > 0) || message.imageUrl) && (
                <PuiTypography 
                  component="span"
                  sx={{
                    fontSize: '11px',
                    color: '#939393',
                    marginTop: '4px',
                  }}
                >
                  {time}
                </PuiTypography>
              )}
              {message.reactions && message.reactions.length > 0 && (
                <MessageReactions
                  reactions={message.reactions}
                  messageId={message.id}
                  conversationId={conversationId}
                  isUserMessage={isUserMessage}
                  currentUserId={getCurrentUser()?.uid || ''}
                />
              )}
            </PuiStack>
            <StyledIconWrapper
              className="message-dots-menu"
              isContextMenuOpened={isContextMenuOpened}
              width={16}
              height={16}
              icon={PuiIcon.DotsVertical}
              onClick={handleOpenContextMenuFromDots}
            />
          </StyledMessageCardWrapper>
        </StyledConversationMessageContent>
      </StyledConversationMessageWrapper>

      <ConversationMessagePopup
        isOpened={isContextMenuOpened}
        position={contextMenuPosition}
        anchorEl={menuAnchorEl as HTMLDivElement}
        messageId={message.id}
        messageText={message.text}
        conversationId={conversationId}
        senderId={message.senderId}
        message={message}
        onClose={handleCloseContextMenu}
        onMessageDeleted={onMessageDeleted}
        isOpenedFromRightClick={isOpenedFromRightClick}
        onReply={onReply}
        onForward={onForward}
      />
    </>
  );
};
