import { PuiBox, PuiIcon, PuiIconButton, PuiSvgIcon, useTheme } from 'piche.ui';
import { FC } from 'react';

interface CallBottomPanelProps {
  audioMuted: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export const CallBottomPanel: FC<CallBottomPanelProps> = ({
  audioMuted,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
}) => {
  const theme = useTheme();

  return (
    <PuiBox
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        padding: '16px',
      }}
    >
      {/* Microphone toggle */}
      <PuiIconButton
        onClick={onToggleAudio}
        sx={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: audioMuted ? theme.palette.error.main : theme.palette.grey[700],
          '&:hover': {
            backgroundColor: audioMuted ? theme.palette.error.dark : theme.palette.grey[600],
          },
        }}
      >
        <PuiSvgIcon
          icon={audioMuted ? PuiIcon.MicrophoneOff : PuiIcon.Microphone}
          width={24}
          height={24}
          stroke="white"
        />
      </PuiIconButton>

      {/* End call */}
      <PuiIconButton
        onClick={onEndCall}
        sx={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: theme.palette.error.main,
          '&:hover': {
            backgroundColor: theme.palette.error.dark,
          },
        }}
      >
        <PuiSvgIcon
          icon={PuiIcon.Phone2Call}
          width={24}
          height={24}
          stroke="white"
        />
      </PuiIconButton>

      {/* Video toggle */}
      <PuiIconButton
        onClick={onToggleVideo}
        sx={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: videoEnabled ? theme.palette.grey[700] : theme.palette.error.main,
          '&:hover': {
            backgroundColor: videoEnabled ? theme.palette.grey[600] : theme.palette.error.dark,
          },
        }}
      >
        <PuiSvgIcon
          icon={videoEnabled ? PuiIcon.VideoRecorder : PuiIcon.VideoRecorderOff}
          width={24}
          height={24}
          stroke="white"
        />
      </PuiIconButton>
    </PuiBox>
  );
};

