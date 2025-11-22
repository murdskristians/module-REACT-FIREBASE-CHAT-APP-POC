import { PuiBox, PuiIcon, PuiSvgIcon, PuiStack, PuiTypography, useTheme } from 'piche.ui';
import { FC, useState, useRef, useEffect } from 'react';
import { VideoModal } from './VideoModal';

interface MessageFilePreviewProps {
  fileUrl: string;
  fileName: string;
  fileType?: 'video' | 'audio' | 'file';
  onClick?: () => void;
}

export const MessageFilePreview: FC<MessageFilePreviewProps> = ({ fileUrl, fileName, fileType = 'file', onClick }) => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (fileType === 'video' && videoRef.current) {
      const video = videoRef.current;
      const updateTime = () => setCurrentTime(video.currentTime);
      const updateDuration = () => setDuration(video.duration);
      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', updateDuration);
      return () => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateDuration);
      };
    } else if (fileType === 'audio' && audioRef.current) {
      const audio = audioRef.current;
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, [fileType]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (fileType === 'file') {
      window.open(fileUrl, '_blank');
    } else if (fileType === 'video') {
      setIsVideoModalOpen(true);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileType === 'video') {
      setIsVideoModalOpen(true);
    } else if (fileType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (fileType === 'video') {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;
    return (
      <>
        <PuiBox
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '3px' : '8px',
            padding: isMobile ? '3px' : '8px',
            borderRadius: isMobile ? '6px' : '8px',
            background: theme.palette.grey[50],
            width: isMobile ? 'calc(100vw - 64px)' : '389px',
            maxWidth: isMobile ? 'calc(100% - 32px)' : '100%',
            marginBottom: isMobile ? '4px' : '8px',
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={handleClick}
        >
          <PuiBox
            sx={{
              position: 'relative',
              width: '100%',
              borderRadius: isMobile ? '4px' : '4px',
              overflow: 'hidden',
              background: theme.palette.grey[900],
              maxHeight: isMobile ? '120px' : 'none',
              aspectRatio: isMobile ? '16/9' : 'auto',
            }}
          >
            <video
              ref={videoRef}
              src={fileUrl}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                }
              }}
            />
            <PuiBox
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: isMobile ? '24px' : '48px',
                height: isMobile ? '24px' : '48px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <PuiSvgIcon
                icon={PuiIcon.PlayFilled}
                width={isMobile ? 12 : 24}
                height={isMobile ? 12 : 24}
                stroke="#ffffff"
                fill="#ffffff"
              />
            </PuiBox>
          </PuiBox>
          <PuiStack sx={{ flexDirection: 'row', alignItems: 'center', gap: isMobile ? '4px' : '8px' }}>
            <PuiTypography
              variant="body-m-medium"
              sx={{
                fontSize: isMobile ? '11px' : '13px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
              }}
            >
              {fileName}
            </PuiTypography>
            {duration > 0 && (
              <PuiTypography variant="body-sm-regular" sx={{ fontSize: isMobile ? '10px' : '12px', color: theme.palette.grey[600] }}>
                {formatTime(duration)}
              </PuiTypography>
            )}
          </PuiStack>
        </PuiBox>
        <VideoModal
          videoUrl={fileUrl}
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
        />
      </>
    );
  }

  if (fileType === 'audio') {
    return (
      <PuiBox
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          padding: '8px',
          borderRadius: '8px',
          background: theme.palette.grey[50],
          width: '389px',
          maxWidth: '100%',
          marginBottom: '8px',
          '&:hover': {
            background: theme.palette.grey[100],
          },
        }}
      >
        <PuiBox
          onClick={togglePlay}
          sx={{
            width: '46px',
            height: '46px',
            minWidth: '46px',
            minHeight: '46px',
            borderRadius: '4px',
            background: theme.palette.grey[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <PuiSvgIcon
            icon={isPlaying ? PuiIcon.Pause : PuiIcon.PlayFilled}
            width={24}
            height={24}
            stroke={theme.palette.primary.main}
          />
        </PuiBox>
        <PuiStack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
          <PuiTypography
            variant="body-m-medium"
            sx={{
              fontSize: '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '200px',
            }}
          >
            {fileName}
          </PuiTypography>
          {duration > 0 && (
            <PuiTypography variant="body-sm-regular" sx={{ fontSize: '12px', color: theme.palette.grey[600] }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </PuiTypography>
          )}
        </PuiStack>
        <audio
          ref={audioRef}
          src={fileUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
      </PuiBox>
    );
  }

  return (
    <PuiBox
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        padding: '8px',
        borderRadius: '8px',
        background: theme.palette.grey[50],
        width: '219px',
        marginBottom: '8px',
        '&:hover': {
          background: theme.palette.grey[100],
        },
      }}
    >
      <PuiBox
        sx={{
          width: '46px',
          height: '46px',
          minWidth: '46px',
          minHeight: '46px',
          borderRadius: '4px',
          background: theme.palette.grey[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <PuiSvgIcon
          icon={PuiIcon.Attachment}
          width={24}
          height={24}
          stroke={theme.palette.grey[400]}
        />
      </PuiBox>
      <PuiStack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
        <PuiTypography
          variant="body-m-medium"
          sx={{
            fontSize: '13px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '165px',
          }}
        >
          {fileName}
        </PuiTypography>
        <PuiTypography variant="body-sm-regular" sx={{ fontSize: '12px', color: theme.palette.grey[600] }}>
          File
        </PuiTypography>
      </PuiStack>
    </PuiBox>
  );
};

