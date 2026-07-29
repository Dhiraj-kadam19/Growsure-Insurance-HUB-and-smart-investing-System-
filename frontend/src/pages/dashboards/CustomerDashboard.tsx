import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Button, LinearProgress, Divider, List, ListItem, ListItemText } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import api from '../../services/api';

const CustomerDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [purchasedPolicies, setPurchasedPolicies] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        
        // Parse raw string suggestions
        if (aiRes.data && aiRes.data.length > 0) {
          const suggestions = aiRes.data.map((item: any) => {
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
              Welcome back, {profile?.user?.name || 'User'}!
            </Typography>
            <Typography variant="body1" sx={(theme) => ({
              color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#334155'
            })}>
              Keep your financial goals on track. Check your active plans, invest in custom tax-saving funds, and generate AI insights.
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
                  {purchasedPolicies.map((purch: any) => (
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
    </Box>
  );
};

export default CustomerDashboard;
