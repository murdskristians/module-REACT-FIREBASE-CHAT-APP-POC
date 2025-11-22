import { PuiBox, PuiIcon, PuiIconButton, PuiSvgIcon, PuiTypography, useTheme } from 'piche.ui';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import type { ConversationMessage } from '../../../../firebase/conversations';
import { VoiceVolumeTimeline } from './voice/VoiceVolumeTimeline';

interface VoiceMessageProps {
  message: ConversationMessage;
  isUserMessage?: boolean;
  time?: string; // Time is passed but not displayed here - it's shown in TextMessage or separately
}

const formatDuration = (ms: number): string => {
  if (!ms || !isFinite(ms) || isNaN(ms) || ms < 0) {
    return '0:00';
  }
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const PLAYBACK_RATES = {
  original: 1,
  x2: 1.5,
  x3: 2,
};

export const VoiceMessage: FC<VoiceMessageProps> = ({ message, isUserMessage = false, time }) => {
  const theme = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => {
    const msgDuration = message.audioDuration;
    if (msgDuration && isFinite(msgDuration) && !isNaN(msgDuration) && msgDuration > 0) {
      return msgDuration;
    }
    return 0;
  });
  const [playbackRate, setPlaybackRate] = useState<number>(PLAYBACK_RATES.original);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const time = audio.currentTime * 1000;
      if (isFinite(time) && !isNaN(time) && time >= 0) {
        setCurrentTime(time);
      }
    };
    const updateDuration = () => {
      const audioDuration = audio.duration;
      if (audioDuration && isFinite(audioDuration) && !isNaN(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration * 1000);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSpeedChange = useCallback(() => {
    const rates = [PLAYBACK_RATES.original, PLAYBACK_RATES.x2, PLAYBACK_RATES.x3];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  }, [playbackRate]);

  const handleVoiceBarClick = useCallback((index: number) => {
    const audio = audioRef.current;
    if (!audio || !duration || !isFinite(duration) || isNaN(duration) || duration <= 0) return;

    const volumeLevelsCount = message.audioVolumeLevels?.length || 67;
    if (volumeLevelsCount <= 0) return;

    const segmentDuration = duration / volumeLevelsCount;
    const targetTime = (index * segmentDuration) / 1000; // Convert to seconds
    if (isFinite(targetTime) && !isNaN(targetTime) && targetTime >= 0) {
      audio.currentTime = targetTime;
      setCurrentTime(targetTime * 1000);
    }
  }, [duration, message.audioVolumeLevels]);

  const volumeLevels = message.audioVolumeLevels || [];
  const currentTimeSeconds = isFinite(currentTime) && !isNaN(currentTime) && currentTime >= 0 
    ? currentTime / 1000 
    : 0;
  const safeDuration = isFinite(duration) && !isNaN(duration) && duration > 0 ? duration : 0;

  return (
    <PuiBox
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        maxWidth: '282px',
        padding: '4px 0',
      }}
    >
      <audio ref={audioRef} src={message.audioUrl || undefined} preload="metadata" />
      
      {/* Play Button */}
      <PuiIconButton
        onClick={handlePlayPause}
        sx={{
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: 'linear-gradient(111.52deg, #3398DB -3.42%, #3375A0 98.18%)',
          flexShrink: 0,
          '&:hover': {
            backgroundColor: '#3375A0',
          },
        }}
      >
        <PuiSvgIcon
          width={20}
          height={20}
          icon={isPlaying ? PuiIcon.Pause : PuiIcon.PlayFilled}
          stroke="white"
          fill="white"
        />
      </PuiIconButton>

      {/* Message Content */}
      <PuiBox
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          flex: 1,
          minWidth: 0,
          padding: '0 4px',
        }}
      >
        {/* Waveform */}
        <PuiBox
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '15px',
            flexGrow: 1,
            marginBottom: '4px',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <VoiceVolumeTimeline
            duration={safeDuration}
            currentTime={currentTimeSeconds}
            volumeLevels={volumeLevels}
            onBarClick={handleVoiceBarClick}
          />
        </PuiBox>

        {/* Duration and Speed */}
        <PuiBox
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '4px',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <PuiBox
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <PuiBox
              sx={{
                width: '33px',
                display: 'flex',
              }}
            >
              <PuiTypography
                variant="body-sm-regular"
                sx={{
                  fontSize: '12px',
                  color: theme.palette.grey[600],
                }}
              >
                {isPlaying && currentTime > 0 ? formatDuration(currentTime) : formatDuration(safeDuration)}
              </PuiTypography>
            </PuiBox>
            
            <PuiIconButton
              onClick={handleSpeedChange}
              sx={{
                backgroundColor: isUserMessage ? theme.palette.primary[25] || '#E8F4FD' : theme.palette.grey[50],
                borderRadius: '16px',
                width: '30px',
                height: '19px',
                marginLeft: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                minWidth: '30px',
              }}
            >
              <PuiTypography
                variant="body-sm-regular"
                sx={{
                  fontSize: '12px',
                  color: theme.palette.grey[600],
                }}
              >
                {playbackRate}x
              </PuiTypography>
            </PuiIconButton>
          </PuiBox>
        </PuiBox>
      </PuiBox>
    </PuiBox>
  );
};

