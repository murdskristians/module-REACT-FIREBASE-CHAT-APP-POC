import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import type firebaseCompat from 'firebase/compat/app';

import { PuiBox, PuiStack, PuiTypography } from 'piche.ui';

import type { ConversationMessage, MessageReply, Conversation } from '../../../firebase/conversations';
import type { Contact } from '../../../firebase/users';
import type { ViewConversation } from '../Workspace';
import { createViewConversationFromContact } from '../utils';
import { ConversationInput } from './ConversationInput';
import { ConversationTopBar } from './ConversationTopBar';
import { MessageList } from './MessageList';
import { PinnedMessages } from './PinnedMessages';
import { ChatAreaWrapper, MessagesContainer } from './StyledComponents';
import type { FilePreviewItem } from './file-preview/FilesInputArea';
import { useCall } from '../../../hooks/useCall';
import { CallView } from './call/CallView';
import { IncomingCallPopup } from './call/IncomingCallPopup';

type ChatViewProps = {
  user: firebaseCompat.User;
  conversation: ViewConversation | null;
  messages: ConversationMessage[];
  onSendMessage: (payload: {
    text: string;
    files?: File[];
    audio?: { blob: Blob; duration: number; volumeLevels: number[] };
    replyTo?: MessageReply | null;
  }) => Promise<void>;
  isSending: boolean;
  contactsMap: Map<string, Contact>;
  pendingUser?: Contact | null;
  onContactClick?: () => void;
  conversations: Conversation[];
  contacts: Contact[];
  onForwardMessage: (message: ConversationMessage, targetConversationIds: string[], forwardText?: string) => Promise<void>;
  onForward: (message: ConversationMessage) => void;
  onAddParticipant?: () => void;
  onBackToConversationList?: () => void;
  showConversationList?: boolean;
  onOpenAiPanel?: () => void;
};

interface PendingAudio {
  id: string;
  blob: Blob;
  duration: number;
  volumeLevels: number[];
  url: string;
}

