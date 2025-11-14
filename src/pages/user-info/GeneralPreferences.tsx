import { useState } from 'react';
import { PuiBox, PuiTypography, PuiSwitch, PuiSelectV2, PuiInput } from 'piche.ui';
import { MenuItem } from '@mui/material';

export const GeneralPreferences = () => {
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC+2');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [autoSave, setAutoSave] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

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
        General Preferences
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
          {/* Language */}
          <PuiBox>
            <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px' }}>
              Language
            </PuiTypography>
            <PuiSelectV2
              value={language}
              onChange={(e) => setLanguage(e.target.value as string)}
              fullWidth
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="lv">Latviešu</MenuItem>
              <MenuItem value="ru">Русский</MenuItem>
            </PuiSelectV2>
          </PuiBox>

          {/* Timezone */}
          <PuiBox>
            <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px' }}>
              Timezone
            </PuiTypography>
            <PuiSelectV2
              value={timezone}
              onChange={(e) => setTimezone(e.target.value as string)}
              fullWidth
            >
              <MenuItem value="UTC+2">UTC+2 (Riga)</MenuItem>
              <MenuItem value="UTC+1">UTC+1</MenuItem>
              <MenuItem value="UTC+0">UTC+0</MenuItem>
              <MenuItem value="UTC-5">UTC-5 (New York)</MenuItem>
            </PuiSelectV2>
          </PuiBox>

          {/* Date Format */}
          <PuiBox>
            <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px' }}>
              Date Format
            </PuiTypography>
            <PuiSelectV2
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value as string)}
              fullWidth
            >
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
            </PuiSelectV2>
          </PuiBox>

          {/* Auto-save */}
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
                Auto-save Drafts
              </PuiTypography>
              <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280', display: 'block' }}>
                Automatically save message drafts as you type
              </PuiTypography>
            </PuiBox>
            <PuiSwitch 
              checked={autoSave} 
              onChange={(e) => setAutoSave(e.target.checked)}
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

          {/* Show Online Status */}
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
                Show Online Status
              </PuiTypography>
              <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280', display: 'block' }}>
                Let others see when you're online
              </PuiTypography>
            </PuiBox>
            <PuiSwitch 
              checked={showOnlineStatus} 
              onChange={(e) => setShowOnlineStatus(e.target.checked)}
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

