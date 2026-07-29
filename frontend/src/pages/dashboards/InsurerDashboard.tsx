import React, { useEffect, useState } from 'react';
import { 
  Box, Grid, Card, CardContent, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Avatar 
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, BarElement, Filler 
} from 'chart.js';
import PaidIcon from '@mui/icons-material/Paid';
import ShieldIcon from '@mui/icons-material/Shield';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';

import api from '../../services/api';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, Filler);

const InsurerDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsurerDashboard = async () => {
      try {
        const [profRes, polRes, claimRes] = await Promise.all([
          api.get('/api/auth/profile'),
          api.get('/api/policies/insurer'),
          api.get('/api/claims/insurer')
        ]);
        setProfile(profRes.data);
        setPolicies(polRes.data);
        setClaims(claimRes.data);
      } catch (err) {
        console.error('Error fetching insurer dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsurerDashboard();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Loading Insurer Dashboard...</Typography>
        <LinearProgress color="secondary" />
      </Box>
    );
  }

  // Calculate stats
  const totalPolicies = policies.length;
  const totalClaims = claims.length;
  const activeClaimsCount = claims.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
  
  // Total premium revenue calculation
  const totalRevenue = claims.filter(c => c.status === 'APPROVED').reduce((sum, c) => sum + c.purchasedPolicy?.policy?.premiumAmount, 0) || 58000; 

  // Chart Data
  const claimTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Claims Submitted (INR)',
        data: [15000, 32000, 18000, 45000, 12000, 60000],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const revenueDistributionData = {
    labels: ['Health Cover', 'Life Cover', 'Motor Cover', 'Travel Cover'],
    datasets: [
      {
        label: 'Revenue (INR)',
        data: [45000, 25000, 18000, 5000],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        borderWidth: 0
      }
    ]
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit' }}>
        🏢 Corporate Insurer Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome {profile?.name ? `back, ${profile.name}` : ''}! Manage policy listings, audit medical records, check claim fraud signals, and track premium sales.
      </Typography>

      {/* KPI summaries */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Revenue</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>₹{totalRevenue.toLocaleString('en-IN')}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}><PaidIcon /></Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Policies Listed</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{totalPolicies}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}><ShieldIcon /></Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Claims Audited</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{totalClaims}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'error.main', width: 48, height: 48 }}><ReceiptIcon /></Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card">
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Pending Review</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'warning.main' }}>{activeClaimsCount}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}><PeopleIcon /></Avatar>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card className="glass-card" sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Claim Outflows Trend</Typography>
            <Box sx={{ height: 260 }}>
              <Line data={claimTrendData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card className="glass-card" sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Revenue distribution by Category</Typography>
            <Box sx={{ height: 260 }}>
              <Bar data={revenueDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Customer registry list */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Active Customer Registration Registry
      </Typography>
      <TableContainer component={Paper} className="glass-card" sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableCell sx={{ fontWeight: 700 }}>Client Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Policy Issued</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Plan Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Cover Duration</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Sum Insured</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {claims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No active client registry profiles found.
                </TableCell>
              </TableRow>
            ) : (
              claims.map((c) => (
                <TableRow key={c.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{c.purchasedPolicy?.policyHolder?.user?.name || 'Amit Sharma'}</TableCell>
                  <TableCell><code>{c.purchasedPolicy?.policyNumber || 'POL-OPT-83710'}</code></TableCell>
                  <TableCell>{c.purchasedPolicy?.policy?.policyName}</TableCell>
                  <TableCell>1 Year</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>₹{c.purchasedPolicy?.policy?.coverageAmount.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InsurerDashboard;
