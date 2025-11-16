import { useState, useEffect } from 'react';
import { PuiBox, PuiTypography, PuiSwitch } from 'piche.ui';
import { useTheme } from '../../hooks/useTheme';

type ThemePalette = 'purple' | 'green' | 'orange' | 'pink' | 'default';

const PALETTE_STORAGE_KEY = 'app-theme-palette';

const themePalettes = {
  purple: {
    name: 'Royal Purple',
    primary: '#6D28D9',
    primaryLight: '#EDE9FE',
    primaryDark: '#5B21B6',
    gradient: 'linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)',
  },
  green: {
    name: 'Forest Green',
    primary: '#059669',
    primaryLight: '#D1FAE5',
    primaryDark: '#047857',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  },
  orange: {
    name: 'Sunset Orange',
    primary: '#EA580C',
    primaryLight: '#FFEDD5',
    primaryDark: '#C2410C',
    gradient: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
  },
  pink: {
    name: 'Rose Pink',
    primary: '#DB2777',
    primaryLight: '#FCE7F3',
    primaryDark: '#BE185D',
    gradient: 'linear-gradient(135deg, #DB2777 0%, #BE185D 100%)',
  },
};

export const AppearanceTheme = () => {
  const { themeMode, toggleTheme } = useTheme();

  const [selectedPalette, setSelectedPalette] = useState<ThemePalette>(() => {
    const saved = localStorage.getItem(PALETTE_STORAGE_KEY);
    return (saved as ThemePalette) || 'default';
  });

  useEffect(() => {
    localStorage.setItem(PALETTE_STORAGE_KEY, selectedPalette);
    document.documentElement.setAttribute('data-palette', selectedPalette);
  }, [selectedPalette]);

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
              onChange={toggleTheme}
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
                    background: 'linear-gradient(135deg, #3398DB 0%, #4AA3DF 100%)',
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

