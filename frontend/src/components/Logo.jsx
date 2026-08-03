import React from 'react';
import { Box, Typography } from '@mui/material';

const Logo = ({ size = 'medium', variant = 'default' }) => {
  const iconSizes = {
    small: { icon: 28, text: '1.25rem' },
    medium: { icon: 34, text: '1.5rem' },
    large: { icon: 44, text: '2.1rem' },
  };

  const currentSize = iconSizes[size];

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.2, userSelect: 'none', cursor: 'pointer' }}>
      <svg 
        width={currentSize.icon} 
        height={currentSize.icon} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0px 4px 10px rgba(99, 102, 241, 0.45))' }}
      >
        <defs>
          <linearGradient id="growsure-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="growsure-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        {/* Shield Outer Body */}
        <path 
          d="M24 4L8 10V22C8 33.1 14.8 42.9 24 46C33.2 42.9 40 33.1 40 22V10L24 4Z" 
          fill="url(#growsure-grad-1)" 
        />
        {/* Upward Growth Arrow */}
        <path 
          d="M16 28L22 22L27 27L34 18" 
          stroke="#FFFFFF" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M28 18H34V24" 
          stroke="#FFFFFF" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <circle cx="16" cy="28" r="2" fill="url(#growsure-grad-2)" />
      </svg>

      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 900, 
          fontSize: currentSize.text, 
          letterSpacing: '-0.03em', 
          fontFamily: "'Outfit', 'Inter', sans-serif",
          display: 'flex',
          alignItems: 'center',
          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))'
        }}
      >
        <span style={{ 
          background: variant === 'light' 
            ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            : 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          fontWeight: 900
        }}>
          Grow
        </span>
        <span style={{ 
          background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          fontWeight: 900
        }}>
          sure
        </span>
      </Typography>
    </Box>
  );
};

export default Logo;
