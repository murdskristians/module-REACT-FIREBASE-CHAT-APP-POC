import { useState, useEffect } from 'react';
import { PuiBox, PuiTypography, PuiSwitch, PuiButton } from 'piche.ui';

type ThemeMode = 'light' | 'dark';
type ThemePalette = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'default';

const PALETTE_STORAGE_KEY = 'app-theme-palette';

const themePalettes = {
  blue: {
    name: 'Ocean Blue',
    primary: '#3398DB',
    primaryLight: '#E8F4FB',
    primaryDark: '#4AA3DF',
    gradient: 'linear-gradient(135deg, #3398DB 0%, #4AA3DF 100%)',
  },
  purple: {
    name: 'Royal Purple',
    primary: '#8B5CF6',
    primaryLight: '#F3E8FF',
    primaryDark: '#7C3AED',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
  },
  green: {
    name: 'Forest Green',
    primary: '#10B981',
    primaryLight: '#D1FAE5',
    primaryDark: '#059669',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  },
  orange: {
    name: 'Sunset Orange',
    primary: '#F59E0B',
    primaryLight: '#FEF3C7',
    primaryDark: '#D97706',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  },
  pink: {
    name: 'Rose Pink',
    primary: '#EC4899',
    primaryLight: '#FCE7F3',
    primaryDark: '#DB2777',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
  },
};

export const AppearanceTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const [selectedPalette, setSelectedPalette] = useState<ThemePalette>(() => {
    const saved = localStorage.getItem(PALETTE_STORAGE_KEY);
    return (saved as ThemePalette) || 'default';
  });

  useEffect(() => {
    localStorage.setItem(PALETTE_STORAGE_KEY, selectedPalette);
    document.documentElement.setAttribute('data-palette', selectedPalette);
  }, [selectedPalette]);

  const handleThemeToggle = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    // No functionality - just UI toggle
  };

  const handlePaletteChange = (palette: ThemePalette) => {
    setSelectedPalette(palette);
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
        Appearance & Theme
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
          {/* Theme Mode */}
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
                Dark Mode
              </PuiTypography>
              <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280', display: 'block' }}>
                Switch to dark theme for better viewing in low light
              </PuiTypography>
            </PuiBox>
            <PuiSwitch 
              checked={themeMode === 'dark'} 
              onChange={handleThemeToggle}
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

          {/* Theme Palette */}
          <PuiBox>
            <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '8px', display: 'block' }}>
              Color Palette
            </PuiTypography>
            <PuiTypography variant="body-xs-regular" sx={{ color: '#6B7280', marginBottom: '16px', display: 'block' }}>
              Choose your preferred color scheme
            </PuiTypography>
            <PuiBox
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px',
              }}
            >
              {/* Default option */}
              <PuiBox
                onClick={() => handlePaletteChange('default')}
                sx={{
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: `2px solid ${selectedPalette === 'default' ? '#3398DB' : '#E5E7EB'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#3398DB',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(51, 152, 219, 0.2)',
                  },
                }}
              >
                <PuiBox
                  sx={{
                    width: '100%',
                    height: '60px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fb 100%)',
                    border: '1px solid #E5E7EB',
                    marginBottom: '8px',
                  }}
                />
                <PuiTypography variant="body-xs-semibold" sx={{ textAlign: 'center' }}>
                  Default
                </PuiTypography>
                {selectedPalette === 'default' && (
                  <PuiBox
                    sx={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#3398DB',
                      margin: '8px auto 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&::after': {
                        content: '"✓"',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      },
                    }}
                  />
                )}
              </PuiBox>
              {(Object.keys(themePalettes) as ThemePalette[]).map((paletteKey) => {
                const palette = themePalettes[paletteKey];
                const isSelected = selectedPalette === paletteKey;

                return (
                  <PuiBox
                    key={paletteKey}
                    onClick={() => handlePaletteChange(paletteKey)}
                    sx={{
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: `2px solid ${isSelected ? palette.primary : '#E5E7EB'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: palette.primary,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${palette.primaryLight}`,
                      },
                    }}
                  >
                    <PuiBox
                      sx={{
                        width: '100%',
                        height: '60px',
                        borderRadius: '8px',
                        background: palette.gradient,
                        marginBottom: '8px',
                      }}
                    />
                    <PuiTypography variant="body-xs-semibold" sx={{ textAlign: 'center' }}>
                      {palette.name}
                    </PuiTypography>
                    {isSelected && (
                      <PuiBox
                        sx={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: palette.primary,
                          margin: '8px auto 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&::after': {
                            content: '"✓"',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          },
                        }}
                      />
                    )}
                  </PuiBox>
                );
              })}
            </PuiBox>
          </PuiBox>

          {/* Preview */}
          <PuiBox
            sx={{
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
            }}
          >
            <PuiTypography variant="body-sm-semibold" sx={{ marginBottom: '12px', display: 'block' }}>
              Preview
            </PuiTypography>
            <PuiBox
              sx={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: selectedPalette === 'default' ? '#F9FAFB' : themePalettes[selectedPalette].primaryLight,
                border: `2px solid ${selectedPalette === 'default' ? '#E5E7EB' : themePalettes[selectedPalette].primary}`,
              }}
            >
              <PuiTypography
                variant="body-sm-medium"
                sx={{ color: selectedPalette === 'default' ? '#6B7280' : themePalettes[selectedPalette].primary }}
              >
                This is how your theme will look
              </PuiTypography>
            </PuiBox>
          </PuiBox>
        </PuiBox>
      </PuiBox>
    </PuiBox>
  );
};

