import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, Grid, Card, CardContent, Typography, Button, LinearProgress, 
  Divider, List, ListItem, ListItemText, Chip, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, FormControl, 
  InputLabel, Select, Switch, FormControlLabel, Snackbar, Alert, IconButton
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SavingsIcon from '@mui/icons-material/Savings';

import api from '../../services/api';

const CustomerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [purchasedPolicies, setPurchasedPolicies] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [claims, setClaims] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Saved User Bank Details State (Persisted in localStorage)
  const [bankDetails, setBankDetails] = useState(() => {
    try {
      const saved = localStorage.getItem('growsure_user_bank_details');
      return saved ? JSON.parse(saved) : {
        bankName: 'Kotak Mahindra Bank',
        accountHolder: 'Amit Sharma',
        accountNumber: '1047182452',
        ifscCode: 'KKBK0001775',
        branch: 'Pune Laxmi Road Branch',
        accountType: 'Savings Account'
      };
    } catch {
      return {
        bankName: 'Kotak Mahindra Bank',
        accountHolder: 'Amit Sharma',
        accountNumber: '1047182452',
        ifscCode: 'KKBK0001775',
        branch: 'Pune Laxmi Road Branch',
        accountType: 'Savings Account'
      };
    }
  });

  // Saved AutoPay Mandate State (Persisted in localStorage)
  const [autoPay, setAutoPay] = useState(() => {
    try {
      const saved = localStorage.getItem('growsure_user_autopay');
      return saved ? JSON.parse(saved) : {
        isEnabled: true,
        mandateType: 'UPI_AUTOPAY',
        upiId: 'amit.sharma@okaxis',
        maxLimit: 25000,
        sipFrequency: 'Monthly (5th of every month)',
        policyRenewalAuto: true,
        status: 'ACTIVE'
      };
    } catch {
      return {
        isEnabled: true,
        mandateType: 'UPI_AUTOPAY',
        upiId: 'amit.sharma@okaxis',
        maxLimit: 25000,
        sipFrequency: 'Monthly (5th of every month)',
        policyRenewalAuto: true,
        status: 'ACTIVE'
      };
    }
  });

  // Dialog & Toast States
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [autoPayModalOpen, setAutoPayModalOpen] = useState(false);
  const [toastNotice, setToastNotice] = useState(null);

  // Temp form states for editing
  const [bankForm, setBankForm] = useState({ ...bankDetails });
  const [autoPayForm, setAutoPayForm] = useState({ ...autoPay });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profRes, polRes, portRes, claimRes, aiRes] = await Promise.all([
          api.get('/api/auth/profile'),
          api.get('/api/policies/active-purchases'),
          api.get('/api/investments/portfolio'),
          api.get('/api/claims/customer'),
          api.get('/api/ai/history')
        ]);
        setProfile(profRes.data);
        setPurchasedPolicies(polRes.data);
        setPortfolio(portRes.data);
        setClaims(claimRes.data);
        
        if (aiRes.data && aiRes.data.length > 0) {
          const suggestions = aiRes.data.map((item) => {
            try {
              return {
                ...item,
                outputRecommendation: typeof item.outputRecommendation === 'string' 
                  ? JSON.parse(item.outputRecommendation) 
                  : item.outputRecommendation
              };
            } catch {
              return item;
            }
          });
          setAiSuggestions(suggestions);
        }
      } catch (err) {
        console.error('Error fetching dashboard summary', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Save Bank Details
  const handleSaveBankDetails = (e) => {
    e.preventDefault();
    setBankDetails(bankForm);
    try {
      localStorage.setItem('growsure_user_bank_details', JSON.stringify(bankForm));
    } catch { /* ignore */ }
    setBankModalOpen(false);
    setToastNotice('🏦 Bank details updated successfully!');
  };

  // Save AutoPay Mandate Setup
  const handleSaveAutoPay = (e) => {
    e.preventDefault();
    const updatedStatus = autoPayForm.isEnabled ? 'ACTIVE' : 'PAUSED';
    const updated = { ...autoPayForm, status: updatedStatus };
    setAutoPay(updated);
    try {
      localStorage.setItem('growsure_user_autopay', JSON.stringify(updated));
    } catch { /* ignore */ }
    setAutoPayModalOpen(false);
    setToastNotice(autoPayForm.isEnabled ? '🔄 AutoPay Mandate activated successfully!' : '⏸️ AutoPay Mandate paused.');
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Loading Dashboard...</Typography>
        <LinearProgress color="secondary" />
      </Box>
    );
  }

  const latestAiSuggestion = aiSuggestions.find(s => s.recommendationType === 'POLICY') || aiSuggestions[0];

  return (
    <Box sx={{ py: 2 }}>
      
      {/* Welcome Banner */}
      <Box sx={(theme) => ({ 
        p: 4, 
        mb: 4, 
        borderRadius: 4, 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' 
          : 'linear-gradient(135deg, #e0e7ff 0%, #e0f2fe 100%)', 
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.2)',
        boxShadow: theme.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(99,102,241,0.1)'
      })}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" sx={(theme) => ({ 
              fontWeight: 800, 
              mb: 1, 
              fontFamily: 'Outfit',
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#1e1b4b'
            })}>
              Welcome back, {profile?.user?.name || bankDetails.accountHolder || 'User'}!
            </Typography>
            <Typography variant="body1" sx={(theme) => ({
              color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#334155'
            })}>
              Manage your active insurance policies, mutual fund SIP investments, linked bank account, and recurring AutoPay mandate.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={() => navigate('/marketplace/policies')} 
              sx={{ px: 4, py: 1.5, fontWeight: 700 }}
            >
              Browse Marketplace
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Active Cover Info */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>Active Policies</Typography>
                <ShieldIcon color="secondary" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {purchasedPolicies.length} Active
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total sum insured across all active health & term policies.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Investment Portfolio Info */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>Portfolio Value</Typography>
                <TrendingUpIcon color="secondary" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                ₹{portfolio?.currentValue ? portfolio.currentValue.toLocaleString('en-IN') : '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invested: ₹{portfolio?.totalInvested ? portfolio.totalInvested.toLocaleString('en-IN') : '0.00'} | Gain: ₹{portfolio?.totalProfitLoss ? portfolio.totalProfitLoss.toLocaleString('en-IN') : '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Claims Info */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>Claims Summary</Typography>
                <ReceiptLongIcon color="secondary" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {claims.length} Claims
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track status of submitted policy claim applications.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SECTION 2: User Bank Details & AutoPay Mandate Center */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: 1 }}>
        🏦 Bank Account & AutoPay Mandate Center
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Card 1: User Bank Account Details */}
        <Grid item xs={12} md={6}>
          <Card className="glass-card" sx={{ height: '100%', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceIcon color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Primary Bank Details
                  </Typography>
                </Box>
                <IconButton 
                  color="primary" 
                  size="small" 
                  onClick={() => { setBankForm({ ...bankDetails }); setBankModalOpen(true); }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>

              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Account Holder Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    {bankDetails.accountHolder}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Bank Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                    {bankDetails.bankName}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Account Number</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
                    •••• •••• {bankDetails.accountNumber.slice(-4)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">IFSC Code</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: '#34d399' }}>
                    {bankDetails.ifscCode}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Branch Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {bankDetails.branch}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Account Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {bankDetails.accountType}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2.5, p: 1.5, bgcolor: 'rgba(56, 189, 248, 0.08)', borderRadius: 2, border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 15, color: '#38bdf8' }} />
                  Bank account verified for direct claim settlements & SIP debits.
                </Typography>
              </Box>

            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Recurring AutoPay Mandate Setup */}
        <Grid item xs={12} md={6}>
          <Card className="glass-card" sx={{ height: '100%', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutorenewIcon sx={{ color: '#10b981', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    AutoPay e-Mandate
                  </Typography>
                </Box>
                <Chip 
                  label={autoPay.status === 'ACTIVE' ? 'AUTO-PAY ACTIVE ✓' : 'PAUSED'} 
                  color={autoPay.status === 'ACTIVE' ? 'success' : 'default'} 
                  size="small" 
                  sx={{ fontWeight: 800, fontSize: '0.75rem' }} 
                />
              </Box>

              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Mandate Mode</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: '#34d399' }}>
                    {autoPay.mandateType === 'UPI_AUTOPAY' ? 'UPI AutoPay (VPA)' : 'Net Banking NACH'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Linked UPI VPA / ID</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: '#c084fc' }}>
                    {autoPay.upiId}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Max Mandate Limit</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    ₹{autoPay.maxLimit?.toLocaleString('en-IN')} / mo
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Debit Frequency</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {autoPay.sipFrequency}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Auto-Debit for: <strong>Monthly SIPs & Policy Renewals</strong>
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  size="small" 
                  onClick={() => { setAutoPayForm({ ...autoPay }); setAutoPayModalOpen(true); }}
                  startIcon={<EditIcon />}
                  sx={{ fontWeight: 800, borderRadius: 2 }}
                >
                  Configure AutoPay
                </Button>
              </Box>

            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Main Sections */}
      <Grid container spacing={3}>
        {/* Active Purchased Policies List */}
        <Grid item xs={12} md={7}>
          <Card className="glass-card">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon color="secondary" /> Purchased Policies
              </Typography>
              {purchasedPolicies.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No policies purchased yet.</Typography>
              ) : (
                <List disablePadding>
                  {purchasedPolicies.map((purch) => (
                    <React.Fragment key={purch.purchaseId}>
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {purch.policy?.policyName} (Policy No: {purch.policyNumber})
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              Coverage: ₹{purch.policy?.coverageAmount?.toLocaleString('en-IN')} | Premium: ₹{purch.policy?.premiumAmount?.toLocaleString('en-IN')}/yr | Status: <strong style={{ color: '#10b981' }}>{purch.status}</strong>
                            </Typography>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* AI Recommendations Highlight */}
        <Grid item xs={12} md={5}>
          <Card className="glass-card">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon color="secondary" /> Recent AI Recommendation
              </Typography>
              {latestAiSuggestion ? (
                <Box>
                  <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    Type: {latestAiSuggestion.recommendationType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Prompt inputs: Risk={latestAiSuggestion.inputContext?.risk}, Income={latestAiSuggestion.inputContext?.income}
                  </Typography>
                  <Button variant="outlined" color="secondary" component={Link} to="/marketplace/planner" fullWidth>
                    View Financial Advisory
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No AI suggestions generated yet. Use the AI Financial Planner to get customized advice.
                  </Typography>
                  <Button variant="outlined" color="secondary" component={Link} to="/marketplace/planner" fullWidth>
                    Get Recommendations
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* MODAL 1: Edit Bank Account Details */}
      <Dialog open={bankModalOpen} onClose={() => setBankModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceIcon color="primary" /> Edit Bank Account Details
        </DialogTitle>
        <form onSubmit={handleSaveBankDetails}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField 
              label="Account Holder Name *" 
              value={bankForm.accountHolder} 
              onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })} 
              required 
              fullWidth 
            />
            <FormControl fullWidth>
              <InputLabel id="bank-select-label">Bank Name *</InputLabel>
              <Select
                labelId="bank-select-label"
                value={bankForm.bankName}
                label="Bank Name *"
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
              >
                <MenuItem value="Kotak Mahindra Bank">Kotak Mahindra Bank</MenuItem>
                <MenuItem value="HDFC Bank">HDFC Bank</MenuItem>
                <MenuItem value="ICICI Bank">ICICI Bank</MenuItem>
                <MenuItem value="State Bank of India">State Bank of India (SBI)</MenuItem>
                <MenuItem value="Axis Bank">Axis Bank</MenuItem>
                <MenuItem value="Bank of Baroda">Bank of Baroda</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="Account Number *" 
              value={bankForm.accountNumber} 
              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, '') })} 
              required 
              fullWidth 
            />
            <TextField 
              label="IFSC Code *" 
              value={bankForm.ifscCode} 
              onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })} 
              required 
              fullWidth 
            />
            <TextField 
              label="Branch Name" 
              value={bankForm.branch} 
              onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })} 
              fullWidth 
            />
            <FormControl fullWidth>
              <InputLabel id="acct-type-label">Account Type</InputLabel>
              <Select
                labelId="acct-type-label"
                value={bankForm.accountType}
                label="Account Type"
                onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
              >
                <MenuItem value="Savings Account">Savings Account</MenuItem>
                <MenuItem value="Current Account">Current Account</MenuItem>
                <MenuItem value="Salary Account">Salary Account</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setBankModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 800 }}>
              Save Bank Details
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* MODAL 2: Configure AutoPay Mandate */}
      <Dialog open={autoPayModalOpen} onClose={() => setAutoPayModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutorenewIcon sx={{ color: '#10b981' }} /> Setup AutoPay Mandate
        </DialogTitle>
        <form onSubmit={handleSaveAutoPay}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={autoPayForm.isEnabled} 
                  onChange={(e) => setAutoPayForm({ ...autoPayForm, isEnabled: e.target.checked })} 
                  color="success"
                />
              }
              label={<strong>Enable Recurring AutoPay Mandate</strong>}
            />

            <FormControl fullWidth>
              <InputLabel id="mandate-type-label">Mandate Mode</InputLabel>
              <Select
                labelId="mandate-type-label"
                value={autoPayForm.mandateType}
                label="Mandate Mode"
                onChange={(e) => setAutoPayForm({ ...autoPayForm, mandateType: e.target.value })}
              >
                <MenuItem value="UPI_AUTOPAY">UPI AutoPay (Google Pay / PhonePe / Paytm)</MenuItem>
                <MenuItem value="NET_BANKING_NACH">Net Banking e-NACH Mandate</MenuItem>
                <MenuItem value="DEBIT_CARD_MANDATE">Debit Card Standing Instruction</MenuItem>
              </Select>
            </FormControl>

            <TextField 
              label="Linked UPI VPA / ID *" 
              value={autoPayForm.upiId} 
              onChange={(e) => setAutoPayForm({ ...autoPayForm, upiId: e.target.value })} 
              required 
              fullWidth 
              placeholder="yourname@okaxis / phone@paytm"
            />

            <TextField 
              label="Max Monthly Mandate Limit (₹) *" 
              type="number" 
              value={autoPayForm.maxLimit} 
              onChange={(e) => setAutoPayForm({ ...autoPayForm, maxLimit: Number(e.target.value) })} 
              required 
              fullWidth 
            />

            <FormControl fullWidth>
              <InputLabel id="freq-label">Debit Day & Frequency</InputLabel>
              <Select
                labelId="freq-label"
                value={autoPayForm.sipFrequency}
                label="Debit Day & Frequency"
                onChange={(e) => setAutoPayForm({ ...autoPayForm, sipFrequency: e.target.value })}
              >
                <MenuItem value="Monthly (5th of every month)">Monthly (5th of every month)</MenuItem>
                <MenuItem value="Monthly (10th of every month)">Monthly (10th of every month)</MenuItem>
                <MenuItem value="Monthly (15th of every month)">Monthly (15th of every month)</MenuItem>
                <MenuItem value="Monthly (25th of every month)">Monthly (25th of every month)</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch 
                  checked={autoPayForm.policyRenewalAuto} 
                  onChange={(e) => setAutoPayForm({ ...autoPayForm, policyRenewalAuto: e.target.checked })} 
                  color="primary"
                />
              }
              label={<Typography variant="body2">Auto-renew policy premiums on due date</Typography>}
            />

          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setAutoPayModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="success" sx={{ fontWeight: 800 }}>
              Save AutoPay Setup
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Notification Toast */}
      <Snackbar
        open={Boolean(toastNotice)}
        autoHideDuration={4000}
        onClose={() => setToastNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastNotice(null)} severity="success" variant="filled" sx={{ borderRadius: 3, fontWeight: 700 }}>
          {toastNotice}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default CustomerDashboard;
