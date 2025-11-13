import { PuiBox, PuiIcon, PuiSvgIcon, useTheme } from 'piche.ui';

import { ProfileContact } from '@/types/profile';

import {
  AvatarBackdrop,
  AvatarWrapper,
  StyledAvatar,
} from './StyledComponents';

interface PersonalDataHeaderProps {
  profileContact: ProfileContact;
}

export const PersonalDataHeader = ({
  profileContact,
}: PersonalDataHeaderProps) => {
  const theme = useTheme();
  const coverImageUrl =
    profileContact.coverImageUrl ??
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&auto=format&fit=crop';

  return (
    <PuiBox sx={{ position: 'relative', paddingBottom: '24px' }}>
      <PuiBox
        component="img"
        src={coverImageUrl}
        alt="Profile cover"
        sx={{
          width: '100%',
          height: '196px',
          objectFit: 'cover',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          userSelect: 'none',
        }}
      />
      <AvatarWrapper>
        <StyledAvatar
          size={80}
          contact={{
            id: profileContact.id,
            name: profileContact.name,
            email: profileContact.email ?? undefined,
            avatarUrl: profileContact.avatarUrl ?? undefined,
          }}
        />
        <AvatarBackdrop className="avatar-backdrop">
          <PuiSvgIcon
            icon={PuiIcon.Upload}
            width={24}
            height={24}
            stroke={theme.palette.common.white}
          />
        </AvatarBackdrop>
      </AvatarWrapper>
    </PuiBox>
  );
};
