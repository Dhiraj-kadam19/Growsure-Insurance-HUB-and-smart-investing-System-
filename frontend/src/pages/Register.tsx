import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, ToggleButton, ToggleButtonGroup, Grid } from '@mui/material';
import api from '../services/api';
import Logo from '../components/Logo';

const Register: React.FC = () => {
  const [role, setRole] = useState<'POLICY_HOLDER' | 'INSURER'>('POLICY_HOLDER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [dob, setDob] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = (_: any, newRole: 'POLICY_HOLDER' | 'INSURER') => {
    if (newRole) {
      setRole(newRole);
      setError(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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
                onChange={(e) => setName(e.target.value)}
              />
              <TextField 
                label="Email Address" 
                type="email"
                variant="outlined" 
                fullWidth 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField 
                label="Password" 
                type="password"
                variant="outlined" 
                fullWidth 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                        onChange={(e) => setAadhaar(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        label="PAN Card Number" 
                        variant="outlined" 
                        fullWidth 
                        required
                        value={pan}
                        onChange={(e) => setPan(e.target.value)}
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
                        onChange={(e) => setDob(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        label="Contact Number" 
                        variant="outlined" 
                        fullWidth 
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
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
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                  <TextField 
                    label="Insurance IRDAI License Number" 
                    variant="outlined" 
                    fullWidth 
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
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
                onChange={(e) => setAddress(e.target.value)}
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
