import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Grid, Divider, Alert } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import api from '../../services/api';

const ClaimVerification: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  const fetchClaims = async () => {
    try {
      const response = await api.get('/api/claims/insurer');
      setClaims(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleUpdateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/api/claims/${id}/status?status=${status}`);
      alert(`Claim status updated to: ${status}`);
      setSelectedClaim(null);
      fetchClaims();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit' }}>
        🕵️ claim audit queues
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Evaluate medical files, check AI-generated fraud scores, inspect incident files, and approve claims.
      </Typography>

      <Grid container spacing={4}>
        {/* Left list of claims */}
        <Grid item xs={12} lg={selectedClaim ? 6 : 12}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Audit Request List
          </Typography>
          <TableContainer component={Paper} className="glass-card" sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Claim ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Claim Value</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>AI Risk</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} align="center">Loading audit queues...</TableCell></TableRow>
                ) : claims.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">No active requests found.</TableCell></TableRow>
                ) : (
                  claims.map((c) => (
                    <TableRow 
                      key={c.id} 
                      hover 
                      selected={selectedClaim?.id === c.id}
                      onClick={() => setSelectedClaim(c)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>GS-CLM-0{c.id}</TableCell>
                      <TableCell>{c.purchasedPolicy?.policyHolder?.user?.name || 'Amit Sharma'}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>₹{c.claimAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${c.fraudScore}% Fraud`} 
                          size="small" 
                          color={c.fraudScore > 50 ? 'error' : c.fraudScore > 20 ? 'warning' : 'success'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={c.status} 
                          size="small" 
                          variant="outlined"
                          color={c.status === 'APPROVED' ? 'success' : c.status === 'REJECTED' ? 'error' : 'warning'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Right Audit Details panel */}
        {selectedClaim && (
          <Grid item xs={12} lg={6}>
            <Card className="glass-card" sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Auditing Request Details</Typography>
                  <Button variant="outlined" size="small" onClick={() => setSelectedClaim(null)}>Close Pane</Button>
                </Box>
                <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.08)' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  <Typography variant="body2"><strong>Client:</strong> {selectedClaim.purchasedPolicy?.policyHolder?.user?.name}</Typography>
                  <Typography variant="body2"><strong>Plan:</strong> {selectedClaim.purchasedPolicy?.policy?.policyName}</Typography>
                  <Typography variant="body2"><strong>Incident:</strong> {selectedClaim.incidentDetails}</Typography>
                  <Typography variant="body2"><strong>Documents:</strong> <code>{selectedClaim.documentUrls}</code></Typography>
                  <Typography variant="body2"><strong>Claim amount requested:</strong> <strong style={{ color: '#10b981' }}>₹{selectedClaim.claimAmount.toLocaleString('en-IN')}</strong></Typography>
                </Box>

                {/* AI auditing analysis block */}
                <Box sx={{ p: 3, bgcolor: '#0b0f19', borderRadius: 3, border: '1px solid rgba(37,99,235,0.2)', mb: 4 }}>
                  <Typography variant="subtitle2" color="primary.light" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AutoAwesomeIcon /> Growsure AI Auditing Analysis
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Fraud Probability</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: selectedClaim.fraudScore > 50 ? 'error.main' : 'success.main' }}>
                        {selectedClaim.fraudScore}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Risk Recommendation</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                        {selectedClaim.fraudScore > 50 ? '❌ Reject' : '✅ Safe Auto-Approve'}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', borderLeft: '3px solid #10b981', pl: 1.5, py: 0.5 }}>
                    "{selectedClaim.fraudReasons}"
                  </Typography>
                </Box>

                {selectedClaim.status === 'SUBMITTED' || selectedClaim.status === 'UNDER_REVIEW' ? (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      fullWidth 
                      startIcon={<WarningAmberIcon />}
                      onClick={() => handleUpdateStatus(selectedClaim.id, 'REJECTED')}
                    >
                      Reject Claim
                    </Button>
                    <Button 
                      variant="contained" 
                      color="success" 
                      fullWidth 
                      startIcon={<VerifiedUserIcon />}
                      onClick={() => handleUpdateStatus(selectedClaim.id, 'APPROVED')}
                    >
                      Approve Claim
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    This claim is finalized. Decided status: <strong>{selectedClaim.status}</strong>.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ClaimVerification;
