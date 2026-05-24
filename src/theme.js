// Addis Ababa University Official Brand Colors
// Primary: Maroon #7B1113  Accent: Gold #C9A84C

export const AAU_COLORS = {
  primary: '#7B1113',
  primaryDark: '#5a0d0f',
  primaryLight: '#a31518',
  gold: '#C9A84C',
  goldLight: '#f0e0a8',
  goldDark: '#a8893a',
  white: '#ffffff',
  bgLight: '#fdf8f8',
  bgGray: '#f8f9fa',
};

import { createTheme } from '@mui/material/styles';

export const aauTheme = createTheme({
  palette: {
    primary: {
      main: '#7B1113',
      dark: '#5a0d0f',
      light: '#a31518',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#C9A84C',
      dark: '#a8893a',
      light: '#f0e0a8',
      contrastText: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#7B1113',
          '&:hover': { backgroundColor: '#5a0d0f' },
        },
      },
    },
  },
});
