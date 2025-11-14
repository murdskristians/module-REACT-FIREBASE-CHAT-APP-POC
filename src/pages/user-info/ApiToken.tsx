import { useState } from 'react';
import { PuiBox, PuiTypography, PuiButton, PuiInput } from 'piche.ui';

export const ApiToken = () => {
  const [apiToken, setApiToken] = useState('pk_live_51H3...');
  const [showToken, setShowToken] = useState(false);

  const handleGenerateToken = () => {
    const newToken = `pk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiToken(newToken);
    setShowToken(true);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
  };

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
        API Token
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
          {/* API Token Display */}
          <PuiBox>
            <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px', display: 'block' }}>
              Your API Token
            </PuiTypography>
            <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280', marginBottom: '12px', display: 'block' }}>
              Use this token to authenticate API requests. Keep it secure and never share it publicly.
            </PuiTypography>
            <PuiBox sx={{ display: 'flex', gap: '8px' }}>
              <PuiInput
                value={showToken ? apiToken : '••••••••••••••••'}
                readOnly
                fullWidth
                sx={{
                  fontFamily: 'monospace',
                  backgroundColor: '#F9FAFB',
                }}
              />
              <PuiButton variant="outlined" size="small" onClick={handleCopyToken} sx={{ padding: '2px 6px', fontSize: '10px', minWidth: 'auto', height: '24px' }}>
                Copy
              </PuiButton>
              <PuiButton variant="outlined" size="small" onClick={() => setShowToken(!showToken)} sx={{ padding: '2px 6px', fontSize: '10px', minWidth: 'auto', height: '24px' }}>
                {showToken ? 'Hide' : 'Show'}
              </PuiButton>
            </PuiBox>
          </PuiBox>

          {/* Generate New Token */}
          <PuiBox
            sx={{
              padding: '16px',
              backgroundColor: '#FEF3C7',
              borderRadius: '12px',
              border: '1px solid #FCD34D',
            }}
          >
            <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px', display: 'block' }}>
              Generate New Token
            </PuiTypography>
            <PuiTypography variant="body-xs-regular" sx={{ color: '#92400E', marginBottom: '12px', display: 'block' }}>
              Warning: Generating a new token will invalidate your current token. Make sure to update it in all your applications.
            </PuiTypography>
            <PuiButton variant="contained" color="warning" size="small" onClick={handleGenerateToken} sx={{ padding: '2px 6px', fontSize: '10px', minWidth: 'auto', height: '24px' }}>
              Generate New Token
            </PuiButton>
          </PuiBox>

          {/* API Documentation */}
          <PuiBox
            sx={{
              padding: '16px',
              backgroundColor: '#EFF6FF',
              borderRadius: '12px',
              border: '1px solid #BFDBFE',
            }}
          >
            <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px', display: 'block' }}>
              API Documentation
            </PuiTypography>
            <PuiTypography variant="body-xs-regular" sx={{ color: '#1E40AF', marginBottom: '12px', display: 'block' }}>
              Learn how to use the API with our comprehensive documentation and examples.
            </PuiTypography>
            <PuiButton variant="outlined" size="small" sx={{ borderColor: '#3B82F6', color: '#3B82F6', padding: '2px 6px', fontSize: '10px', minWidth: 'auto', height: '24px' }}>
              View Documentation
            </PuiButton>
          </PuiBox>
        </PuiBox>
      </PuiBox>
    </PuiBox>
  );
};

