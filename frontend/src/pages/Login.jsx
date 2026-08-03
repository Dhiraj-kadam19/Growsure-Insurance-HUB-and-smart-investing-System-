import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Box, Card, CardContent, TextField, Button, Typography, Grid, 
  Alert, Divider, Container, Chip, Avatar,
  Dialog, DialogContent, DialogTitle, IconButton, InputAdornment
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightIcon from '@mui/icons-material/Flight';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockResetIcon from '@mui/icons-material/LockReset';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import KeyIcon from '@mui/icons-material/Key';


import api from '../services/api';
import { loginSuccess } from '../store';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  // Forgot / Reset Password state
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);
  const [generatedOtpMsg, setGeneratedOtpMsg] = useState(null);

  const handleOpenForgotPasswordModal = () => {
    setForgotStep(1);
    setForgotEmail(email);
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError(null);
    setForgotSuccess(null);
    setGeneratedOtpMsg(null);
    setOpenLogin(false);
    setOpenForgotPassword(true);
  };

  const handleSendForgotPasswordOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);
    try {
      const response = await api.post('/api/auth/forgot-password', { email: forgotEmail });
      setGeneratedOtpMsg(response.data?.otp ? `Verification Code: ${response.data.otp}` : null);
      setForgotSuccess(response.data?.message || 'Verification code sent to your email.');
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data || 'Failed to send verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtpCode = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);
    try {
      const response = await api.post('/api/auth/verify-otp', { email: forgotEmail, otp: forgotOtp });
      setForgotSuccess(response.data?.message || 'Email verified successfully! Enter your new password.');
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data || 'Invalid or expired verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setForgotError('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);
    try {
      const response = await api.post('/api/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: newPassword
      });
      alert(response.data?.message || 'Password reset successfully! Please sign in with your new password.');
      setOpenForgotPassword(false);
      setOpenLogin(true);
    } catch (err) {
      setForgotError(err.response?.data || 'Failed to reset password. Please ensure email verification is complete.');
    } finally {
      setForgotLoading(false);
    }
  };

  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);
  const [openContact, setOpenContact] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateEmail = (val) => {
    if (!val.trim()) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Please enter a valid email address (e.g. user@example.com).';
    return null;
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required.';
    if (val.length < 6) return 'Password must be at least 6 characters long.';
    return null;
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (emailError) setEmailError(validateEmail(val));
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (passwordError) setPasswordError(validatePassword(val));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      dispatch(loginSuccess(response.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123'); // seed password
    setEmailError(null);
    setPasswordError(null);
  };

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Banner Section */}
      <Box sx={{
        position: 'relative',
        background: 'url(/hero-banner.png) no-repeat center center / cover',
        minHeight: '82vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        pt: 3,
        px: { xs: 2, md: 8 }
      }}>
        {/* Capsule Navbar */}
        <Container maxWidth="lg" sx={{ mb: 6 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)',
            borderRadius: '50px',
            padding: '8px 24px',
            boxShadow: '0 8px 30px rgba(2, 132, 199, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Logo size="medium" variant="light" />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 } }}>
              <Button sx={{ 
                bgcolor: '#ffffff', 
                color: '#0369a1', 
                borderRadius: '20px', 
                px: 3, 
                py: 0.5,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}>
                Home
              </Button>
              <Button onClick={() => setOpenAbout(true)} sx={{ color: '#ffffff', textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                About
              </Button>
              <Button onClick={() => setOpenLogin(true)} sx={{ color: '#ffffff', textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Login
              </Button>
              <Button onClick={() => setOpenContact(true)} sx={{ color: '#ffffff', textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Contact
              </Button>
              <IconButton 
                onClick={() => setOpenLogin(true)}
                sx={{ 
                  color: '#ffffff', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  p: 0.5 
                }}
              >
                <AccountCircleIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>

        {/* Hero Content */}
        <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', alignItems: 'center', pb: 8 }}>
          <Grid container>
            <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'left' }}>
              <Typography 
                variant="h1" 
                sx={{ 
                  color: '#ffffff', 
                  fontWeight: 800, 
                  fontSize: { xs: '2.5rem', md: '3.8rem' },
                  fontFamily: 'Outfit, sans-serif',
                  lineHeight: 1.15,
                  textShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  letterSpacing: '-0.5px'
                }}
              >
                PROTECT YOUR FAMILY<br />WITH INSURANCE
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '1.1rem',
                  maxWidth: '550px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  lineHeight: 1.6
                }}
              >
                Secure your family's future with Growsure's AI-enabled life cover, health plan recommendations, and wealth building portfolios. Access instant claims auditing and check-out.
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => setOpenLogin(true)}
                  sx={{
                    bgcolor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    borderRadius: '30px',
                    px: 5,
                    py: 1.5,
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(2, 132, 199, 0.4)',
                    '&:hover': {
                      bgcolor: '#0369a1',
                      boxShadow: '0 12px 30px rgba(2, 132, 199, 0.5)'
                    }
                  }}
                >
                  View More
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Feature Cards Section */}
      <Box sx={{ py: 10, bgcolor: '#ffffff', textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 6, 
              color: '#0f172a',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            You Are In Good Hands
          </Typography>

          <Grid container spacing={4}>
            {/* Home Insurance Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(2, 132, 199, 0.1)'
                }
              }}>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ 
                    bgcolor: '#0284c7', 
                    color: '#ffffff', 
                    borderRadius: '50%', 
                    width: '60px', 
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
                  }}>
                    <HomeIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit' }}>
                    Home Insurance
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Protect your home against damages, fire, theft, and natural disasters with tailor-made sum insured sizes.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Motor Insurance Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(2, 132, 199, 0.1)'
                }
              }}>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ 
                    bgcolor: '#0284c7', 
                    color: '#ffffff', 
                    borderRadius: '50%', 
                    width: '60px', 
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
                  }}>
                    <DirectionsCarIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit' }}>
                    Motor Insurance
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Drive stress-free with zero-depreciation options, roadside support, and instant claim verification.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Travel / Life Insurance Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(2, 132, 199, 0.1)'
                }
              }}>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ 
                    bgcolor: '#0284c7', 
                    color: '#ffffff', 
                    borderRadius: '50%', 
                    width: '60px', 
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
                  }}>
                    <FlightIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit' }}>
                    Travel & Life Cover
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Ensure absolute safety during flights, international vacations, and lifetime family financial protection.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Leadership Advisory Contact Section */}
      <Box sx={{ py: 8, bgcolor: '#0f172a', color: '#ffffff', textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', mb: 1 }}>
            Leadership & Project Advisory
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mb: 5, maxWidth: '600px', mx: 'auto' }}>
            Meet our project leadership guiding the Growsure digital insurance and wealth management ecosystem.
          </Typography>

          <Grid container spacing={3} justifyContent="center" alignItems="stretch">
            {/* Advisor Card */}
            <Grid item xs={12} sm={6} md={5} sx={{ display: 'flex' }}>
              <Box 
                sx={{ 
                  p: 3.5, 
                  borderRadius: '20px', 
                  bgcolor: 'rgba(2, 132, 199, 0.08)', 
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 2,
                  width: '100%',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#0284c7', width: 52, height: 52, fontWeight: 900, fontSize: '1.2rem' }}>DK</Avatar>
                  <Box>
                    <Chip label="Advisor" color="primary" size="small" sx={{ fontWeight: 800, mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff' }}>
                      Mr. D.K. Patil
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                      Project Advisory Leader
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PhoneIcon sx={{ color: '#38bdf8' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                    +91 9168440744
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  component="a"
                  href="tel:9168440744"
                  startIcon={<PhoneIcon />}
                  fullWidth
                  sx={{ 
                    mt: 1, 
                    borderRadius: '12px', 
                    fontWeight: 800, 
                    py: 1.2,
                    textTransform: 'none',
                    bgcolor: '#0284c7',
                    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                    '&:hover': { bgcolor: '#0369a1' }
                  }}
                >
                  Contact Advisor (Mr. DK Patil)
                </Button>
              </Box>
            </Grid>

            {/* Vice Advisor Card */}
            <Grid item xs={12} sm={6} md={5} sx={{ display: 'flex' }}>
              <Box 
                sx={{ 
                  p: 3.5, 
                  borderRadius: '20px', 
                  bgcolor: 'rgba(168, 85, 247, 0.08)', 
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 2,
                  width: '100%',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#a855f7', width: 52, height: 52, fontWeight: 900, fontSize: '1.2rem' }}>PK</Avatar>
                  <Box>
                    <Chip label="Vice Advisor" color="secondary" size="small" sx={{ fontWeight: 800, mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff' }}>
                      Miss Priyanka Kapdekar
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                      Vice Advisor & Strategy Head
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PhoneIcon sx={{ color: '#c084fc' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#c084fc' }}>
                    +91 7888148065
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="secondary"
                  component="a"
                  href="tel:7888148065"
                  startIcon={<PhoneIcon />}
                  fullWidth
                  sx={{ 
                    mt: 1, 
                    borderRadius: '12px', 
                    fontWeight: 800, 
                    py: 1.2,
                    textTransform: 'none',
                    bgcolor: '#a855f7',
                    boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                    '&:hover': { bgcolor: '#9333ea' }
                  }}
                >
                  Contact Vice Advisor (Miss Priyanka)
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Login Dialog Modal Overlay */}
      <Dialog 
        open={openLogin} 
        onClose={() => setOpenLogin(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            color: '#f3f4f6',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon sx={{ color: '#10b981' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>
              Sign In to Growsure
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenLogin(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                label="Email Address" 
                variant="outlined" 
                fullWidth 
                required
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => setEmailError(validateEmail(email))}
                error={Boolean(emailError)}
                helperText={emailError}
                sx={{
                  '& .MuiInputBase-input': { color: '#ffffff', fontSize: '1rem', fontWeight: 500 },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.06)',
                    borderRadius: '12px !important',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#38bdf8', borderWidth: '2px' }
                  },
                  '& .MuiFormHelperText-root': { color: '#f87171', fontWeight: 600, fontSize: '0.82rem', mt: 0.8 }
                }}
              />
              <TextField 
                label="Password" 
                type={showPassword ? 'text' : 'password'}
                variant="outlined" 
                fullWidth 
                required
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => setPasswordError(validatePassword(password))}
                error={Boolean(passwordError)}
                helperText={passwordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#94a3b8' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiInputBase-input': { color: '#ffffff', fontSize: '1rem', fontWeight: 500 },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.06)',
                    borderRadius: '12px !important',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#38bdf8', borderWidth: '2px' }
                  },
                  '& .MuiFormHelperText-root': { color: '#f87171', fontWeight: 600, fontSize: '0.82rem', mt: 0.8 }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1.5 }}>
                <Button 
                  onClick={handleOpenForgotPasswordModal}
                  sx={{ 
                    color: '#38bdf8', 
                    textTransform: 'none', 
                    fontWeight: 700, 
                    fontSize: '0.85rem',
                    p: 0,
                    '&:hover': { background: 'transparent', textDecoration: 'underline' }
                  }}
                >
                  Forgot Password?
                </Button>
              </Box>

              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  fontSize: '1rem', 
                  fontWeight: 800,
                  borderRadius: '12px !important',
                  background: 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px 0 rgba(2, 132, 199, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #0369a1 0%, #075985 100%)'
                  }
                }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700 }}>
                Register here
              </Link>
            </Typography>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.12)' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '1px' }}>
              QUICK DEMO LOGINS
            </Typography>
          </Divider>

          <Grid container spacing={1.5}>
            <Grid item xs={4}>
              <Button 
                variant="outlined" 
                size="small" 
                fullWidth
                onClick={() => handleQuickLogin('amit@growsure.com')}
                sx={{ 
                  fontSize: '0.82rem', 
                  py: 1, 
                  color: '#f8fafc', 
                  fontWeight: 700,
                  borderColor: 'rgba(255,255,255,0.2)',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  borderRadius: '10px !important',
                  '&:hover': { borderColor: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }
                }}
              >
                Holder
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button 
                variant="outlined" 
                size="small" 
                fullWidth
                onClick={() => handleQuickLogin('partner@hdfcergo.com')}
                sx={{ 
                  fontSize: '0.82rem', 
                  py: 1, 
                  color: '#f8fafc', 
                  fontWeight: 700,
                  borderColor: 'rgba(255,255,255,0.2)',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  borderRadius: '10px !important',
                  '&:hover': { borderColor: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }
                }}
              >
                Insurer
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button 
                variant="outlined" 
                size="small" 
                fullWidth
                onClick={() => handleQuickLogin('admin@growsure.com')}
                sx={{ 
                  fontSize: '0.82rem', 
                  py: 1, 
                  color: '#f8fafc', 
                  fontWeight: 700,
                  borderColor: 'rgba(255,255,255,0.2)',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  borderRadius: '10px !important',
                  '&:hover': { borderColor: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }
                }}
              >
                Admin
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* About Us Dialog Modal */}
      <Dialog
        open={openAbout}
        onClose={() => setOpenAbout(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            color: '#f8fafc',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.12)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon sx={{ color: '#38bdf8', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
              About Growsure Platform & Application
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenAbout(false)} sx={{ color: '#94a3b8' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.7, mb: 3 }}>
            <strong>Growsure</strong> is an advanced, AI-powered next-generation Insurance and Mutual Fund Investment Platform. Built to bridge the gap between financial security and wealth accumulation, Growsure offers unified digital policy management, automated claim processing, and real-time mutual fund portfolio analytics.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)' }}>
                <Typography variant="subtitle2" sx={{ color: '#38bdf8', fontWeight: 800, mb: 0.5 }}>
                  🛡️ Multi-Sector Protection
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.5, display: 'block' }}>
                  Coverage across Health, Life, Motor, Travel, Cyber, Property, and Agriculture policies with instant digital issuing.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                <Typography variant="subtitle2" sx={{ color: '#c084fc', fontWeight: 800, mb: 0.5 }}>
                  📈 SIP & Mutual Funds
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.5, display: 'block' }}>
                  Direct SIP investments, side-by-side fund performance comparison, and 3-year CAGR return calculators.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <Typography variant="subtitle2" sx={{ color: '#34d399', fontWeight: 800, mb: 0.5 }}>
                  🤖 AI Financial Advisory
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.5, display: 'block' }}>
                  Personalized plan recommendations, automated medical claim auditing, and instant UPI QR payments.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#818cf8', mb: 1 }}>
              🏗️ Enterprise Architecture & Tech Stack
            </Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7 }}>
              • <strong>Backend:</strong> High-performance RESTful APIs powered by <strong>.NET 8 Core</strong> and <strong>Spring Boot</strong>.<br />
              • <strong>Frontend:</strong> React 18 with JavaScript, Redux Toolkit, and Material UI v5.<br />
              • <strong>Security:</strong> Enterprise JWT authentication, encrypted database storage, and secure NPCI UPI integration.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Contact Us & Leadership Advisory Dialog */}
      <Dialog
        open={openContact}
        onClose={() => setOpenContact(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            color: '#f8fafc',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.12)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContactSupportIcon sx={{ color: '#0284c7', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
              Contact Advisory Leadership
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenContact(false)} sx={{ color: '#94a3b8' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            For expert guidance on insurance policy selection, wealth management, SIP portfolios, or enterprise claims assistance, reach out directly to our project leadership:
          </Typography>

          <Grid container spacing={2} alignItems="stretch">
            {/* Advisor Card */}
            <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
              <Box 
                sx={{ 
                  p: 2.5, 
                  borderRadius: '16px', 
                  bgcolor: 'rgba(2, 132, 199, 0.08)', 
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  width: '100%'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#0284c7', width: 44, height: 44, fontWeight: 800 }}>DK</Avatar>
                  <Box>
                    <Chip label="Advisor" size="small" color="primary" sx={{ fontWeight: 800, height: 20, fontSize: '0.68rem', mb: 0.3 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                      Mr. D.K. Patil
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                    +91 9168440744
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  component="a"
                  href="tel:9168440744"
                  startIcon={<PhoneIcon />}
                  fullWidth
                  sx={{ 
                    mt: 0.5, 
                    borderRadius: '10px', 
                    fontWeight: 800, 
                    fontSize: '0.82rem',
                    textTransform: 'none',
                    bgcolor: '#0284c7',
                    '&:hover': { bgcolor: '#0369a1' }
                  }}
                >
                  Call Mr. DK Patil
                </Button>
              </Box>
            </Grid>

            {/* Vice Advisor Card */}
            <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
              <Box 
                sx={{ 
                  p: 2.5, 
                  borderRadius: '16px', 
                  bgcolor: 'rgba(168, 85, 247, 0.08)', 
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  width: '100%'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#a855f7', width: 44, height: 44, fontWeight: 800 }}>PK</Avatar>
                  <Box>
                    <Chip label="Vice Advisor" size="small" color="secondary" sx={{ fontWeight: 800, height: 20, fontSize: '0.68rem', mb: 0.3 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                      Miss Priyanka Kapdekar
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ color: '#c084fc', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                    +91 7888148065
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="secondary"
                  component="a"
                  href="tel:7888148065"
                  startIcon={<PhoneIcon />}
                  fullWidth
                  sx={{ 
                    mt: 0.5, 
                    borderRadius: '10px', 
                    fontWeight: 800, 
                    fontSize: '0.82rem',
                    textTransform: 'none',
                    bgcolor: '#a855f7',
                    '&:hover': { bgcolor: '#9333ea' }
                  }}
                >
                  Call Miss Priyanka
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 600 }}>
              📍 Growsure Corporate Office · 24/7 Helpline Support
            </Typography>
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700 }}>
              Email: support@growsure.com | Helpline: 1800-419-8888
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Forgot & Reset Password Dialog Modal with Mandatory Email OTP Verification */}
      <Dialog
        open={openForgotPassword}
        onClose={() => setOpenForgotPassword(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            color: '#f3f4f6',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.12)',
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockResetIcon sx={{ color: '#38bdf8', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              Reset Account Password
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenForgotPassword(false)} sx={{ color: '#94a3b8' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {/* Multi-step progress indicator */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, px: 2, py: 1.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Chip 
              icon={<MarkEmailReadIcon />} 
              label="1. Email Code" 
              color={forgotStep === 1 ? 'primary' : 'default'} 
              variant={forgotStep === 1 ? 'filled' : 'outlined'} 
              size="small"
              sx={{ fontWeight: 700 }}
            />
            <Chip 
              icon={<KeyIcon />} 
              label="2. Verify OTP" 
              color={forgotStep === 2 ? 'primary' : 'default'} 
              variant={forgotStep === 2 ? 'filled' : 'outlined'} 
              size="small"
              sx={{ fontWeight: 700 }}
            />
            <Chip 
              icon={<LockResetIcon />} 
              label="3. New Password" 
              color={forgotStep === 3 ? 'success' : 'default'} 
              variant={forgotStep === 3 ? 'filled' : 'outlined'} 
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          {forgotError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{forgotError}</Alert>}
          {forgotSuccess && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>{forgotSuccess}</Alert>}
          {generatedOtpMsg && (
            <Alert severity="info" icon={<KeyIcon />} sx={{ mb: 2.5, borderRadius: 2, bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #0284c7' }}>
              <strong>Email Verification OTP Generated:</strong> {generatedOtpMsg}
            </Alert>
          )}

          {/* STEP 1: Request OTP */}
          {forgotStep === 1 && (
            <form onSubmit={handleSendForgotPasswordOtp}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                  Enter your registered account email address. We will send a 6-digit verification code to verify your identity before allowing a password reset.
                </Typography>
                <TextField 
                  label="Registered Email Address" 
                  type="email"
                  variant="outlined" 
                  fullWidth 
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  sx={{
                    '& .MuiInputBase-input': { color: '#ffffff', fontSize: '1rem' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.06)',
                      borderRadius: '12px !important',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  disabled={forgotLoading}
                  sx={{ 
                    py: 1.4, 
                    fontWeight: 800,
                    borderRadius: '12px !important',
                    bgcolor: '#0284c7',
                    '&:hover': { bgcolor: '#0369a1' }
                  }}
                >
                  {forgotLoading ? 'Sending Code...' : 'Send Verification Code'}
                </Button>
              </Box>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {forgotStep === 2 && (
            <form onSubmit={handleVerifyOtpCode}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                  Please enter the 6-digit verification code sent to <strong>{forgotEmail}</strong>. Email verification is mandatory to reset your password.
                </Typography>
                <TextField 
                  label="6-Digit Verification Code (OTP)" 
                  variant="outlined" 
                  fullWidth 
                  required
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  inputProps={{ maxLength: 6 }}
                  sx={{
                    '& .MuiInputBase-input': { color: '#38bdf8', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '4px', textAlign: 'center' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.06)',
                      borderRadius: '12px !important',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }
                    }
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined"
                    onClick={() => setForgotStep(1)}
                    sx={{ py: 1.4, px: 3, color: '#94a3b8', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none', fontWeight: 700, borderRadius: '12px !important' }}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large"
                    fullWidth
                    disabled={forgotLoading}
                    sx={{ 
                      py: 1.4, 
                      fontWeight: 800,
                      borderRadius: '12px !important',
                      bgcolor: '#0284c7',
                      '&:hover': { bgcolor: '#0369a1' }
                    }}
                  >
                    {forgotLoading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </Box>
              </Box>
            </form>
          )}

          {/* STEP 3: Enter New Password with Eye Icon Button */}
          {forgotStep === 3 && (
            <form onSubmit={handleResetPasswordSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="body2" sx={{ color: '#34d399', fontWeight: 600 }}>
                  ✓ Email Verified! Set your new account password below.
                </Typography>

                <TextField 
                  label="New Password" 
                  type={showNewPassword ? 'text' : 'password'}
                  variant="outlined" 
                  fullWidth 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          sx={{ color: '#94a3b8' }}
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiInputBase-input': { color: '#ffffff', fontSize: '1rem' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.06)',
                      borderRadius: '12px !important',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }
                    }
                  }}
                />

                <TextField 
                  label="Confirm New Password" 
                  type={showNewPassword ? 'text' : 'password'}
                  variant="outlined" 
                  fullWidth 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{
                    '& .MuiInputBase-input': { color: '#ffffff', fontSize: '1rem' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.06)',
                      borderRadius: '12px !important',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }
                    }
                  }}
                />

                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  disabled={forgotLoading}
                  sx={{ 
                    py: 1.5, 
                    fontWeight: 800,
                    borderRadius: '12px !important',
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {forgotLoading ? 'Updating Password...' : 'Reset Password & Save'}
                </Button>
              </Box>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Login;
