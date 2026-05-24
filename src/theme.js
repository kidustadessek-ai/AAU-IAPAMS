// Addis Ababa University Official Brand Colors
export const AAU_COLORS = {
  primary: '#7B1113',
  primaryDark: '#5a0d0f',
  primaryLight: '#a31518',
  gold: '#C9A84C',
  goldLight: '#f5edd8',
  goldDark: '#a8893a',
  dark: '#1a0a0b',
  white: '#ffffff',
  bgLight: '#f5f4f2',
  bgCard: '#ffffff',
  border: '#e8e4e4',
  textPrimary: '#1a1a2e',
  textSecondary: '#64748b',
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
      light: '#f5edd8',
      contrastText: '#1a1a2e',
    },
    background: {
      default: '#f5f4f2',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#64748b',
    },
    divider: '#e8e4e4',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 700, letterSpacing: -0.5 },
    h2: { fontWeight: 700, letterSpacing: -0.3 },
    h3: { fontWeight: 700, letterSpacing: -0.2 },
    h4: { fontWeight: 700, letterSpacing: -0.1 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0.2 },
    overline: { fontWeight: 700, letterSpacing: 1.5 },
  },
  shape: { borderRadius: 8 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)',
    '0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)',
    '0 20px 25px rgba(0,0,0,0.07), 0 10px 10px rgba(0,0,0,0.04)',
    '0 25px 50px rgba(0,0,0,0.1)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: 0.2,
          padding: '8px 20px',
        },
        containedPrimary: {
          backgroundColor: '#7B1113',
          boxShadow: '0 2px 8px rgba(123,17,19,0.25)',
          '&:hover': {
            backgroundColor: '#5a0d0f',
            boxShadow: '0 4px 12px rgba(123,17,19,0.35)',
          },
        },
        outlinedPrimary: {
          borderColor: '#7B1113',
          color: '#7B1113',
          '&:hover': { backgroundColor: '#fdf8f8', borderColor: '#5a0d0f' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7B1113' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7B1113', borderWidth: 1.5 },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#7B1113' },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7B1113', borderWidth: 1.5 },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #f0eded',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
        elevation1: { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
        elevation2: { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
        elevation3: { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500, fontSize: '0.75rem' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#faf9f9',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            color: '#64748b',
            borderBottom: '2px solid #f0eded',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#fdf9f9' },
          '& .MuiTableCell-root': { borderColor: '#f5f2f2' },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          '&.Mui-selected': { color: '#7B1113', fontWeight: 600 },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#7B1113', height: 2 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#f0eded' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none' },
      },
    },
  },
});
