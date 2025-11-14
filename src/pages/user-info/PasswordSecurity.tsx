import { useState } from 'react';
import { PuiBox, PuiTypography, PuiButton, PuiInput, PuiPasswordInput } from 'piche.ui';

export const PasswordSecurity = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <PuiBox
      sx={{
        height: '100%',
        padding: '48px 40px',
        overflowY: 'auto',
        background: 'linear-gradient(180deg, #f7f9ff 0%, #f5f7fb 100%)',
      }}
    >
      <PuiTypography
        variant="body-lg-medium"
        sx={{
          marginBottom: '36px !important',
          marginLeft: '24px',
          fontWeight: 500,
          fontSize: '20px',
          letterSpacing: '-0.01em',
        }}
      >
        Password & Security
      </PuiTypography>

      <PuiBox sx={{ maxWidth: '747px' }}>
        <PuiBox
          sx={{
            background: 'linear-gradient(180deg, #f7f9ff 0%, #f5f7fb 100%)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Change Password */}
          <PuiBox>
            <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '16px', display: 'block' }}>
              Change Password
            </PuiTypography>
            <PuiBox sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <PuiPasswordInput
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
              />
              <PuiPasswordInput
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
              />
              <PuiPasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
              />
              <PuiButton variant="contained" size="small" sx={{ alignSelf: 'flex-start', marginTop: '8px', padding: '8px 16px', fontSize: '13px' }}>
                Update Password
              </PuiButton>
            </PuiBox>
          </PuiBox>

          {/* Two-Factor Authentication */}
          <PuiBox
            sx={{
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
            }}
          >
            <PuiBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <PuiBox>
                <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px', display: 'block' }}>
                  Two-Factor Authentication
                </PuiTypography>
                <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280', display: 'block' }}>
                  Add an extra layer of security to your account
                </PuiTypography>
              </PuiBox>
              <PuiButton
                variant={twoFactorEnabled ? 'outlined' : 'contained'}
                size="small"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                sx={{ padding: '8px 16px', fontSize: '13px' }}
              >
                {twoFactorEnabled ? 'Disable' : 'Enable'}
              </PuiButton>
            </PuiBox>
          </PuiBox>

          {/* Active Sessions */}
          <PuiBox>
            <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '16px', display: 'block' }}>
              Active Sessions
            </PuiTypography>
            <PuiBox
              sx={{
                padding: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
              }}
            >
              <PuiBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <PuiBox>
                  <PuiTypography variant="body-sm-medium">Windows • Chrome</PuiTypography>
                  <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280' }}>
                    Riga, Latvia • Last active: 2 hours ago
                  </PuiTypography>
                </PuiBox>
                <PuiButton variant="outlined" size="small" sx={{ padding: '6px 12px', fontSize: '12px' }}>
                  Revoke
                </PuiButton>
              </PuiBox>
            </PuiBox>
          </PuiBox>
        </PuiBox>
      </PuiBox>
    </PuiBox>
  );
};

