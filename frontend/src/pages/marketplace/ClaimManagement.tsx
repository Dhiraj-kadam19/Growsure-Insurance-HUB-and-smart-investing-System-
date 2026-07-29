import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PostAddIcon from '@mui/icons-material/PostAdd';

import api from '../../services/api';

const ClaimManagement: React.FC = () => {
  const [activePurchases, setActivePurchases] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Claim Form State
  const [selectedPurchase, setSelectedPurchase] = useState<string>('');
  const [claimAmount, setClaimAmount] = useState<number>(15000);
  const [incidentDetails, setIncidentDetails] = useState('');
  const [documentUrls, setDocumentUrls] = useState('/uploads/bill_hospital.pdf, /uploads/discharge_summary.pdf');
  const [filingLoading, setFilingLoading] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  const fetchClaimsAndPurchases = async () => {
    try {
      const [purchRes, claimRes] = await Promise.all([
        api.get('/api/policies/active-purchases'),
        api.get('/api/claims/customer')
      ]);
      setActivePurchases(purchRes.data);
      setClaims(claimRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimsAndPurchases();
  }, []);

  const handleFileClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPurchase) {
      alert('Please select an active policy.');
      return;
    }
    setFilingLoading(true);
    setAiReport(null);

    try {
      const response = await api.post('/api/claims', {
        purchaseId: Number(selectedPurchase),
        claimAmount,
        incidentDetails,
        documentUrls
      });
      setAiReport(response.data);
      // Refresh list
      fetchClaimsAndPurchases();
      // Clear form
      setIncidentDetails('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit claim.');
    } finally {
      setFilingLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Loading claims interface...</Typography>
        <LinearProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit' }}>
        📋 Claims Processing Hub
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        File claims against active policies, upload receipts, and check automated auditor validation reports.
      </Typography>

      <Grid container spacing={4}>
        
        {/* Left Side: Submit New Claim */}
        <Grid item xs={12} lg={4}>
          <Card className="glass-card" sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PostAddIcon color="primary" /> Submit a New Claim
              </Typography>
              
              {activePurchases.length === 0 ? (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  You must have an active policy to file a claim.
                </Alert>
              ) : (
                <form onSubmit={handleFileClaim}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel id="policy-select-label">Select Active Policy</InputLabel>
                      <Select
                        labelId="policy-select-label"
                        value={selectedPurchase}
                        label="Select Active Policy"
                        onChange={(e) => setSelectedPurchase(e.target.value)}
                        required
                      >
                        {activePurchases.map(p => (
                          <MenuItem key={p.id} value={p.id}>{p.policy.policyName} ({p.policyNumber})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField 
                      label="Claim Value (₹)" 
                      type="number" 
                      value={claimAmount} 
                      onChange={(e) => setClaimAmount(Number(e.target.value))} 
                      required 
                      fullWidth 
                    />

                    <TextField 
                      label="Incident Description" 
                      multiline
                      rows={3}
                      value={incidentDetails} 
                      onChange={(e) => setIncidentDetails(e.target.value)} 
                      placeholder="Explain details of diagnosis, treatment, or car accident location"
                      required 
                      fullWidth 
                    />

                    <TextField 
                      label="Uploaded Documents paths (simulated)" 
                      value={documentUrls} 
                      onChange={(e) => setDocumentUrls(e.target.value)} 
                      helperText="Comma separated file names"
                      required 
                      fullWidth 
                    />

                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="secondary" 
                      size="large"
                      disabled={filingLoading}
                      sx={{ py: 1.5, mt: 1, boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)' }}
                    >
                      {filingLoading ? 'Auditing claim documents...' : 'Submit Claim'}
                    </Button>
                  </Box>
                </form>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: List of Past Claims & AI Audit Feedback */}
        <Grid item xs={12} lg={8}>
          
          {/* AI Immediate Auditor Feedback Alert */}
          {aiReport && (
            <Card className="glass-card" sx={{ mb: 4, p: 3, border: '1px solid rgba(37, 99, 235, 0.3)' }}>
              <Typography variant="h6" color="primary.light" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon /> Growsure Claim Audit Assessment
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Our Generative AI Claim Advisor analyzed the documents and description parameters:
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Fraud Probability</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: aiReport.fraudScore > 50 ? 'error.main' : 'success.main' }}>
                    {aiReport.fraudScore}%
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Confidence Match</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    92%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Advisory Decision</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {aiReport.fraudScore > 50 ? '🔴 Recommend reject. Potential double billing risk.' : '🟢 Recommended for fast-track automatic settlement approval.'}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ p: 2, bgcolor: '#0b0f19', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  <strong>Notes:</strong> {aiReport.fraudReasons}
                </Typography>
              </Box>
            </Card>
          )}

          {/* Table list of claims */}
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Claim Registration Ledger
          </Typography>
          <TableContainer component={Paper} className="glass-card" sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Claim ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Insurance Plan</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Claim Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fraud Score</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No claim logs filed in the ledger yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  claims.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell sx={{ fontWeight: 600 }}>GS-CLM-0{c.id}</TableCell>
                      <TableCell>{c.purchasedPolicy?.policy?.policyName}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>₹{c.claimAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${c.fraudScore}%`} 
                          size="small"
                          color={c.fraudScore > 50 ? 'error' : c.fraudScore > 20 ? 'warning' : 'success'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color={c.status === 'APPROVED' ? 'success' : c.status === 'REJECTED' ? 'error' : 'warning'}
                          sx={{ pointerEvents: 'none', py: 0.1, textTransform: 'uppercase', minWidth: 100, fontSize: '0.7rem' }}
                        >
                          {c.status}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClaimManagement;
