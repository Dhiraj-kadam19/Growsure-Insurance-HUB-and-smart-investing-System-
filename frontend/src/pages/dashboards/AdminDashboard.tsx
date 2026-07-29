import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, LinearProgress, Divider } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, BarElement, Filler 
} from 'chart.js';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BarChartIcon from '@mui/icons-material/BarChart';

import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, Filler);

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [funds, setFunds] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [metRes, revRes, fundRes] = await Promise.all([
          api.get('/api/admin/metrics'),
          api.get('/api/admin/analytics/revenue'),
          api.get('/api/admin/analytics/funds')
        ]);
        setMetrics(metRes.data);
        setRevenue(revRes.data);
        setFunds(fundRes.data);
      } catch (err) {
        console.error('Error fetching admin report', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

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
        Consolidated platform metrics, IRDAI compliance controls, fund marketplace volumes, and platform commission margins.
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
    </Box>
  );
};

export default AdminDashboard;
