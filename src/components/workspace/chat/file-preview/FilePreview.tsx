import { PuiBox, PuiCircularProgress, PuiIcon, PuiSvgIcon, PuiStack, PuiTypography, useTheme } from 'piche.ui';
import { useEffect, useMemo, useState } from 'react';

export interface FilePreviewItem {
  id: string;
  file: File;
  previewUrl?: string;
  uploadProgress?: number;
  isUploading?: boolean;
  isUploaded?: boolean;
  error?: string;
}

interface FilePreviewProps {
  item: FilePreviewItem;
  onRemove: (id: string) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const isImageFile = (file: File): boolean => {
  // Check MIME type first
  if (file.type && file.type.startsWith('image/')) {
    return true;
  }
  
  // Fallback: check file extension
  const fileName = file.name.toLowerCase();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  return imageExtensions.some(ext => fileName.endsWith(ext));
};

const isVideoFile = (file: File): boolean => {
  if (file.type && file.type.startsWith('video/')) {
    return true;
  }
  const fileName = file.name.toLowerCase();
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.m4v'];
  return videoExtensions.some(ext => fileName.endsWith(ext));
};

const isAudioFile = (file: File): boolean => {
  if (file.type && file.type.startsWith('audio/')) {
    return true;
  }
  const fileName = file.name.toLowerCase();
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma', '.opus'];
  return audioExtensions.some(ext => fileName.endsWith(ext));
};

export const FilePreview: React.FC<FilePreviewProps> = ({ item, onRemove }) => {
  const theme = useTheme();
  const fileSize = useMemo(() => formatFileSize(item.file.size), [item.file.size]);
  const isImage = isImageFile(item.file);
  const isVideo = isVideoFile(item.file);
  const isAudio = isAudioFile(item.file);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  
  // Create object URL for images/videos/audio when component mounts or file changes
  useEffect(() => {
    if ((isImage || isVideo || isAudio) && item.file) {
      try {
        const url = URL.createObjectURL(item.file);
        setPreviewUrl(url);
        
        // Cleanup on unmount or when file changes
        return () => {
          URL.revokeObjectURL(url);
          setPreviewUrl(null);
        };
      } catch (error) {
        console.error('Failed to create object URL for media:', error);
        setPreviewUrl(null);
      }
    } else {
      setPreviewUrl(null);
    }
  }, [item.file, isImage, isVideo, isAudio]);

  // Generate video thumbnail
  useEffect(() => {
    if (isVideo && previewUrl && !videoThumbnail) {
      const video = document.createElement('video');
      video.src = previewUrl;
      video.currentTime = 0.1; // Get frame at 0.1 seconds
      video.muted = true;
      
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL('image/jpeg');
          setVideoThumbnail(thumbnailUrl);
        }
      };
      
      video.load();
      
      return () => {
        if (videoThumbnail && videoThumbnail.startsWith('data:')) {
          // Cleanup data URL if needed
        }
      };
    }
  }, [isVideo, previewUrl, videoThumbnail]);

  const handleRemove = () => {
    onRemove(item.id);
  };

  return (
    <PuiBox
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        borderRadius: '8px',
        background: theme.palette.grey[50],
        width: '213px',
        flexShrink: 0,
        position: 'relative',
        '&:hover .delete-button': {
          visibility: 'visible',
        },
      }}
    >
      {isImage && previewUrl ? (
        <PuiBox
          sx={{
            width: '46px',
            height: '46px',
            minWidth: '46px',
            minHeight: '46px',
            borderRadius: '4px',
            overflow: 'hidden',
            background: theme.palette.grey[100],
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <img 
            src={previewUrl} 
            alt={item.file.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              console.error('Failed to load image preview:', item.file.name);
            }}
          />
        </PuiBox>
      ) : isVideo && (videoThumbnail || previewUrl) ? (
        <PuiBox
          sx={{
            width: '80px',
            height: '80px',
            minWidth: '80px',
            minHeight: '80px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: theme.palette.grey[900],
            position: 'relative',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {videoThumbnail ? (
            <img
              src={videoThumbnail}
              alt="Video thumbnail"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : null}
          <PuiBox
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PuiSvgIcon
              icon={PuiIcon.PlayFilled}
              width={18}
              height={18}
              stroke="#ffffff"
              fill="#ffffff"
            />
          </PuiBox>
          <PuiBox
            sx={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              background: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '4px',
              padding: '2px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <PuiSvgIcon
              icon={PuiIcon.VideoRecorder}
              width={12}
              height={12}
              stroke="#ffffff"
            />
            <PuiTypography
              variant="body-sm-regular"
              sx={{
                fontSize: '10px',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              VIDEO
            </PuiTypography>
          </PuiBox>
        </PuiBox>
      ) : isAudio ? (
        <PuiBox
          sx={{
            width: '80px',
            height: '80px',
            minWidth: '80px',
            minHeight: '80px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PuiSvgIcon
            icon={PuiIcon.PlayFilled}
            width={32}
            height={32}
            stroke="#ffffff"
            fill="#ffffff"
          />
          <PuiBox
            sx={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              background: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '4px',
              padding: '2px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <PuiSvgIcon
              icon={PuiIcon.PlayFilled}
              width={12}
              height={12}
              stroke="#ffffff"
            />
            <PuiTypography
              variant="body-sm-regular"
              sx={{
                fontSize: '10px',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              AUDIO
            </PuiTypography>
          </PuiBox>
        </PuiBox>
      ) : (
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
          }}
        >
          <PuiSvgIcon
            icon={PuiIcon.Attachment}
            width={24}
            height={24}
            stroke={theme.palette.grey[400]}
          />
        </PuiBox>
      )}
      <PuiStack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
        <PuiStack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <PuiTypography
            variant="body-m-medium"
            sx={{
              fontSize: '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isVideo || isAudio ? '120px' : '91px',
            }}
          >
            {item.file.name}
          </PuiTypography>
          <PuiBox
            sx={{
              display: 'flex',
              width: '24px',
              height: '24px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.isUploading ? (
              <PuiCircularProgress size={16} />
            ) : item.isUploaded ? (
              <PuiSvgIcon
                icon={PuiIcon.Check}
                width={16}
                height={16}
                stroke={theme.palette.success.main}
              />
            ) : (
              <PuiSvgIcon
                icon={PuiIcon.XClose}
                width={16}
                height={16}
                stroke={theme.palette.grey[300]}
                className="delete-button"
                sx={{
                  cursor: 'pointer',
                  visibility: 'hidden',
                }}
                onClick={handleRemove}
              />
            )}
          </PuiBox>
        </PuiStack>
        <PuiTypography variant="body-sm-regular" sx={{ fontSize: '12px', color: theme.palette.grey[600] }}>
          {isVideo ? 'Video' : isAudio ? 'Audio' : fileSize}
        </PuiTypography>
      </PuiStack>
    </PuiBox>
  );
};

