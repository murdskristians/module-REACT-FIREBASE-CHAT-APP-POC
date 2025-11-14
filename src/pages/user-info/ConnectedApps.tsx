import { PuiBox, PuiTypography, PuiButton } from 'piche.ui';

const connectedApps = [
  {
    name: 'Google',
    icon: '🔵',
    description: 'Connected for authentication',
    connectedAt: 'Connected 2 months ago',
  },
  {
    name: 'Slack',
    icon: '💬',
    description: 'Not connected',
    connectedAt: null,
  },
  {
    name: 'Microsoft Teams',
    icon: '👥',
    description: 'Not connected',
    connectedAt: null,
  },
];

export const ConnectedApps = () => {
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
        Connected Apps
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
          {connectedApps.map((app) => (
            <PuiBox
              key={app.name}
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
              <PuiBox sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PuiBox sx={{ fontSize: '32px' }}>{app.icon}</PuiBox>
                <PuiBox>
                  <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '4px', display: 'block' }}>
                    {app.name}
                  </PuiTypography>
                  <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280', display: 'block' }}>
                    {app.connectedAt || app.description}
                  </PuiTypography>
                </PuiBox>
              </PuiBox>
              <PuiButton variant={app.connectedAt ? 'outlined' : 'contained'} size="small" sx={{ padding: '2px 6px', fontSize: '10px', minWidth: 'auto', height: '24px' }}>
                {app.connectedAt ? 'Disconnect' : 'Connect'}
              </PuiButton>
            </PuiBox>
          ))}
        </PuiBox>
      </PuiBox>
    </PuiBox>
  );
};

