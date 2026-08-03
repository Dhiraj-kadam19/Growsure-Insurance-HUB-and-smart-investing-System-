import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, IconButton, TextField, Typography, Avatar, Collapse, Chip } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

import api from '../services/api';

const QUICK_PROMPTS = [
  '📈 Best Mutual Funds',
  '💡 SIP vs Lumpsum',
  '🛡️ Insurance Cover',
  '💰 Tax Saving 80C & 80D',
  '📋 How to File a Claim',
];

const ChatbotWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      sender: 'bot', 
      text: '👋 Hi! I am your Growsure Financial Copilot. Ask me anything about our 814 Mutual Funds, Term Life/Health covers, Tax Savings (80C/80D), or Claim Submissions!' 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isOpen]);

  const sendQuery = async (queryText) => {
    if (!queryText.trim() || loading) return;

    setChatHistory(prev => [...prev, { sender: 'user', text: queryText }]);
    setLoading(true);

    try {
      const response = await api.post('/api/ai/chat', { message: queryText });
      setChatHistory(prev => [...prev, { sender: 'bot', text: response.data.answer }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        sender: 'bot', 
        text: 'I am currently unable to reach the primary AI server endpoint. Please verify your connection or try again shortly.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const userMsg = message;
    setMessage('');
    sendQuery(userMsg);
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      
      {/* Floating collapsible chat card */}
      <Collapse in={isOpen}>
        <Paper 
          className="glass-card"
          sx={{ 
            width: { xs: 320, sm: 400 }, 
            height: 520, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, bgcolor: 'primary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
              <SmartToyIcon />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Growsure AI Financial Copilot</Typography>
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages List */}
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#0b0f19' }}>
            {chatHistory.map((msg, index) => (
              <Box 
                key={index}
                sx={{
                  display: 'flex',
                  justify: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >
                {msg.sender === 'bot' && (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                    <SmartToyIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
                <Box 
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    maxWidth: '85%',
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                    color: 'text.primary',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.5, fontSize: '0.88rem' }}>
                    {msg.text}
                  </Typography>
                </Box>
                {msg.sender === 'user' && (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main' }}>
                    <PersonIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                  <SmartToyIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>AI is analyzing financial data...</Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Suggestion Chips */}
          <Box sx={{ px: 1.5, py: 1, display: 'flex', gap: 0.75, overflowX: 'auto', bgcolor: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {QUICK_PROMPTS.map((promptText) => (
              <Chip
                key={promptText}
                label={promptText}
                size="small"
                onClick={() => sendQuery(promptText)}
                disabled={loading}
                sx={{
                  fontSize: '0.72rem',
                  bgcolor: 'rgba(99, 102, 241, 0.12)',
                  color: 'primary.light',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.25)' }
                }}
              />
            ))}
          </Box>

          {/* Form Input */}
          <Box component="form" onSubmit={handleSendMessage} sx={{ p: 1.5, display: 'flex', gap: 1, bgcolor: '#111827', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <TextField
              size="small"
              placeholder="Ask about funds, policies, or claims..."
              variant="outlined"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#0b0f19',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' }
                }
              }}
            />
            <IconButton type="submit" color="primary" disabled={loading || !message.trim()} sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
              <SendIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Paper>
      </Collapse>

      {/* Floating Action Button */}
      <IconButton 
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          width: 56,
          height: 56,
          bgcolor: 'primary.main',
          color: 'white',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.5)',
          '&:hover': {
            bgcolor: 'primary.dark',
            transform: 'scale(1.05)'
          },
          transition: 'all 0.2s'
        }}
      >
        <ForumIcon />
      </IconButton>
    </Box>
  );
};

export default ChatbotWindow;
