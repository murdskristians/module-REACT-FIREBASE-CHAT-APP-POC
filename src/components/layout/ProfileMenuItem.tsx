import type { PuiIcon } from 'piche.ui';
import { Colors, PuiSvgIcon, PuiTypography } from 'piche.ui';

import { ProfileMenuItemWrapper } from './StyledComponents';

interface ProfileMenuItemProps {
  item: { title: string; path: string; icon: PuiIcon; enabled: boolean };
  isSelected: boolean;
}

export const ProfileMenuItem = ({ item, isSelected }: ProfileMenuItemProps) => {
  const isDisabled = !item.enabled;
  const iconColor = isSelected ? Colors.blue.base : '#A7AEC3';

  return (
    <ProfileMenuItemWrapper
      className={`${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
      role="menuitem"
      aria-disabled={isDisabled}
    >
      <PuiSvgIcon
        icon={item.icon}
        width={20}
        height={20}
        stroke={iconColor}
      />
      <PuiTypography
        variant="body-sm-medium"
        sx={{ fontSize: '13px', color: isSelected ? '#20243B' : '#8A90A6' }}
      >
        {item.title}
      </PuiTypography>
    </ProfileMenuItemWrapper>
  );
};
