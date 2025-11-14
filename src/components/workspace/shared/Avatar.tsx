import { PuiBox } from 'piche.ui';
import { FC } from 'react';

import { getInitials } from './avatarUtils';

interface AvatarProps {
  avatarUrl?: string | null;
  name: string;
  avatarColor?: string | null;
  size?: number | string;
  className?: string;
  sx?: Record<string, unknown>;
}

export const Avatar: FC<AvatarProps> = ({
  avatarUrl,
  name,
  avatarColor = '#A8D0FF',
  size = 40,
  className,
  sx,
}) => {
  const initials = getInitials(name);
  const sizeNum =
    typeof size === 'number' ? size : parseInt(size.toString(), 10) || 40;

  return (
    <PuiBox
      className={className}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        backgroundColor: avatarUrl ? undefined : avatarColor,
        color: avatarUrl ? undefined : 'white',
        fontSize: sizeNum <= 32 ? '14px' : '13px',
        fontWeight: 600,
        textTransform: 'uppercase',
        '& img': {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        },
        ...sx,
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} referrerPolicy="no-referrer" />
      ) : (
        initials
      )}
    </PuiBox>
  );
};
