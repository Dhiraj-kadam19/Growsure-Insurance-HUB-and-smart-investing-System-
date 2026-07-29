import React, { useEffect, useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, Button, Grid, 
  FormControl, InputLabel, Select, MenuItem, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCardIcon from '@mui/icons-material/AddCard';

import api from '../../services/api';

const PolicyEditor: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Fields State
  const [policyName, setPolicyName] = useState('');
  const [category, setCategory] = useState('HEALTH');
  const [coverageAmount, setCoverageAmount] = useState<number>(500000);
  const [premiumAmount, setPremiumAmount] = useState<number>(8000);
  const [benefits, setBenefits] = useState('["Cashless hospitalization", "ICU charge coverage"]');
  const [exclusions, setExclusions] = useState('["Cosmetic surgery"]');
  const [waitingPeriod, setWaitingPeriod] = useState<number>(24);
  const [settlementRatio, setSettlementRatio] = useState<number>(97.5);

  const fetchPolicies = async () => {
    try {
      const response = await api.get('/api/policies/insurer');
      setPolicies(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      policyName,
      category,
      coverageAmount,
      premiumAmount,
      benefits,
      exclusions,
      waitingPeriodMonths: waitingPeriod,
      claimSettlementRatio: settlementRatio
    };

    try {
      if (editingId) {
        await api.put(`/api/policies/${editingId}`, payload);
        alert('Policy updated successfully.');
      } else {
        await api.post('/api/policies', payload);
        alert('Policy added to marketplace catalog.');
      }
      // Reset form
      setEditingId(null);
      setPolicyName('');
      setBenefits('["Cashless hospitalization", "ICU charge coverage"]');
      setExclusions('["Cosmetic surgery"]');
      // Refresh list
      fetchPolicies();
    } catch (err) {
      console.error(err);
      alert('Failed to save policy. Ensure your profile is approved.');
    }
  };

  const handleStartEdit = (policy: any) => {
    setEditingId(policy.id);
    setPolicyName(policy.policyName);
    setCategory(policy.category);
    setCoverageAmount(policy.coverageAmount);
    setPremiumAmount(policy.premiumAmount);
    setBenefits(policy.benefits);
    setExclusions(policy.exclusions);
    setWaitingPeriod(policy.waitingPeriodMonths);
    setSettlementRatio(policy.claimSettlementRatio);
  };

  const handleDeletePolicy = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate this policy?')) return;
    try {
      await api.delete(`/api/policies/${id}`);
      alert('Policy deactivated.');
      fetchPolicies();
    } catch (err) {
      console.error(err);
      alert('Deactivation failed.');
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit' }}>
        🗃️ Manage Insurance Catalog
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        List new policies, adjust premium calculations, update exclusions lists, and deactivate legacy covers.
      </Typography>

      <Grid container spacing={4}>
        {/* Left: Add/Edit Policy form */}
        <Grid item xs={12} lg={4}>
          <Card className="glass-card" sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddCardIcon color="primary" /> {editingId ? 'Edit Cover Properties' : 'List a New Cover'}
              </Typography>
              <form onSubmit={handleSavePolicy}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField 
                    label="Policy Name" 
                    value={policyName} 
                    onChange={(e) => setPolicyName(e.target.value)} 
                    required 
                    fullWidth 
                  />
                  
                  <FormControl fullWidth>
                    <InputLabel id="edit-category-label">Category</InputLabel>
                    <Select
                      labelId="edit-category-label"
                      value={category}
                      label="Category"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="HEALTH">Health Insurance</MenuItem>
                      <MenuItem value="LIFE">Life Term Insurance</MenuItem>
                      <MenuItem value="MOTOR">Car/Motor Insurance</MenuItem>
                      <MenuItem value="TRAVEL">Travel Insurance</MenuItem>
                      <MenuItem value="PROPERTY">Property & Home</MenuItem>
                      <MenuItem value="CYBER">Cyber Security</MenuItem>
                      <MenuItem value="AGRICULTURE">Agriculture & Crop</MenuItem>
                      <MenuItem value="BUSINESS">Business & Commercial</MenuItem>
                    </Select>
                  </FormControl>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField 
                        label="Sum Insured (₹)" 
                        type="number" 
                        value={coverageAmount} 
                        onChange={(e) => setCoverageAmount(Number(e.target.value))} 
                        required 
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        label="Annual Premium (₹)" 
                        type="number" 
                        value={premiumAmount} 
                        onChange={(e) => setPremiumAmount(Number(e.target.value))} 
                        required 
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField 
                        label="Waiting Months" 
                        type="number" 
                        value={waitingPeriod} 
                        onChange={(e) => setWaitingPeriod(Number(e.target.value))} 
                        required 
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        label="Settlement Ratio (%)" 
                        type="number" 
                        value={settlementRatio} 
                        onChange={(e) => setSettlementRatio(Number(e.target.value))} 
                        required 
                      />
                    </Grid>
                  </Grid>

                  <TextField 
                    label="Benefits list (JSON format)" 
                    multiline
                    rows={2}
                    value={benefits} 
                    onChange={(e) => setBenefits(e.target.value)} 
                    required 
                    fullWidth 
                  />

                  <TextField 
                    label="Exclusions list (JSON format)" 
                    multiline
                    rows={2}
                    value={exclusions} 
                    onChange={(e) => setExclusions(e.target.value)} 
                    required 
                    fullWidth 
                  />

                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    {editingId && (
                      <Button variant="outlined" color="primary" fullWidth onClick={() => {
                        setEditingId(null);
                        setPolicyName('');
                      }}>
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" variant="contained" color="secondary" fullWidth>
                      {editingId ? 'Save Changes' : 'Publish Policy'}
                    </Button>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Listed policies table */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Your Published Insurance Coverages
          </Typography>
          <TableContainer component={Paper} className="glass-card" sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Cover Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Sum Insured</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Premium</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} align="center">Loading policies...</TableCell></TableRow>
                ) : policies.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">No active policies found.</TableCell></TableRow>
                ) : (
                  policies.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{p.policyName}</TableCell>
                      <TableCell><Chip label={p.category} size="small" color="primary" /></TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>₹{p.coverageAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>₹{p.premiumAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Chip 
                          label={p.isActive ? 'Active' : 'Inactive'} 
                          color={p.isActive ? 'success' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton color="secondary" onClick={() => handleStartEdit(p)} sx={{ mr: 1 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeletePolicy(p.id)} disabled={!p.isActive}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
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

export default PolicyEditor;
