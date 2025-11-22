import { PuiBox, PuiIcon, PuiSvgIcon, PuiTypography, useTheme } from 'piche.ui';
import { FormEvent, useState, useRef, useCallback } from 'react';

import type { MessageReply } from '../../../firebase/conversations';
import { AddMedia } from './AddMedia';
import { EmojiList } from './EmojiList';
import { Reply } from './message-card/reply/Reply';
import { SendMessage } from './SendMessage';
import { StyledConversationInput, StyledInputBox, StyledInputWrapper } from './StyledComponents';
import { VoiceInput } from './VoiceInput';
import { FilesInputArea, FilePreviewItem } from './file-preview/FilesInputArea';
import { useNotification, NotificationType } from '../../notifications/NotificationProvider';

interface PendingAudio {
  id: string;
  blob: Blob;
  duration: number;
  volumeLevels: number[];
  url: string;
}

interface ConversationInputProps {
  conversationTitle: string;
  composerValue: string;
  setComposerValue: (value: string) => void;
  pendingFiles: FilePreviewItem[];
  setPendingFiles: (files: FilePreviewItem[]) => void;
  pendingAudio?: PendingAudio | null;
  onRecordingComplete?: (audioBlob: Blob, duration: number, volumeLevels: number[]) => void;
  onRemoveAudio?: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isSending: boolean;
  onSendMessage: (payload: { text: string; files?: File[]; audio?: { blob: Blob; duration: number; volumeLevels: number[] } }) => Promise<void>;
  replyTo?: MessageReply | null;
  onReplyToChange?: (replyTo: MessageReply | null) => void;
  onAudioSent?: () => void;
}