export function ChatView({
  user,
  conversation,
  messages,
  onSendMessage,
  isSending,
  contactsMap,
  pendingUser,
  onContactClick,
  onForward,
  onAddParticipant,
  onBackToConversationList,
  showConversationList = true,
  onOpenAiPanel,
}: ChatViewProps) {
  const {
    callState,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useCall();
  const [composerValue, setComposerValue] = useState('');
  const [pendingFiles, setPendingFiles] = useState<FilePreviewItem[]>([]);
  const [pendingAudio, setPendingAudio] = useState<PendingAudio | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<MessageReply | null>(null);

  useEffect(() => {
    if (!conversation) {
      setComposerValue('');
      setPendingFiles([]);
      setPendingAudio(null);
      setReplyTo(null);
    }
  }, [conversation]);

  useEffect(() => {
    if (!messages.length) {
      setComposerValue('');
      setPendingFiles([]);
      setPendingAudio(null);
    }
  }, [messages]);

  // Helper function to extract audio data from audio file
  const extractAudioData = useCallback(async (audioFile: File): Promise<{ duration: number; volumeLevels: number[] }> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(audioFile);
      
      audio.src = url;
      audio.preload = 'metadata';
      
      audio.onloadedmetadata = () => {
        const duration = audio.duration * 1000; // Convert to milliseconds
        
        // Generate volume levels (simplified - in real app you'd analyze the audio)
        const volumeLevels: number[] = [];
        const segments = 67; // Same as voice recording
        const baseVolume = 0.3; // Base volume level
        
        for (let i = 0; i < segments; i++) {
          // Generate random volume levels with some variation
          const variation = (Math.random() - 0.5) * 0.4;
          volumeLevels.push(Math.max(0.1, Math.min(1, baseVolume + variation)));
        }
        
        URL.revokeObjectURL(url);
        resolve({ duration, volumeLevels });
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load audio file'));
      };
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!conversation && !pendingUser) {
      return;
    }

    const text = composerValue.trim();
    if (!text && pendingFiles.length === 0 && !pendingAudio) {
      return;
    }

    // Check if there are audio files that should be treated as voice messages
    const audioFiles = pendingFiles.filter(f => {
      const file = f.file;
      return file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac|wma|opus)$/i.test(file.name);
    });
    
    const otherFiles = pendingFiles.filter(f => {
      const file = f.file;
      return !file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|aac|flac|wma|opus)$/i.test(file.name);
    });

    let audioToSend = pendingAudio;
    
    // If there's an audio file and no pending audio, process it as voice message
    if (audioFiles.length > 0 && !pendingAudio) {
      const firstAudioFile = audioFiles[0];
      try {
        const { duration, volumeLevels } = await extractAudioData(firstAudioFile.file);
        audioToSend = {
          id: `${Date.now()}-${Math.random()}`,
          blob: firstAudioFile.file,
          duration,
          volumeLevels,
          url: URL.createObjectURL(firstAudioFile.file),
        };
      } catch (error) {
        console.error('Failed to extract audio data:', error);
      }
    }

    const files = otherFiles.map(f => f.file);
    await onSendMessage({ 
      text, 
      files: files.length > 0 ? files : undefined,
      audio: audioToSend ? { blob: audioToSend.blob, duration: audioToSend.duration, volumeLevels: audioToSend.volumeLevels } : undefined,
      replyTo 
    });

    setComposerValue('');
    setPendingFiles([]);
    if (pendingAudio) {
      URL.revokeObjectURL(pendingAudio.url);
      setPendingAudio(null);
    }
    if (audioToSend && audioToSend !== pendingAudio) {
      URL.revokeObjectURL(audioToSend.url);
    }
    setReplyTo(null);
  };

  const handleRecordingComplete = (audioBlob: Blob, duration: number, volumeLevels: number[]) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    setPendingAudio({
      id: `${Date.now()}-${Math.random()}`,
      blob: audioBlob,
      duration,
      volumeLevels,
      url: audioUrl,
    });
  };

  const handleRemoveAudio = () => {
    if (pendingAudio) {
      URL.revokeObjectURL(pendingAudio.url);
      setPendingAudio(null);
    }
  };

  const displayConversation: ViewConversation | null =
    conversation ||
    (pendingUser
      ? createViewConversationFromContact(pendingUser, 'pending', user.uid)
      : null);

  // Show empty state for pending conversations
  const isPendingConversation = displayConversation?.id === 'pending';
  const displayMessages = useMemo(() => {
    return isPendingConversation ? [] : messages;
  }, [isPendingConversation, messages]);

  // All hooks must be called before any early return
  const pinnedMessages = useMemo(() => {
    return displayMessages.filter(msg => msg.isPinned);
  }, [displayMessages]);

  // Get caller info for incoming call - must be before early return
  const callerInfo = useMemo(() => {
    if (!callState.callingMessage) return null;
    const callerId = callState.callingMessage.senderId;
    const caller = contactsMap.get(callerId);
    return caller
      ? { displayName: caller.displayName, avatarUrl: caller.avatarUrl }
      : { name: 'Unknown', avatarUrl: undefined };
  }, [callState.callingMessage, contactsMap]);

  if (!displayConversation) {
    return (
      <>
        <PuiStack
          height="100%"
          justifyContent="center"
          alignItems="center"
          gap="10px"
        >
          <PuiTypography variant="body-m-medium" color="grey.400">
            Select a conversation
          </PuiTypography>
          <PuiTypography variant="body-sm-regular" color="grey.300">
            Choose a contact from the list to start chatting.
          </PuiTypography>
        </PuiStack>
        {/* Incoming call popup */}
        {callState.isCalling && callState.callingMessage && callerInfo && (
          <IncomingCallPopup
            callState={callState}
            onAccept={acceptCall}
            onDecline={declineCall}
            callerName={callerInfo.displayName ?? ''}
            callerAvatarUrl={callerInfo.avatarUrl ?? '' }
          />
        )}
        {/* Active call view */}
        {(callState.isConnected || callState.isConnecting) && (
          <CallView
            callState={callState}
            contacts={contactsMap}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onEndCall={endCall}
          />
        )}
      </>
    );
  }

  const handlePinnedMessageClick = (messageId: string) => {
    // Scroll to the pinned message
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the message
      setHighlightedMessageId(messageId);
      
      // Remove highlight after 2 seconds
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    }
  };

  const handleForward = (message: ConversationMessage) => {
    onForward(message);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;

  return (
    <PuiBox 
      width="100%" 
      height="100%" 
      flexGrow="1" 
      className={`middlesection ${isMobile && showConversationList ? 'middlesection--hidden' : ''}`}
      sx={{ position: 'relative' }}
    >
    {isMobile && onOpenAiPanel && !showConversationList && conversation && (
      <PuiBox
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('[ChatView] AI button clicked');
          if (onOpenAiPanel) {
            onOpenAiPanel();
          }
        }}
        sx={{
          position: 'fixed',
          bottom: '79px',
          right: '14px',
          zIndex: 10000,
          cursor: 'pointer',
          pointerEvents: 'auto',
          animation: 'aiButtonMove 80s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        }}
      >
        {/* AI circle - увеличен в 1.25 раза (19px * 1.25 = 23.75px, округлим до 24px) */}
        <PuiBox
          sx={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:active': {
              transform: 'scale(0.9)',
            },
            '&:hover': {
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.6)',
              transform: 'scale(1.1)',
            },
          }}
        >
          <span style={{ color: '#ffffff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.3px' }}>AI</span>
        </PuiBox>
      </PuiBox>
    )}
    <ChatAreaWrapper>
      <ConversationTopBar
        conversation={displayConversation}
        onContactClick={onContactClick}
        onStartCall={startCall}
        onAddParticipant={onAddParticipant}
        onBackToConversationList={onBackToConversationList}
        showConversationList={showConversationList}
      />
      {!isPendingConversation && (
        <PinnedMessages
          messages={displayMessages}
          contactsMap={contactsMap}
          currentUserId={user.uid}
          onMessageClick={handlePinnedMessageClick}
        />
      )}

      <MessagesContainer sx={{ paddingTop: pinnedMessages.length > 0 ? '44px' : 0, position: 'relative' }}>
        {isPendingConversation ? (
          <PuiStack
            height="100%"
            justifyContent="center"
            alignItems="center"
            gap="10px"
          >
            <PuiTypography variant="body-m-medium" color="grey.400">
              Start a conversation with{' '}
              {pendingUser?.displayName || 'this user'}
            </PuiTypography>
            <PuiTypography variant="body-sm-regular" color="grey.300">
              Send a message to begin chatting
            </PuiTypography>
          </PuiStack>
        ) : (
          <MessageList
            messages={displayMessages}
            currentUserId={user.uid}
            isGroup={displayConversation.participants.length > 2}
            contactsMap={contactsMap}
            conversationAvatarColor={displayConversation.displayAvatarColor}
            counterpartId={displayConversation.counterpartId}
            conversationId={displayConversation.id}
            highlightedMessageId={highlightedMessageId}
            onMessageDeleted={() => {
              // Messages will automatically update via Firestore subscription
            }}
            onReply={setReplyTo}
            onForward={handleForward}
          />
        )}
      </MessagesContainer>

      <ConversationInput
        conversationTitle={displayConversation.displayTitle}
        composerValue={composerValue}
        setComposerValue={setComposerValue}
        pendingFiles={pendingFiles}
        setPendingFiles={setPendingFiles}
        pendingAudio={pendingAudio}
        onRecordingComplete={handleRecordingComplete}
        onRemoveAudio={handleRemoveAudio}
        onAudioSent={handleRemoveAudio}
        onSubmit={handleSubmit}
        isSending={isSending}
        onSendMessage={onSendMessage}
        replyTo={replyTo}
        onReplyToChange={setReplyTo}
      />
    </ChatAreaWrapper>

      {/* Incoming call popup */}
      {callState.isCalling && callState.callingMessage && callerInfo && (
        <IncomingCallPopup
          callState={callState}
          onAccept={acceptCall}
          onDecline={declineCall}
          callerName={callerInfo.name}
          callerAvatarUrl={callerInfo.avatarUrl ?? ''}
        />
      )}

      {/* Active call view */}
      {(callState.isConnected || callState.isConnecting) && (
        <CallView
          callState={callState}
          contacts={contactsMap}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onEndCall={endCall}
        />
      )}
    </PuiBox>
  );
}
