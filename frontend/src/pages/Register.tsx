import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, ToggleButton, ToggleButtonGroup, Grid, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '../services/api';
import Logo from '../components/Logo';

const Register: React.FC = () => {
  const [role, setRole] = useState<'POLICY_HOLDER' | 'INSURER'>('POLICY_HOLDER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [dob, setDob] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = (_: any, newRole: 'POLICY_HOLDER' | 'INSURER') => {
    if (newRole) {
      setRole(newRole);
      setError(null);
      setFieldErrors({});
    }
  };

  const validateAll = (): boolean => {
    const errs: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Full Name
    if (!name.trim()) {
      errs.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters long.';
    } else if (!/^[a-zA-Z\s'.-]+$/.test(name.trim())) {
      errs.name = 'Name should only contain alphabetic characters.';
    }

    // Email
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    // Password
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters long.';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
      errs.password = 'Password must contain at least one letter and one number.';
    }

    // Address
    const cleanAddr = address.trim();
    if (!cleanAddr) {
      errs.address = 'Address details are required.';
    } else if (cleanAddr.length < 10) {
      errs.address = 'Address must be at least 10 characters (include house number, street, city, pin code).';
    } else if (!/[a-zA-Z]{3,}/.test(cleanAddr)) {
      errs.address = 'Address must contain valid text for street/city (gibberish/symbols rejected).';
    } else if (/^[^a-zA-Z0-9]+$/.test(cleanAddr)) {
      errs.address = 'Address cannot contain only special characters.';
    }

    if (role === 'POLICY_HOLDER') {
      // Aadhaar Card
      const cleanAadhaar = aadhaar.trim();
      if (!cleanAadhaar) {
        errs.aadhaar = 'Aadhaar number is required.';
      } else if (/[^\d]/.test(cleanAadhaar)) {
        errs.aadhaar = 'Aadhaar must contain only numeric digits (no alphabets or symbols).';
      } else if (cleanAadhaar.length !== 12) {
        errs.aadhaar = 'Aadhaar must be a 12-digit numeric value.';
      } else if (!/^[2-9]\d{11}$/.test(cleanAadhaar)) {
        errs.aadhaar = 'Aadhaar must be a 12-digit number starting with 2-9.';
      } else if (/^(\d)\1{11}$/.test(cleanAadhaar)) {
        errs.aadhaar = 'Aadhaar number cannot contain all identical digits.';
      }

      // PAN Card
      const cleanPan = pan.trim().toUpperCase();
      if (!cleanPan) {
        errs.pan = 'PAN card number is required.';
      } else if (cleanPan.length !== 10) {
        errs.pan = 'PAN must be exactly 10 characters long (e.g. ABCDE1234F).';
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
        errs.pan = 'PAN must follow format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).';
      }

      // Date of Birth
      if (!dob) {
        errs.dob = 'Date of birth is required.';
      } else {
        const selectedDob = new Date(dob);
        selectedDob.setHours(0, 0, 0, 0);

        if (isNaN(selectedDob.getTime())) {
          errs.dob = 'Please enter a valid Date of Birth.';
        } else if (selectedDob.getTime() > today.getTime()) {
          errs.dob = 'Date of Birth cannot be in the future. Accept only past or present dates.';
        } else if (selectedDob.getTime() === today.getTime()) {
          errs.dob = 'Date of Birth cannot be today.';
        } else {
          // Calculate Age
          let age = today.getFullYear() - selectedDob.getFullYear();
          const m = today.getMonth() - selectedDob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < selectedDob.getDate())) {
            age--;
          }

          if (age < 18) {
            errs.dob = `Age is ${age} years. You must be at least 18 years old to register as a policy holder.`;
          } else if (age > 120) {
            errs.dob = 'Please enter a valid Date of Birth (maximum age 120 years).';
          }
        }
      }

      // Contact Number
      const cleanContact = contact.trim();
      if (!cleanContact) {
        errs.contact = 'Contact number is required.';
      } else if (/[^\d]/.test(cleanContact)) {
        errs.contact = 'Contact number must contain only digits (no alphabets or special characters).';
      } else if (cleanContact.length !== 10) {
        errs.contact = 'Contact number must be a valid 10-digit mobile number.';
      } else if (!/^[6-9]\d{9}$/.test(cleanContact)) {
        errs.contact = 'Contact must be a 10-digit mobile number starting with 6, 7, 8, or 9.';
      } else if (/^(\d)\1{9}$/.test(cleanContact)) {
        errs.contact = 'Contact number cannot contain all identical digits.';
      }
    } else {
      // Insurer Company Name
      if (!companyName.trim()) {
        errs.companyName = 'Company name is required.';
      }

      // License Number
      if (!licenseNumber.trim()) {
        errs.licenseNumber = 'IRDAI License number is required.';
      } else if (licenseNumber.trim().length < 5) {
        errs.licenseNumber = 'License number must be at least 5 characters.';
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload: any = { name, email, password, role, address };

    if (role === 'POLICY_HOLDER') {
      payload.aadhaar = aadhaar;
      payload.pan = pan;
      payload.dob = dob;
      payload.contact = contact;
    } else {
      payload.licenseNumber = licenseNumber;
      payload.companyName = companyName;
    }

    try {
      await api.post('/api/auth/register', payload);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data || 'Registration failed. Try checking your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#0b0f19',
      position: 'relative',
      overflow: 'hidden',
      py: 4
    }}>
      <div className="bg-glow-blue" style={{ top: '-10%', left: '-10%', width: 500, height: 500 }}></div>
      <div className="bg-glow-green" style={{ bottom: '-10%', right: '-10%', width: 500, height: 500 }}></div>

      <Card className="glass-card" sx={{ width: 500, zIndex: 1 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Logo size="large" />
            <Typography variant="body2" color="text.secondary">
              Create an account to join Growsure
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              color="primary"
              value={role}
              exclusive
              onChange={handleRoleChange}
              fullWidth
            >
              <ToggleButton value="POLICY_HOLDER" sx={{ fontWeight: 600 }}>Customer</ToggleButton>
              <ToggleButton value="INSURER" sx={{ fontWeight: 600 }}>Insurer Partner</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

          <form onSubmit={handleRegister}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField 
                label="Full Name" 
                variant="outlined" 
                fullWidth 
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                }}
                error={Boolean(fieldErrors.name)}
                helperText={fieldErrors.name}
              />
              <TextField 
                label="Email Address" 
                type="email"
                variant="outlined" 
                fullWidth 
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                }}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
              />
              <TextField 
                label="Password" 
                type={showPassword ? 'text' : 'password'}
                variant="outlined" 
                fullWidth 
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                }}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />


              {role === 'POLICY_HOLDER' ? (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField 
                        label="Aadhaar Number" 
                        variant="outlined" 
                        fullWidth 
                        required
                        value={aadhaar}
                        onChange={(e) => {
                          setAadhaar(e.target.value);
                          if (fieldErrors.aadhaar) setFieldErrors(prev => ({ ...prev, aadhaar: '' }));
                        }}
                        error={Boolean(fieldErrors.aadhaar)}
                        helperText={fieldErrors.aadhaar}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        label="PAN Card Number" 
                        variant="outlined" 
                        fullWidth 
                        required
                        value={pan}
                        onChange={(e) => {
                          setPan(e.target.value.toUpperCase());
                          if (fieldErrors.pan) setFieldErrors(prev => ({ ...prev, pan: '' }));
                        }}
                        error={Boolean(fieldErrors.pan)}
                        helperText={fieldErrors.pan}
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField 
                        label="Date of Birth" 
                        type="date"
                        variant="outlined" 
                        fullWidth 
                        required
                        InputLabelProps={{ shrink: true }}
                        value={dob}
                        onChange={(e) => {
                          setDob(e.target.value);
                          if (fieldErrors.dob) setFieldErrors(prev => ({ ...prev, dob: '' }));
                        }}
                        error={Boolean(fieldErrors.dob)}
                        helperText={fieldErrors.dob}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        label="Contact Number" 
                        variant="outlined" 
                        fullWidth 
                        required
                        value={contact}
                        onChange={(e) => {
                          setContact(e.target.value);
                          if (fieldErrors.contact) setFieldErrors(prev => ({ ...prev, contact: '' }));
                        }}
                        error={Boolean(fieldErrors.contact)}
                        helperText={fieldErrors.contact}
                      />
                    </Grid>
                  </Grid>
                </>
              ) : (
                <>
                  <TextField 
                    label="Company Name" 
                    variant="outlined" 
                    fullWidth 
                    required
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (fieldErrors.companyName) setFieldErrors(prev => ({ ...prev, companyName: '' }));
                    }}
                    error={Boolean(fieldErrors.companyName)}
                    helperText={fieldErrors.companyName}
                  />
                  <TextField 
                    label="Insurance IRDAI License Number" 
                    variant="outlined" 
                    fullWidth 
                    required
                    value={licenseNumber}
                    onChange={(e) => {
                      setLicenseNumber(e.target.value);
                      if (fieldErrors.licenseNumber) setFieldErrors(prev => ({ ...prev, licenseNumber: '' }));
                    }}
                    error={Boolean(fieldErrors.licenseNumber)}
                    helperText={fieldErrors.licenseNumber}
                  />
                </>
              )}

              <TextField 
                label="Address Details" 
                multiline
                rows={2}
                variant="outlined" 
                fullWidth 
                required
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (fieldErrors.address) setFieldErrors(prev => ({ ...prev, address: '' }));
                }}
                error={Boolean(fieldErrors.address)}
                helperText={fieldErrors.address}
              />

              <Button 
                type="submit" 
                variant="contained" 
                color="secondary" 
                size="large"
                disabled={loading}
                sx={{ py: 1.5, mt: 1, boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)' }}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