export function ConversationInput({
  conversationTitle,
  composerValue,
  setComposerValue,
  pendingFiles,
  setPendingFiles,
  pendingAudio,
  onRecordingComplete,
  onRemoveAudio,
  onAudioSent,
  onSubmit,
  isSending,
  onSendMessage,
  replyTo,
  onReplyToChange,
}: ConversationInputProps) {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const [isInputActive, setIsInputActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleEmojiSelect = (emoji: string) => {
    setComposerValue(composerValue + emoji);
  };

  const handleRemoveFile = (id: string) => {
    setPendingFiles(pendingFiles.filter(f => f.id !== id));
  };

  const isVideoFile = (file: File): boolean => {
    return file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v)$/i.test(file.name);
  };

  const handleFileSelect = useCallback((file: File) => {
    const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB for video
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for other files
    
    // Check video file size
    if (isVideoFile(file) && file.size > MAX_VIDEO_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      showNotification({
        message: `Video file is too large (${fileSizeMB}MB). Maximum size for a single video is 20MB.`,
        type: NotificationType.Error,
      });
      return;
    }
    
    // Check other file sizes
    if (!isVideoFile(file) && file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      showNotification({
        message: `File size exceeds 10MB limit. Selected file is ${fileSizeMB}MB`,
        type: NotificationType.Error,
      });
      return;
    }
    
    const newFile: FilePreviewItem = {
      id: `${Date.now()}-${Math.random()}`,
      file,
      isUploading: false,
      isUploaded: false,
    };
    setPendingFiles((prev) => [...prev, newFile]);
  }, [showNotification, setPendingFiles]);

  const handleFilesSelected = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => handleFileSelect(file));
  }, [handleFileSelect]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesSelected(files);
    }
  }, [handleFilesSelected]);

  const handleRemoveAudio = () => {
    if (onRemoveAudio) {
      onRemoveAudio();
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    const text = composerValue.trim();
    if (!text && pendingFiles.length === 0 && !pendingAudio) return;
    const files = pendingFiles.map(f => f.file);
    const hasAudio = !!pendingAudio;
    await onSendMessage({ 
      text, 
      files: files.length > 0 ? files : undefined,
      audio: pendingAudio ? { blob: pendingAudio.blob, duration: pendingAudio.duration, volumeLevels: pendingAudio.volumeLevels } : undefined,
    });
    setComposerValue('');
    setPendingFiles([]);
    // Clear audio after sending
    if (hasAudio && onAudioSent) {
      onAudioSent();
    }
  };

  return (
    <StyledInputWrapper
      ref={dropZoneRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{
        position: 'relative',
        ...(isDragging && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '2px dashed var(--palette-primary, #4AA3DF)',
            borderRadius: '12px',
            backgroundColor: 'rgba(74, 163, 223, 0.05)',
            zIndex: 1000,
            pointerEvents: 'none',
          },
        }),
      }}
    >
      {replyTo && (
        <PuiBox
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--palette-message-bg, #E8F4FB)',
            padding: '8px 12px',
            borderRadius: '12px',
            marginBottom: '8px',
            position: 'relative',
          }}
        >
          <PuiBox sx={{ flex: 1, minWidth: 0 }}>
            <Reply replyTo={replyTo} />
          </PuiBox>
          {onReplyToChange && (
            <PuiBox
              onClick={() => onReplyToChange(null)}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                flexShrink: 0,
              }}
            >
              <PuiSvgIcon
                icon={PuiIcon.XClose}
                width={16}
                height={16}
                stroke={theme.palette.grey[300]}
              />
            </PuiBox>
          )}
        </PuiBox>
      )}
      {pendingAudio && (
        <PuiBox
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'var(--bg-tertiary, ' + theme.palette.grey[50] + ')',
            marginBottom: '8px',
            position: 'relative',
          }}
        >
          <PuiBox
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: 1,
            }}
          >
            <PuiSvgIcon
              icon={PuiIcon.PlayFilled}
              width={20}
              height={20}
              stroke={'var(--palette-primary, ' + theme.palette.primary.main + ')'}
            />
            <PuiTypography variant="body-sm-regular" sx={{ fontSize: '13px', color: 'var(--text-primary, #1f2131)' }}>
              Voice message {formatDuration(pendingAudio.duration)}
            </PuiTypography>
          </PuiBox>
          <PuiBox
            onClick={handleRemoveAudio}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              flexShrink: 0,
            }}
          >
            <PuiSvgIcon
              icon={PuiIcon.XClose}
              width={16}
              height={16}
              stroke={'var(--text-secondary, ' + theme.palette.grey[300] + ')'}
            />
          </PuiBox>
        </PuiBox>
      )}
      <FilesInputArea files={pendingFiles} onRemoveFile={handleRemoveFile}>
        <StyledConversationInput
          className={isInputActive ? 'active' : ''}
          component="form"
          onSubmit={onSubmit}
        >
          <StyledInputBox>
            <AddMedia onFileSelect={handleFileSelect} />
            <EmojiList onEmojiSelect={handleEmojiSelect} />
            <input
              type="text"
              placeholder={pendingFiles.length > 0 ? 'Add a caption...' : `Message ${conversationTitle}`}
              value={composerValue}
              onChange={(event) => setComposerValue(event.target.value)}
              onFocus={() => setIsInputActive(true)}
              onBlur={() => setIsInputActive(false)}
              className="chat-panel__composer-input"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                fontFamily: 'Poppins, Inter, sans-serif',
                color: 'var(--text-primary, #272727)',
              }}
            />
            <VoiceInput onRecordingComplete={onRecordingComplete} />
            {(composerValue.trim() || pendingFiles.length > 0 || pendingAudio) && (
              <>
                <div
                  style={{
                    width: '1px',
                    height: '24px',
                    background: 'var(--border-color, #f0f0f0)',
                    margin: '0 11px',
                  }}
                />
                <SendMessage
                  handleSend={handleSend}
                  disabled={isSending}
                />
              </>
            )}
          </StyledInputBox>
        </StyledConversationInput>
      </FilesInputArea>
    </StyledInputWrapper>
  );
}
