import { PuiBox, PuiIcon, PuiIconButton, PuiPopper, PuiSvgIcon, useTheme } from 'piche.ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVoiceRecording } from '../../../hooks/useVoiceRecording';
import { VoiceTimeline } from './voice/VoiceTimeline';

interface VoiceInputProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number, volumeLevels: number[]) => void;
}

const RECORD_POPUP_OFFSET_PX = 8;

export function VoiceInput({ onRecordingComplete }: VoiceInputProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isRecording, audioBlob, duration, volumeLevels, startRecording, stopRecording, reset } = useVoiceRecording();
  const [pendingCompletion, setPendingCompletion] = useState<{ duration: number; volumeLevels: number[] } | null>(null);

  // Handle audio blob completion
  useEffect(() => {
    if (audioBlob && pendingCompletion && onRecordingComplete && !isRecording) {
      onRecordingComplete(audioBlob, pendingCompletion.duration, pendingCompletion.volumeLevels);
      setPendingCompletion(null);
    }
  }, [audioBlob, pendingCompletion, onRecordingComplete, isRecording]);

  const handleClick = useCallback(() => {
    if (isRecording) {
      // Stop recording and wait for blob to be created
      stopRecording(true);
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleSendingVoiceMessage = useCallback(async () => {
    const currentDuration = duration;
    const currentVolumeLevels = [...volumeLevels];
    setPendingCompletion({ duration: currentDuration, volumeLevels: currentVolumeLevels });
    await stopRecording(true);
  }, [stopRecording, duration, volumeLevels]);

  return (
    <>
      <PuiBox ref={containerRef}>
        {isRecording ? (
          <PuiIconButton
            onClick={handleSendingVoiceMessage}
            sx={{
              position: 'relative',
              zIndex: 1,
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              background: 'linear-gradient(112deg, #3398DB -3.42%, #3375A0 98.18%)',
              '&:hover': {
                background: 'linear-gradient(112deg, #3192D3 -3.42%, #235373 98.18%)',
              },
              svg: {
                color: theme.palette.background.paper,
              },
            }}
          >
            <PuiSvgIcon width={16} height={16} icon={PuiIcon.Check} />
          </PuiIconButton>
        ) : (
          <PuiIconButton
            onClick={handleClick}
            sx={{
              padding: '4px',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <PuiSvgIcon width={16} height={16} icon={PuiIcon.Microphone} />
          </PuiIconButton>
        )}
      </PuiBox>
      <PuiPopper
        open={isRecording}
        anchorEl={containerRef.current}
        placement="top"
        modifiers={[{ name: 'offset', options: { offset: [0, RECORD_POPUP_OFFSET_PX] } }]}
      >
        <PuiBox
          sx={{
            position: 'relative',
            width: 269,
            padding: '15px',
            gap: '12px',
            borderRadius: '12px',
            border: `1px solid ${theme.palette.grey[50]}`,
            background: theme.palette.background.default,
          }}
        >
          <PuiIconButton
            onClick={reset}
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              background: theme.palette.common.white,
              border: `1px solid ${theme.palette.grey[50]}`,
              '&:hover': {
                background: theme.palette.common.white,
                borderColor: theme.palette.grey[100],
                '& svg': {
                  color: theme.palette.grey[400],
                },
              },
              svg: {
                color: theme.palette.grey[300],
              },
            }}
          >
            <PuiSvgIcon width={12} height={12} icon={PuiIcon.XClose} />
          </PuiIconButton>
          <VoiceTimeline duration={duration} />
        </PuiBox>
      </PuiPopper>
    </>
  );
}
