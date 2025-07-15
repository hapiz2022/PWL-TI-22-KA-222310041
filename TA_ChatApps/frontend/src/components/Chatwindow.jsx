import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
    Box, Typography, IconButton, Avatar, TextField, Button
} from '@mui/material';
import { Call, MoreVert } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import Sentiment from 'sentiment';

import ChatItemSender from './ChatItemSender';
import ChatItemReceiver from './ChatItemReceiver';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const sentiment = new Sentiment();

const ChatWindow = ({ selectedChat, currentUserId }) => {
    const theme = useTheme();
    const mode = theme.palette.mode;
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedChat) return;
            try {
                const idOrUsername = selectedChat.chat.raw.username || selectedChat.chat.raw.id;
                const res = await axios.get('http://localhost:3001/messages', {
                    params: {
                        contact: idOrUsername,
                        userId: currentUserId,
                        isChannel: selectedChat.isChannel
                    }
                });
                setMessages(res.data || []);
            } catch (err) {
                console.error("Error loading messages:", err);
            }
        };
        fetchMessages();
    }, [selectedChat, currentUserId]);

    useEffect(() => {
        socketRef.current = new WebSocket('ws://localhost:3002');

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('WS payload:', data);

            const selectedId = selectedChat?.chat?.raw?.id?.toString();
            const selectedUsername = selectedChat?.chat?.raw?.username;

            const meId = currentUserId?.toString();
            const fromId = data.from;
            const toId = data.to;

            const incomingFromThem = fromId === selectedId || fromId === selectedUsername;
            const outgoingToThem = fromId === meId && (toId === selectedId || toId === selectedUsername);

            if (incomingFromThem || outgoingToThem) {
                setMessages(prev => [
                    ...prev,
                    {
                        sender_id: data.from,
                        message: data.message,
                        date: data.date,
                    }
                ]);
            }
        };

        return () => {
            socketRef.current?.close();
        };
    }, [selectedChat, currentUserId]);




    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!text.trim() || !selectedChat) return;
        try {
            const to = selectedChat.chat.raw.username || selectedChat.chat.raw.id;
            await axios.post('http://localhost:3001/send', { message: text, to });
            setMessages(prev => [...prev, {
                sender_id: currentUserId,
                message: text,
                date: new Date().toISOString(),
            }]);
            setText('');
        } catch (err) {
            console.error('Send failed:', err);
        }
    };

    const analyzedMessages = useMemo(() => {
        return messages.map(msg => {
            const result = sentiment.analyze(msg.message);
            const sentimentLabel = result.score > 0 ? 'Positif' : result.score < 0 ? 'Negatif' : 'Netral';
            return { ...msg, sentiment: sentimentLabel };
        });
    }, [messages]);

    if (!selectedChat) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: theme.palette.text.secondary
            }}>
                <Typography variant="h6" sx={{ opacity: 0.6 }}>← Select a chat to begin</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
        }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                px: 3,
                py: 2,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: mode === 'dark' ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)',
                flexShrink: 0
            }}>
                <Avatar sx={{ bgcolor: '#509fe7', mr: 2 }}>
                    {selectedChat.chat.creator.name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                        {selectedChat.chat.creator.name}
                    </Typography>
                </Box>
                <Box sx={{ marginLeft: 'auto' }}>
                    <IconButton><Call /></IconButton>
                    <IconButton><MoreVert /></IconButton>
                </Box>
            </Box>

            {/* Messages */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 2 },
                    minHeight: 0,
                    height: 0,
                }}
            >
                {(() => {
                    let lastDate = null;
                    return analyzedMessages
                        .slice()
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((msg, index) => {
                            const isSender = Number(msg.sender_id) === Number(currentUserId);
                            const messageDate = new Date(msg.date);
                            const dateLabel = dayjs(messageDate).isToday()
                                ? 'Today'
                                : dayjs(messageDate).isYesterday()
                                    ? 'Yesterday'
                                    : dayjs(messageDate).format('MMMM D, YYYY');
                            const showDate = lastDate !== dateLabel;
                            lastDate = dateLabel;

                            return (
                                <React.Fragment key={msg.id || index}>
                                    {showDate && (
                                        <Box sx={{ textAlign: 'center', my: 2 }}>
                                            <Typography variant="caption" sx={{
                                                backgroundColor: mode === 'dark' ? '#333' : '#ddd',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: 1,
                                                fontWeight: 500,
                                                display: 'inline-block'
                                            }}>{dateLabel}</Typography>
                                        </Box>
                                    )}
                                    {isSender ? (
                                        <ChatItemSender {...msg} avatarChar={'U'} />
                                    ) : (
                                        <ChatItemReceiver {...msg} avatarChar={selectedChat.chat.creator.name?.charAt(0) || 'U'} />
                                    )}
                                </React.Fragment>
                            );
                        });
                })()}
                <div ref={scrollRef} />
            </Box>

            {/* Input */}
            <Box sx={{
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: mode === 'dark' ? 'rgba(25,25,25,0.85)' : 'rgba(255,255,255,0.9)',
                gap: 2,
                flexShrink: 0
            }}>
                <TextField
                    fullWidth
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        backgroundColor: mode === 'dark' ? '#2a2a2a' : '#fff'
                    }}
                />
                <Button
                    variant="contained"
                    onClick={sendMessage}
                    sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
                >
                    Send
                </Button>
            </Box>
        </Box>
    );
};

export default ChatWindow;
