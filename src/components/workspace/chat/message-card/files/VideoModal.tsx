import { PuiBox, PuiIcon, PuiIconButton, PuiSvgIcon } from 'piche.ui';
import { FC, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';

interface VideoModalProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: FC<VideoModalProps> = ({ videoUrl, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setPlayed(0);
    } else {
      setIsPlaying(false);
      setPlayed(0);
    }
  }, [isOpen]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat(e.currentTarget.value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <PuiBox
      onClick={handleBackdropClick}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <PuiBox
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: '70%',
          maxWidth: '1200px',
          position: 'relative',
          backgroundColor: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Close Button */}
        <PuiIconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10001,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
        >
          <PuiSvgIcon icon={PuiIcon.XClose} width={24} height={24} stroke="#fff" />
        </PuiIconButton>

        {/* Video Player */}
        <PuiBox
          sx={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%', // 16:9 aspect ratio
            backgroundColor: '#000',
          }}
        >
          <PuiBox
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              playing={isPlaying}
              volume={volume}
              width="100%"
              height="100%"
              onProgress={handleProgress}
              controls={false}
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload',
                  },
                },
              }}
            />
          </PuiBox>
        </PuiBox>

        {/* Controls */}
        <PuiBox
          sx={{
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Play/Pause Button */}
          <PuiBox sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PuiIconButton
              onClick={handlePlayPause}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <PuiSvgIcon
                icon={isPlaying ? PuiIcon.Pause : PuiIcon.PlayFilled}
                width={24}
                height={24}
                stroke="#fff"
                fill="#fff"
              />
            </PuiIconButton>

            {/* Progress Bar */}
            <PuiBox sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={played}
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
            </PuiBox>

            {/* Volume Control */}
            <PuiBox sx={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
              <PuiSvgIcon
                icon={PuiIcon.Microphone}
                width={20}
                height={20}
                stroke="#fff"
              />
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
            </PuiBox>
          </PuiBox>
        </PuiBox>
      </PuiBox>
    </PuiBox>
  );
};

