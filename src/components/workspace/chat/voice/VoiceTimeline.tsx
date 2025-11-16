import { PuiBox, PuiTypography } from 'piche.ui';
import { useMemo } from 'react';

interface VoiceTimelineProps {
  duration: number;
}

const MAX_VOICE_DURATION_MS = 60000; // 60 seconds
const MAX_PROGRESS_PERCENT = 100;
const PROGRESS_MULTIPLIER = MAX_PROGRESS_PERCENT / MAX_VOICE_DURATION_MS;

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const calculateVoiceProgress = (duration: number) => {
  return Math.min(duration * PROGRESS_MULTIPLIER, MAX_PROGRESS_PERCENT);
};

export const VoiceTimeline = ({ duration }: VoiceTimelineProps) => {
  const progress = useMemo(() => calculateVoiceProgress(duration), [duration]);

  return (
    <PuiBox
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        gap: '12px',
      }}
    >
      <PuiBox
        sx={{
          position: 'relative',
          height: '8px',
          backgroundColor: 'var(--border-color, #f0f0f0)',
          borderRadius: '44px',
          flexGrow: 1,
        }}
      >
        <PuiBox
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            backgroundColor: 'var(--palette-primary, #3398DB)',
            borderRadius: '44px',
            width: `${progress}%`,
            pointerEvents: 'none',
          }}
        />
      </PuiBox>
      <PuiBox
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <PuiBox
          sx={{
            width: '10px',
            height: '10px',
            backgroundColor: '#f44336',
            borderRadius: '50%',
          }}
        />
        <PuiBox
          sx={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PuiTypography variant="body-sm-medium" sx={{ color: 'var(--text-primary, #1f2131)' }}>
            {formatDuration(duration)}
          </PuiTypography>
        </PuiBox>
      </PuiBox>
    </PuiBox>
  );
};

