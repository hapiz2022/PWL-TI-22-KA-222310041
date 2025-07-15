import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import { useState } from 'react';

const ThemedApp = () => {
  const [mode, setMode] = useState('light');
  const theme = getTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App mode={mode} toggleMode={() => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))} />
    </ThemeProvider>
  );
};

ReactDOM.render(<ThemedApp />, document.getElementById('root'));
