import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/Chatwindow';
import Login from './components/Login';

const App = ({ mode, toggleMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const handleLogin = (id) => {
    setUserId(id);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) return <Login onLoggedIn={handleLogin} />;

  return (
    <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f0f4ff' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          px: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            maxWidth: 1600,
            height: '90vh',
            borderRadius: 2,
            overflow: 'hidden',
            backdropFilter: 'blur(24px)',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(160deg, rgba(28,28,30,0.7), rgba(50,50,60,0.6))'
              : 'linear-gradient(160deg, rgba(255,255,255,0.92), rgba(240,240,250,0.85))',
            boxShadow: `
              0 25px 60px rgba(0,0,0,0.15),
              0 0 0 1px rgba(255,255,255,0.04),
              inset 0 0 2px rgba(255,255,255,0.08)
            `,
          }}
        >
          {/* Sidebar */}
          <Box
            sx={{
              width: { xs: '100%', md: 320 },
              display: { xs: selectedChat ? 'none' : 'flex', md: 'flex' },
              flexDirection: 'column',
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(35,35,40,0.9)'
                : 'rgba(255,255,255,0.94)',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              overflowY: 'auto',
            }}
          >
            <Sidebar onSelectChat={setSelectedChat} toggleTheme={toggleMode} />
          </Box>

          {/* Chat Window or Placeholder */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(15,15,20,0.92)'
                : 'rgba(255,255,255,0.96)',
              position: 'relative',
              minHeight: 0,
            }}
          >
            {isMobile && selectedChat && (
              <IconButton
                onClick={() => setSelectedChat(null)}
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  zIndex: 10,
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <ArrowBack />
              </IconButton>
            )}

            {selectedChat ? (
              <ChatWindow selectedChat={selectedChat} currentUserId={userId} />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: theme.palette.text.secondary,
                  px: 3,
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/10431/10431925.png"
                  alt="Chat Placeholder"
                  width={90}
                  style={{ marginBottom: 24, opacity: 0.3 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600, opacity: 0.85 }}>
                  Start a Conversation
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.6 }}>
                  Select a contact from the left to begin messaging.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default App;
