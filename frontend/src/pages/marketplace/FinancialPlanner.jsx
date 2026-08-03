import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, Button, Grid, 
  FormControl, InputLabel, Select, MenuItem, Divider, LinearProgress, Chip, Slider 
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShieldIcon from '@mui/icons-material/Shield';
import SavingsIcon from '@mui/icons-material/Savings';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RequestPageIcon from '@mui/icons-material/RequestPage';

import api from '../../services/api';

const GOAL_PRESETS = [
  'Retirement at 60 & Home Purchase',
  'Wealth Building & Financial Freedom',
  'Higher Education Fund for Children',
  'World Travel & Emergency Buffer'
];

const FinancialPlanner = () => {
  const [age, setAge] = useState(26);
  const [income, setIncome] = useState(800000);
  const [riskAppetite, setRiskAppetite] = useState('HIGH');
  const [goals, setGoals] = useState('Retirement at 60 & Home Purchase');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPlan(null);

    try {
      const response = await api.post('/api/ai/financial-plan', {
        age,
        income,
        riskAppetite,
        goals
      });
      const parsedData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      setPlan(parsedData);
    } catch (err) {
      console.error(err);
      alert('Failed to generate financial plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Header Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          🔮 <span className="gradient-text">AI Wealth & Financial Advisory</span>
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generative wealth modeling engine to calculate insurance safety nets, SIP asset allocations, tax deductions, and projected wealth corpus at retirement.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        
        {/* Left Side Input Parameters Form */}
        <Grid item xs={12} lg={4}>
          <Card className="glass-card">
            <CardContent sx={{ p: 3.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Planner Input Parameters</Typography>
              <form onSubmit={handleGeneratePlan}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">Current Age: {age} Years</Typography>
                    <Slider 
                      value={age} 
                      min={18} 
                      max={65} 
                      onChange={(_, val) => setAge(val)}
                      color="primary"
                    />
                  </Box>

                  <TextField 
                    label="Annual Gross Salary Income (₹)" 
                    type="number" 
                    value={income} 
                    onChange={(e) => setIncome(Number(e.target.value))} 
                    required 
                    fullWidth 
                  />

                  <FormControl fullWidth>
                    <InputLabel id="risk-select-label">Risk Tolerance & Strategy</InputLabel>
                    <Select
                      labelId="risk-select-label"
                      value={riskAppetite}
                      label="Risk Tolerance & Strategy"
                      onChange={(e) => setRiskAppetite(e.target.value)}
                    >
                      <MenuItem value="LOW">Low Preservation (Capital Protection)</MenuItem>
                      <MenuItem value="MEDIUM">Medium Balanced (Growth & Stability)</MenuItem>
                      <MenuItem value="HIGH">High Aggressive (High CAGR Small Cap)</MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Select Primary Financial Goal:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {GOAL_PRESETS.map((preset) => (
                        <Chip
                          key={preset}
                          label={preset}
                          size="small"
                          onClick={() => setGoals(preset)}
                          color={goals === preset ? "primary" : "default"}
                          variant={goals === preset ? "filled" : "outlined"}
                          sx={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <TextField 
                    label="Custom Target Description" 
                    multiline
                    rows={2}
                    value={goals} 
                    onChange={(e) => setGoals(e.target.value)} 
                    required 
                    fullWidth 
                  />

                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    disabled={loading}
                    startIcon={<AutoAwesomeIcon />}
                    sx={{ py: 1.5, mt: 1, fontWeight: 800 }}
                  >
                    {loading ? 'Synthesizing Wealth Plan...' : 'Generate AI Wealth Plan'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side Generated Wealth Roadmap */}
        <Grid item xs={12} lg={8}>
          {loading && (
            <Card className="glass-card" sx={{ p: 6, textAlign: 'center' }}>
              <AutoAwesomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, animation: 'pulse 1.5s infinite' }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Synthesizing Compound Wealth Projections...</Typography>
              <LinearProgress color="primary" sx={{ height: 6, borderRadius: 3 }} />
            </Card>
          )}

          {!loading && !plan && (
            <Card className="glass-card" sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.15)' }}>
              <AutoAwesomeIcon sx={{ fontSize: 54, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Build Your Financial Roadmap</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>
                Adjust your age, salary, and risk profile on the left to calculate life insurance safety cover, monthly SIP allocation, tax waivers, and compound wealth target at age 60.
              </Typography>
            </Card>
          )}

          {plan && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Financial Dashboard Summary Grid */}
              <Grid container spacing={3}>
                
                {/* Term Life Cover */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card className="glass-card" sx={{ borderLeft: '4px solid #3b82f6' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ShieldIcon color="info" />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>LIFE TERM COVER</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#60a5fa' }}>
                        ₹{plan.insuranceCoverageAmount ? plan.insuranceCoverageAmount.toLocaleString('en-IN') : '0'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">12x Income Protection</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Monthly SIP */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card className="glass-card" sx={{ borderLeft: '4px solid #10b981' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <SavingsIcon sx={{ color: '#10b981' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>MONTHLY SIP</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#34d399' }}>
                        ₹{plan.monthlySipAmount ? plan.monthlySipAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Suggested Monthly Target</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Emergency Buffer */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card className="glass-card" sx={{ borderLeft: '4px solid #f59e0b' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <HealthAndSafetyIcon sx={{ color: '#f59e0b' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>EMERGENCY FUND</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#fbbf24' }}>
                        ₹{plan.emergencyFundAmount ? plan.emergencyFundAmount.toLocaleString('en-IN') : '0'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Liquid 6-Month Reserve</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Projected Corpus at 60 */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card className="glass-card" sx={{ borderLeft: '4px solid #8b5cf6' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TrendingUpIcon sx={{ color: '#a78bfa' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>CORPUS AT AGE 60</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#c084fc' }}>
                        ₹{plan.projectedCorpusAt60 ? (plan.projectedCorpusAt60 / 10000000).toFixed(2) + ' Cr' : '0'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">At 15% Estimated CAGR</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Asset Allocation Breakdown Card */}
              <Card className="glass-card" sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceWalletIcon color="primary" /> Recommended Portfolio Asset Breakdown
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>High CAGR Small Cap Equity</Typography>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 800 }}>{plan.equitySmallCap || 40}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={plan.equitySmallCap || 40} color="primary" sx={{ height: 8, borderRadius: 4 }} />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Mid Cap Growth Opportunities</Typography>
                        <Typography variant="body2" color="secondary" sx={{ fontWeight: 800 }}>{plan.equityMidCap || 30}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={plan.equityMidCap || 30} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Bluechip Large Cap Stability</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#38bdf8' }}>{plan.equityLargeCap || 15}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={plan.equityLargeCap || 15} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(56, 189, 248, 0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#38bdf8' } }} />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>ELSS Tax Saving Funds (Sec 80C)</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#4ade80' }}>{plan.elssTaxSaving || 10}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={plan.elssTaxSaving || 10} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(74, 222, 128, 0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#4ade80' } }} />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Debt & Sovereign Reserves</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#fbbf24' }}>{plan.debtGovernment || 5}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={plan.debtGovernment || 5} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(251, 191, 36, 0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#fbbf24' } }} />
                    </Box>

                    <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.2)', mt: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <RequestPageIcon sx={{ fontSize: 16 }} /> TAX WAIVER SUMMARY
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                        Deduct up to <strong>₹1.5 Lakhs</strong> under Sec 80C + <strong>₹25,000</strong> under Sec 80D annually.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>

              {/* Rationale and Strategy Explanation */}
              <Card className="glass-card" sx={{ p: 4, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon /> Strategy Rationale & Growth Blueprint
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
                  {plan.rationale}
                </Typography>
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon color="primary" /> Asset Allocation Guide
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {plan.retirementSavingsPlan}
                </Typography>
              </Card>

            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialPlanner;
