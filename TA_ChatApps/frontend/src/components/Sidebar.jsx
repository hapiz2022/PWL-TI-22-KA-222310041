import React, { useEffect, useState, useRef } from 'react';
import {
  Avatar, Box, IconButton, InputAdornment, List, ListItem,
  Menu, MenuItem, Divider, TextField, Typography, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon, Search, Brightness4,
  Brightness7, Logout as LogoutIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const Sidebar = ({ onSelectChat, toggleTheme }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [contacts, setContacts] = useState([]);
  const wsRef = useRef(null);
  const theme = useTheme();
  const mode = theme.palette.mode;

  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://localhost:3001/contacts');
      if (Array.isArray(res.data)) setContacts(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch contacts:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
    wsRef.current = new WebSocket('ws://localhost:3002');

    wsRef.current.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.from && data.contactName) {
        const numericId = Number(data.from);

        setContacts(prev => {
          const exists = prev.some(c => Number(c.id) === numericId);
          if (exists) return prev;

          return [
            { id: numericId, name: data.contactName, isChannel: false },
            ...prev
          ];
        });
      }
    };

    wsRef.current.onclose = () => console.log('WebSocket disconnected');
    wsRef.current.onerror = err => console.error('WebSocket error:', err);

    return () => wsRef.current.close();
  }, []);


  const handleClick = contact => {
    onSelectChat({
      chat: { creator: { name: contact.name }, raw: contact },
      isChannel: !!contact.isChannel
    });
  };

  const handleExit = async () => {
    try { await axios.post("http://localhost:3001/auth/logout"); }
    catch (err) { console.error("Logout failed:", err); }
    finally {
      localStorage.removeItem('telegramSession');
      window.location.reload();
    }
  };

  return (
    <Box sx={{
      width: 300, height: '100%', backgroundColor: mode === 'dark' ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.95)',
      color: mode === 'dark' ? '#fff' : '#000', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', borderRight: `1px solid ${theme.palette.divider}`
    }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Menu">
          <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
            <MenuIcon sx={{ color: mode === 'dark' ? '#fff' : '#000' }} />
          </IconButton>
        </Tooltip>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
          <MenuItem onClick={toggleTheme}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            <Typography variant="body2">{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleExit}>
            <LogoutIcon />
            <Typography variant="body2" color="error" fontWeight="bold">Exit</Typography>
          </MenuItem>
        </Menu>

        <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>Chats</Typography>
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, mb: 2 }}>
        <TextField
          fullWidth variant="outlined" placeholder="Search" size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              backgroundColor: mode === 'dark' ? '#333' : '#f1f1f1',
              fontSize: '0.9rem'
            }
          }}
        />
      </Box>

      {/* Contact List */}
      <List sx={{ px: 1, flex: 1, overflowY: 'auto' }}>
        {contacts.map(contact => (
          <ListItem button key={contact.id} onClick={() => handleClick(contact)} sx={{
            mb: 1, borderRadius: 2, px: 2, py: 1.2,
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fefefe',
            '&:hover': { backgroundColor: mode === 'dark' ? '#2e2e2e' : '#eaeaea' },
            transition: 'background-color 0.2s'
          }}>
            <Avatar sx={{ bgcolor: '#509fe7', width: 36, height: 36, mr: 2 }}>
              {contact.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="subtitle1" noWrap>{contact.name}</Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
