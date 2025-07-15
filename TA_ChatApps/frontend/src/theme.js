import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#007aff' },
          background: {
            default: '#f4f7fa',
            paper: '#fff',
          },
          text: {
            primary: '#111',
            secondary: '#666',
          },
        }
      : {
          primary: { main: '#00bcd4' },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#fff',
            secondary: '#aaa',
          },
        }),
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export const getTheme = (mode = 'light') => createTheme(getDesignTokens(mode));
