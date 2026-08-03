import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Grid, Card, CardContent, Typography, Button, TextField, 
  MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, 
  DialogContent, DialogActions, Chip, Divider, Slider, InputAdornment,
  Snackbar, Alert
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SearchIcon from '@mui/icons-material/Search';

import api from '../../services/api';
import { setPolicies, setCompareA, setCompareB } from '../../store';
import UpiQrPaymentModal from '../../components/UpiQrPaymentModal';

const PolicyMarketplace = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { policiesList, compareA, compareB } = useSelector((state) => state.policy);
  
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [maxPremium, setMaxPremium] = useState(100000);
  const [minCoverage, setMinCoverage] = useState(100000);
  
  // Checkout Dialogs
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelationship, setNomineeRelationship] = useState('Spouse');
  const [nomineeContact, setNomineeContact] = useState('');
  const [upiId, setUpiId] = useState('amit.sharma@okaxis');

  // Field validation errors
  const [nomineeNameError, setNomineeNameError] = useState('');
  const [nomineeContactError, setNomineeContactError] = useState('');
  const [upiIdError, setUpiIdError] = useState('');

  // Payment simulated dialog
  const [paymentOverlayOpen, setPaymentOverlayOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [purchasedNumber, setPurchasedNumber] = useState('');
  const [statusNotice, setStatusNotice] = useState(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await api.get('/api/policies');
        dispatch(setPolicies(response.data));
      } catch (err) {
        console.error('Error fetching policies', err);
      }
    };
    fetchPolicies();
  }, [dispatch]);

  const handleCompareSelect = (policy) => {
    if (!compareA) {
      dispatch(setCompareA(policy));
    } else if (!compareB && compareA.id !== policy.id) {
      dispatch(setCompareB(policy));
      navigate('/marketplace/compare');
    } else {
      dispatch(setCompareA(policy));
      dispatch(setCompareB(null));
    }
  };

  const handleOpenBuy = (policy) => {
    setSelectedPolicy(policy);
    setNomineeNameError('');
    setNomineeContactError('');
    setUpiIdError('');
    setBuyDialogOpen(true);
  };

  const validateCheckoutFields = () => {
    let isValid = true;

    // Nominee Name Validation
    const cleanName = nomineeName.trim();
    if (!cleanName) {
      setNomineeNameError('Nominee Full Name is required.');
      isValid = false;
    } else if (!/^[a-zA-Z\s]{3,50}$/.test(cleanName)) {
      setNomineeNameError('Nominee Name must contain only alphabets (minimum 3 letters).');
      isValid = false;
    } else {
      setNomineeNameError('');
    }

    // Nominee Contact Validation
    const cleanContact = nomineeContact.trim();
    if (!cleanContact) {
      setNomineeContactError('Nominee Contact Number is required.');
      isValid = false;
    } else if (!/^[6-9]\d{9}$/.test(cleanContact) || /^(\d)\1{9}$/.test(cleanContact)) {
      setNomineeContactError('Enter a valid 10-digit mobile number starting with 6-9.');
      isValid = false;
    } else {
      setNomineeContactError('');
    }

    // UPI ID Validation
    const cleanUpi = upiId.trim();
    if (!cleanUpi) {
      setUpiIdError('Your UPI ID / VPA is required.');
      isValid = false;
    } else if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(cleanUpi)) {
      setUpiIdError('Enter a valid UPI ID (e.g. username@okaxis or 9876543210@paytm).');
      isValid = false;
    } else {
      setUpiIdError('');
    }

    return isValid;
  };

  const handleCreateOrder = async () => {
    if (!validateCheckoutFields()) return;
    try {
      const response = await api.post('/api/payments/create-order', {
        amount: selectedPolicy.premiumAmount,
        paymentType: 'POLICY_PREMIUM',
        referenceId: selectedPolicy.id
      });
      setPaymentData(response.data);
      setBuyDialogOpen(false);
      setPaymentOverlayOpen(true);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data || 'Failed to initialize payment gateway.';
      alert(typeof msg === 'string' ? msg : 'Failed to initialize payment gateway.');
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    try {
      const response = await api.post('/api/payments/verify-payment', {
        orderId: paymentData.orderId,
        paymentId: 'pay_sim_' + Math.floor(Math.random() * 1000000),
        signature: 'sig_sim_' + Math.floor(Math.random() * 1000000)
      });
      setPaymentOverlayOpen(false);
      setPurchasedNumber(response.data?.policyNumber || paymentData?.orderId || 'POL-' + Math.floor(Math.random() * 1000000));
      setSuccessDialogOpen(true);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data || 'Payment validation failed.';
      alert(typeof msg === 'string' ? msg : 'Payment validation failed.');
    }
  };

  const filteredPolicies = policiesList.filter(policy => {
    const matchesCategory = category === '' || policy.category === category;
    const matchesSearch = search === '' || 
      policy.policyName.toLowerCase().includes(search.toLowerCase()) ||
      (policy.insurer?.companyName && policy.insurer.companyName.toLowerCase().includes(search.toLowerCase()));
    const matchesPremium = policy.premiumAmount <= maxPremium;
    const matchesCoverage = policy.coverageAmount >= minCoverage;
    return matchesCategory && matchesSearch && matchesPremium && matchesCoverage;
  });

  return (
    <Box sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: -0.5 }}>
            🛡️ <span className="gradient-text">Insurance Protection Portal</span>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover verified Health, Term Life, Motor, and Travel insurance policies with instant settlement options.
          </Typography>
        </Box>
        {(compareA || compareB) && (
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<CompareArrowsIcon />}
            onClick={() => navigate('/marketplace/compare')}
            sx={{ fontWeight: 800 }}
          >
            Compare Plans ({compareA ? '1' : '0'}/2)
          </Button>
        )}
      </Box>

      {/* Search & Filter Toolbar */}
      <Card className="glass-card-static" sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField 
              fullWidth 
              placeholder="Search plan name or provider (e.g. HDFC, LIC)..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="cat-label">Insurance Category</InputLabel>
              <Select
                labelId="cat-label"
                value={category}
                label="Insurance Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="HEALTH">Health Cover</MenuItem>
                <MenuItem value="LIFE">Term Life</MenuItem>
                <MenuItem value="MOTOR">Motor Car/Bike</MenuItem>
                <MenuItem value="TRAVEL">Travel Protection</MenuItem>
                <MenuItem value="PROPERTY">Property & Home</MenuItem>
                <MenuItem value="CYBER">Cyber Security</MenuItem>
                <MenuItem value="AGRICULTURE">Agriculture & Crop</MenuItem>
                <MenuItem value="BUSINESS">Business & Commercial</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <Typography variant="caption" color="text.secondary">Max Annual Premium: ₹{maxPremium.toLocaleString('en-IN')}</Typography>
            <Slider 
              value={maxPremium} 
              min={1000} 
              max={100000} 
              step={1000} 
              onChange={(_, val) => setMaxPremium(val)} 
              color="primary"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <Typography variant="caption" color="text.secondary">Min Sum Coverage: ₹{(minCoverage/100000).toFixed(1)}L</Typography>
            <Slider 
              value={minCoverage} 
              min={100000} 
              max={10000000} 
              step={500000} 
              onChange={(_, val) => setMinCoverage(val)} 
              color="primary"
            />
          </Grid>
        </Grid>
      </Card>

      {/* Catalog Grid */}
      <Grid container spacing={3}>
        {filteredPolicies.map((policy) => {
          const isSelectedA = compareA?.id === policy.id;
          const isSelectedB = compareB?.id === policy.id;
          const isCompared = isSelectedA || isSelectedB;

          return (
            <Grid item xs={12} md={6} lg={4} key={policy.id}>
              <Card className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 800, display: 'block', mb: 0.5 }}>
                        {policy.insurer?.companyName || 'Verified Partner'}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                        {policy.policyName}
                      </Typography>
                    </Box>
                    <Chip 
                      label={policy.category} 
                      size="small" 
                      color="primary"
                      sx={{ fontWeight: 800 }} 
                    />
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Sum Insured</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: '#34d399' }}>
                        ₹{policy.coverageAmount?.toLocaleString('en-IN')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Annual Premium</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800 }}>
                        ₹{policy.premiumAmount?.toLocaleString('en-IN')}<Typography variant="caption" color="text.secondary">/yr</Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Claim Settlement</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {policy.claimSettlementRatio}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Waiting Period</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {policy.waitingPeriodMonths} Months
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 1.5 }}>
                    <Button 
                      variant={isCompared ? "contained" : "outlined"} 
                      color={isCompared ? "secondary" : "inherit"}
                      onClick={() => handleCompareSelect(policy)}
                      sx={{ flex: 1 }}
                    >
                      {isCompared ? 'Compared ✓' : 'Compare'}
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleOpenBuy(policy)}
                      sx={{ flex: 1 }}
                    >
                      Buy Policy
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Nominee Checkout Dialog */}
      <Dialog open={buyDialogOpen} onClose={() => setBuyDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Nominee Information & UPI Setup</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Typography variant="subtitle2">Selected: <strong>{selectedPolicy?.policyName}</strong> (₹{selectedPolicy?.premiumAmount}/yr)</Typography>
          <TextField 
            label="Nominee Full Name *" 
            value={nomineeName} 
            onChange={(e) => {
              const val = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
              setNomineeName(val);
              if (val.trim().length >= 3) setNomineeNameError('');
            }} 
            error={Boolean(nomineeNameError)}
            helperText={nomineeNameError || 'Alphabets only (e.g. Rahul Sharma)'}
            fullWidth 
          />
          <FormControl fullWidth>
            <InputLabel id="rel-label">Relationship to Applicant *</InputLabel>
            <Select
              labelId="rel-label"
              value={nomineeRelationship}
              label="Relationship to Applicant *"
              onChange={(e) => setNomineeRelationship(e.target.value)}
            >
              <MenuItem value="Spouse">Spouse</MenuItem>
              <MenuItem value="Father">Father</MenuItem>
              <MenuItem value="Mother">Mother</MenuItem>
              <MenuItem value="Child">Child</MenuItem>
            </Select>
          </FormControl>
          <TextField 
            label="Nominee Contact Number *" 
            value={nomineeContact} 
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              setNomineeContact(val);
              if (/^[6-9]\d{9}$/.test(val) && !/^(\d)\1{9}$/.test(val)) setNomineeContactError('');
            }} 
            inputProps={{ maxLength: 10 }}
            error={Boolean(nomineeContactError)}
            helperText={nomineeContactError || '10-digit Indian mobile number'}
            fullWidth 
          />
          <Divider sx={{ my: 0.5 }} />
          <TextField 
            label="Your UPI ID / VPA (Payer) *" 
            value={upiId} 
            onChange={(e) => {
              const val = e.target.value.toLowerCase().trim();
              setUpiId(val);
              if (/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(val)) setUpiIdError('');
            }} 
            placeholder="yourname@ybl / phone@paytm"
            error={Boolean(upiIdError)}
            fullWidth 
            helperText={upiIdError || 'Enter your UPI ID to proceed to QR scanner payment'}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setBuyDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateOrder} 
            disabled={!nomineeName || !upiId || !nomineeContact}
          >
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* UPI QR Payment Modal (Center Pop-up Window) */}
      <UpiQrPaymentModal
        open={paymentOverlayOpen}
        onClose={(failed) => {
          setPaymentOverlayOpen(false);
          if (failed) {
            setStatusNotice({ message: '❌ Payment Failed: Session timed out (2 minute limit reached). Please try again.', type: 'error' });
          }
        }}
        amount={paymentData?.amount || selectedPolicy?.premiumAmount || 0}
        payerUpiId={upiId}
        receiverUpiId="sarveshkulkarni.2003@ybl"
        receiverName="Sarvesh Sachin Kulkarni"
        bankInfo="Kotak Mahindra Bank - 2003"
        orderTitle={`Policy Purchase: ${selectedPolicy?.policyName}`}
        orderId={paymentData?.orderId}
        paymentType="POLICY_PREMIUM"
        referenceId={selectedPolicy?.id}
        onPaymentSuccess={handleSimulatePaymentSuccess}
        onPaymentSubmitted={(utr) => {
          setStatusNotice({ message: `⏳ UTR ${utr} submitted for Admin approval! Your policy will be activated once Admin accepts your payment.`, type: 'success' });
        }}
      />

      {/* Success Modal */}
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', color: '#10b981' }}>
          🎉 Policy Purchased Successfully!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
            Policy Number: {purchasedNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your policy documents have been generated and recorded on your customer dashboard.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={() => { setSuccessDialogOpen(false); navigate('/'); }}>
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(statusNotice)}
        autoHideDuration={4000}
        onClose={() => setStatusNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={statusNotice?.type || 'info'} variant="filled" sx={{ borderRadius: 3, fontWeight: 700 }}>
          {statusNotice?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PolicyMarketplace;
