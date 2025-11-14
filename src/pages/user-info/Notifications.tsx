import { useState } from 'react';
import { PuiBox, PuiTypography, PuiSwitch } from 'piche.ui';

export const Notifications = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [mentionNotifications, setMentionNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

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
        Notifications
      </PuiTypography>

      <PuiBox sx={{ maxWidth: '747px' }}>
        <PuiBox
          sx={{
            background: 'linear-gradient(180deg, #f7f9ff 0%, #f5f7fb 100%)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Email Notifications */}
          <PuiBox
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
            }}
          >
            <PuiBox>
              <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px', display: 'block' }}>
                Email Notifications
              </PuiTypography>
              <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280', display: 'block' }}>
                Receive notifications via email
              </PuiTypography>
            </PuiBox>
            <PuiSwitch 
              checked={emailNotifications} 
              onChange={(e) => setEmailNotifications(e.target.checked)}
              sx={{
                '& .MuiSwitch-track': {
                  backgroundColor: '#D1D5DB',
                  opacity: 1,
                },
                '&:hover .MuiSwitch-track': {
                  backgroundColor: '#9CA3AF',
                },
              }}
            />
          </PuiBox>

          {/* Push Notifications */}
          <PuiBox
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
            }}
          >
            <PuiBox>
              <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px', display: 'block' }}>
                Push Notifications
              </PuiTypography>
              <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280', display: 'block' }}>
                Receive browser push notifications
              </PuiTypography>
            </PuiBox>
            <PuiSwitch 
              checked={pushNotifications} 
              onChange={(e) => setPushNotifications(e.target.checked)}
              sx={{
                '& .MuiSwitch-track': {
                  backgroundColor: '#D1D5DB',
                  opacity: 1,
                },
                '&:hover .MuiSwitch-track': {
                  backgroundColor: '#9CA3AF',
                },
              }}
            />
          </PuiBox>

          {/* Message Notifications */}
          <PuiBox
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
            }}
          >
            <PuiBox>
              <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px', display: 'block' }}>
                New Message Alerts
              </PuiTypography>
              <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280', display: 'block' }}>
                Get notified when you receive new messages
              </PuiTypography>
            </PuiBox>
            <PuiSwitch 
              checked={messageNotifications} 
              onChange={(e) => setMessageNotifications(e.target.checked)}
              sx={{
                '& .MuiSwitch-track': {
                  backgroundColor: '#D1D5DB',
                  opacity: 1,
                },
                '&:hover .MuiSwitch-track': {
                  backgroundColor: '#9CA3AF',
                },
              }}
            />
          </PuiBox>

          {/* Mention Notifications */}
          <PuiBox
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
            }}
          >
            <PuiBox>
              <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px', display: 'block' }}>
                Mention Notifications
              </PuiTypography>
              <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280', display: 'block' }}>
                Get notified when someone mentions you
              </PuiTypography>
            </PuiBox>
            <PuiSwitch 
              checked={mentionNotifications} 
              onChange={(e) => setMentionNotifications(e.target.checked)}
              sx={{
                '& .MuiSwitch-track': {
                  backgroundColor: '#D1D5DB',
                  opacity: 1,
                },
                '&:hover .MuiSwitch-track': {
                  backgroundColor: '#9CA3AF',
                },
              }}
            />
          </PuiBox>

          {/* Sound */}
          <PuiBox
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
            }}
          >
            <PuiBox>
              <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px', display: 'block' }}>
                Sound Alerts
              </PuiTypography>
              <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280', display: 'block' }}>
                Play sound when receiving notifications
              </PuiTypography>
            </PuiBox>
            <PuiSwitch 
              checked={soundEnabled} 
              onChange={(e) => setSoundEnabled(e.target.checked)}
              sx={{
                '& .MuiSwitch-track': {
                  backgroundColor: '#D1D5DB',
                  opacity: 1,
                },
                '&:hover .MuiSwitch-track': {
                  backgroundColor: '#9CA3AF',
                },
              }}
            />
          </PuiBox>
        </PuiBox>
      </PuiBox>
    </PuiBox>
  );
};

