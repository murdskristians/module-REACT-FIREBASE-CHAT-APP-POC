import {
  PuiBox,
  PuiDivider,
  PuiIcon,
  PuiSvgIcon,
  PuiTypography,
} from 'piche.ui';
import { useState } from 'react';

import { LogoutModal } from './LogoutModal';
import { IconSize, menuList } from '../../config';

import { ProfileMenuItem } from './ProfileMenuItem';
import { LogoutButton, ProfileMenuWrapper } from './StyledComponents';

type ProfileMenuProps = {
  onSignOut: () => Promise<void> | void;
};

export const ProfileMenu = ({ onSignOut }: ProfileMenuProps) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await onSignOut();
    } finally {
      setShowLogoutModal(false);
    }
  };

  return (
    <ProfileMenuWrapper>
      <PuiTypography variant="body-xl-medium" sx={{ marginBottom: '24px' }}>
        Account settings
      </PuiTypography>
      <PuiBox sx={{ flex: 1 }}>
        {menuList.map((item) => (
          <ProfileMenuItem key={item.path} item={item} />
        ))}
      </PuiBox>

      <PuiDivider orientation="horizontal" sx={{ marginBottom: '16px' }} />
      <LogoutButton
        onClick={() => setShowLogoutModal(true)}
        startIcon={
          <>
            <svg
              width={IconSize.Small}
              height={IconSize.Small}
              style={{ position: 'absolute' }}
            >
              <mask id="logOutIconMask" maskUnits="userSpaceOnUse">
                <PuiSvgIcon
                  icon={PuiIcon.LogOut4}
                  width={IconSize.Small}
                  height={IconSize.Small}
                  stroke="white"
                />
              </mask>
            </svg>
            <div
              style={{
                width: IconSize.Small,
                height: IconSize.Small,
                background:
                  'linear-gradient(101.01deg, #E36464 5.67%, #AD3E3E 105.15%)',
                WebkitMask: 'url(#logOutIconMask)',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskSize: 'contain',
                WebkitMaskPosition: 'center',
                mask: 'url(#logOutIconMask)',
                maskRepeat: 'no-repeat',
                maskSize: 'contain',
                maskPosition: 'center',
              }}
            />
          </>
        }
      >
        Logout
      </LogoutButton>
      <LogoutModal
        showModal={showLogoutModal}
        setShowModal={setShowLogoutModal}
        onLogout={handleLogout}
      />
    </ProfileMenuWrapper>
  );
};
