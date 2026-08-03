import React, { useEffect, useState } from 'react';
import { 
  Box, Grid, Card, CardContent, Typography, LinearProgress, Divider,
  Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, Alert, Snackbar, Paper
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, BarElement, Filler 
} from 'chart.js';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, Filler);

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [funds, setFunds] = useState<any>(null);
  const [pendingUtrs, setPendingUtrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchAdminStats = async () => {
    try {
      const [metRes, revRes, fundRes, utrRes] = await Promise.all([
        api.get('/api/admin/metrics'),
        api.get('/api/admin/analytics/revenue'),
        api.get('/api/admin/analytics/funds'),
        api.get('/api/admin/utr/pending')
      ]);
      setMetrics(metRes.data);
      setRevenue(revRes.data);
      setFunds(fundRes.data);
      setPendingUtrs(utrRes.data || []);
    } catch (err) {
      console.error('Error fetching admin report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleApproveUtr = async (id: number) => {
    setActionLoading(id);
    try {
      await api.put(`/api/admin/utr/${id}/approve`);
      setActionSuccess(`Payment UTR #${id} approved successfully! User policy/investment activated.`);
      fetchAdminStats();
    } catch (err: any) {
      console.error('Error approving UTR', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUtr = async (id: number) => {
    setActionLoading(id);
    try {
      await api.put(`/api/admin/utr/${id}/reject`);
      setActionSuccess(`Payment UTR #${id} rejected.`);
      fetchAdminStats();
    } catch (err: any) {
      console.error('Error rejecting UTR', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Loading Platform Analytics...</Typography>
        <LinearProgress color="secondary" />
      </Box>
    );
  }

  // Chart configuration
  const revenueChartData = {
    labels: revenue?.monthlyRevenueLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Gross Premium Revenue (INR)',
        data: revenue?.monthlyRevenueValues || [45000, 52000, 61000, 58000, 72000, 85000],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  const claimsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Approved Claims Payout (INR)',
        data: revenue?.claimsTrendValues || [12000, 18000, 24000, 15000, 31000, 42000],
        backgroundColor: '#ef4444',
        borderWidth: 0
      }
    ]
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit' }}>
        🔑 Platform Admin Control
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Consolidated platform metrics, UTR payment verification approvals, fund marketplace volumes, and platform commission margins.
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Platform Users</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{metrics?.totalUsers}</Typography>
              </Box>
              <PeopleIcon color="primary" sx={{ fontSize: 36 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Claims Processed</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{metrics?.totalClaims}</Typography>
              </Box>
              <ReceiptLongIcon color="error" sx={{ fontSize: 36 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Gross Premium Sales</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#10b981' }}>
                  ₹{metrics?.totalRevenue?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Typography>
              </Box>
              <AccountBalanceIcon color="secondary" sx={{ fontSize: 36 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">AUM in Investments</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  ₹{metrics?.totalInvestments?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Typography>
              </Box>
              <BarChartIcon sx={{ fontSize: 36, color: '#f59e0b' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending UTR Verification Table Section */}
      <Card className="glass-card" sx={{ mb: 4, p: 2 }}>
        <CardContent sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AccountBalanceWalletIcon color="secondary" sx={{ fontSize: 30 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Pending UTR Payment Approvals ({pendingUtrs.length})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  User submitted 12-digit UPI UTR Codes requiring Admin acceptance to activate policies/investments.
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={pendingUtrs.length > 0 ? `${pendingUtrs.length} Action Required` : 'All Verified ✓'} 
              color={pendingUtrs.length > 0 ? 'warning' : 'success'} 
              sx={{ fontWeight: 800 }} 
            />
          </Box>

          {pendingUtrs.length === 0 ? (
            <Alert severity="success" variant="outlined" sx={{ borderRadius: 3, fontWeight: 700 }}>
              No pending UTR payment approvals. All user UPI transactions are up to date!
            </Alert>
          ) : (
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'transparent' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>User Name & Email</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>12-Digit UTR Code</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Amount (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Payment Type</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, textAlign: 'right' }}>Admin Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingUtrs.map((u: any) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{u.userName}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.userEmail}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={u.utrNumber || 'N/A'} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                          sx={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: 0.8 }} 
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#10b981' }}>
                        ₹{u.amount?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={u.paymentType?.replace('_', ' ')} 
                          size="small" 
                          variant="filled" 
                          color="secondary"
                          sx={{ fontSize: '0.65rem', fontWeight: 800 }} 
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                        {new Date(u.transactionDate).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleApproveUtr(u.id)}
                            disabled={actionLoading === u.id}
                            startIcon={<CheckCircleIcon />}
                            sx={{ fontWeight: 800, borderRadius: 2 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleRejectUtr(u.id)}
                            disabled={actionLoading === u.id}
                            startIcon={<CancelIcon />}
                            sx={{ fontWeight: 800, borderRadius: 2 }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Revenue breakdown card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={4}>
          <Card className="glass-card" sx={{ height: '100%', p: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Revenue Analytics Margins</Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Insurance Premiums</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{revenue?.policyRevenue?.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Mutual Funds AUM</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{revenue?.fundRevenue?.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Claim Outflow Payouts</Typography>
                <Typography variant="body2" sx={{ color: 'error.light', fontWeight: 600 }}>-₹{revenue?.claimExpenses?.toLocaleString('en-IN')}</Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Commission Earned (10%/1%)</Typography>
                <Typography variant="body1" color="secondary.main" sx={{ fontWeight: 800 }}>
                  ₹{revenue?.commissionEarned?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Net Profit margin</Typography>
                <Typography variant="body1" color="success.main" sx={{ fontWeight: 800 }}>
                  ₹{revenue?.netProfit?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6} lg={4}>
          <Card className="glass-card" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Monthly Revenue Curve</Typography>
            <Box sx={{ height: 200 }}>
              <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card className="glass-card" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Approved Claims Curve</Typography>
            <Box sx={{ height: 200 }}>
              <Bar data={claimsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Funds performance list */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Best Performing Marketplace Funds (AUM & Returns)
      </Typography>
      <Grid container spacing={3}>
        {funds?.bestPerformingFunds?.map((f: any) => (
          <Grid item xs={12} md={4} key={f.id}>
            <Card className="glass-card" sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{f.fundName}</Typography>
                <Typography variant="caption" color="text.secondary">Category: {f.category?.replace('_', ' ')}</Typography>
                <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Returns CAGR:</Typography>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 700 }}>+{f.cagr}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Total Asset Size (AUM):</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{f.aumCrores} Cr</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar 
        open={Boolean(actionSuccess)} 
        autoHideDuration={3000} 
        onClose={() => setActionSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 3 }}>
          {actionSuccess}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
