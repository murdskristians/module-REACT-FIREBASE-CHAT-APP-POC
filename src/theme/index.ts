import { PuiCreateTheme } from 'piche.ui';

// Create custom theme with Poppins and Inter fonts
export const theme = PuiCreateTheme({
  typography: {
    fontFamily: "'Poppins', 'Inter', sans-serif",
  },
  palette: {
    primary: {
      main: '#3398DB',
      light: '#E8F4FB',
      dark: '#4AA3DF',
    },
    success: {
      main: '#67D286',
    },
    warning: {
      main: '#FBB13C',
    },
    error: {
      main: '#E16D6D',
    },
  },
});
