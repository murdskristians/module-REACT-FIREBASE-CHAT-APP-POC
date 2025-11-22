import { PuiBox } from 'piche.ui';
import { FC } from 'react';

interface MessageImagePreviewProps {
  imageUrl: string;
  alt?: string;
  onClick?: () => void;
}

export const MessageImagePreview: FC<MessageImagePreviewProps> = ({ imageUrl, alt = 'Image', onClick }) => {
  return (
    <PuiBox
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '8px',
        overflow: 'hidden',
        width: '389px',
        maxWidth: '100%',
        marginBottom: '8px',
        flexShrink: 0, // Prevent shrinking
        '@media (max-width: 768px)': {
          width: '280px',
          maxWidth: '85%',
        },
        '@media (max-width: 480px)': {
          width: '240px',
          maxWidth: '80%',
        },
        '& img': {
          width: '389px',
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: '8px',
          '@media (max-width: 768px)': {
            width: '280px',
            maxWidth: '100%',
          },
          '@media (max-width: 480px)': {
            width: '240px',
            maxWidth: '100%',
          },
        },
      }}
    >
      <img src={imageUrl} alt={alt} loading="lazy" style={{ width: '100%', height: 'auto', display: 'block' }} />
    </PuiBox>
  );
};

