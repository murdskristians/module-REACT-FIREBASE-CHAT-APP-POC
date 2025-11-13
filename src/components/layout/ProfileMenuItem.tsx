import type { PuiIcon } from 'piche.ui';
import { Colors, PuiSvgIcon, PuiTypography } from 'piche.ui';

import { ProfileMenuItemWrapper } from './StyledComponents';

interface ProfileMenuItemProps {
  item: { title: string; path: string; icon: PuiIcon; enabled: boolean };
}

export const ProfileMenuItem = ({ item }: ProfileMenuItemProps) => {
  return (
    <ProfileMenuItemWrapper
      className={`${true ? 'selected' : ''} ${!item.enabled ? 'disabled' : ''}`}
      onClick={() => {}}
    >
      <PuiSvgIcon
        icon={item.icon}
        width={20}
        height={20}
        stroke={Colors.blue.base}
      />
      <PuiTypography variant="body-sm-medium">{item.title}</PuiTypography>
    </ProfileMenuItemWrapper>
  );
};
