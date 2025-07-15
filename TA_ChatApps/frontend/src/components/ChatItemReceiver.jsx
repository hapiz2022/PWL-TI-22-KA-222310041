import React from 'react';
import { Box, Avatar, Paper, Typography } from '@mui/material';

const ChatItemReceiver = ({ message, date, sentiment, avatarChar }) => {
  const bgColor =
    sentiment === 'Positif' ? '#d0f0d4'
      : sentiment === 'Negatif' ? '#f8d6d6'
      : '#e0e0e0';
      
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.2, px: 2, mb: 1 }}>
      <Avatar
        sx={{
          bgcolor: '#1976d2',
          width: 30,
          height: 30,
          fontSize: 14,
        }}
      >
        {avatarChar}
      </Avatar>

      <Paper
        elevation={3}
        sx={{
          maxWidth: '65%',
          backgroundColor: bgColor,
          px: 2,
          py: 1.5,
          borderRadius: 3,
          borderBottomLeftRadius: 0,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          color: '#111',
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
          {message}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1,
            mt: 0.5,
            fontSize: '0.75rem',
            opacity: 0.75,
          }}
        >
          <Typography variant="caption" sx={{ fontStyle: 'italic', textTransform: 'capitalize' }}>
            {sentiment}
          </Typography>
          <Typography variant="caption">
            {new Date(date).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatItemReceiver;
