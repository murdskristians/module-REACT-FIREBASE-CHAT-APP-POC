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
        '& img': {
          width: '389px',
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: '8px',
        },
      }}
    >
      <img src={imageUrl} alt={alt} loading="lazy" style={{ width: '389px', maxWidth: '100%', height: 'auto' }} />
    </PuiBox>
  );
};

