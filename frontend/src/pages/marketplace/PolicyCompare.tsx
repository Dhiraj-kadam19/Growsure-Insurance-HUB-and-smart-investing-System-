import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { RootState } from '../../store';

const PolicyCompare: React.FC = () => {
  const { compareA, compareB } = useSelector((state: RootState) => state.policy);
  const navigate = useNavigate();

  if (!compareA || !compareB) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
          Please select two policies to compare.
        </Typography>
        <Button variant="contained" color="secondary" onClick={() => navigate('/marketplace/policies')} startIcon={<ArrowBackIcon />}>
          Back to Marketplace
        </Button>
      </Box>
    );
  }

  // Helper to safely parse JSON strings for benefits/exclusions
  const parseList = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : [jsonStr];
    } catch {
      return [jsonStr || 'Not Specified'];
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Button 
        variant="outlined" 
        onClick={() => navigate('/marketplace/policies')} 
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Catalog
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit' }}>
        Compare Insurance Coverages
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Analyze waiting periods, exclusion boundaries, and settlement records to make the right call.
      </Typography>

      <TableContainer component={Paper} className="glass-card" sx={{ mb: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Feature Description</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'secondary.light' }}>{compareA.policyName}</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.light' }}>{compareB.policyName}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Insurer Partner</TableCell>
              <TableCell>{compareA.insurer?.companyName}</TableCell>
              <TableCell>{compareB.insurer?.companyName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell>{compareA.category}</TableCell>
              <TableCell>{compareB.category}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Sum Insured (Coverage)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>₹{compareA.coverageAmount.toLocaleString('en-IN')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>₹{compareB.coverageAmount.toLocaleString('en-IN')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Annual Premium</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>₹{compareA.premiumAmount.toLocaleString('en-IN')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>₹{compareB.premiumAmount.toLocaleString('en-IN')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Waiting Period</TableCell>
              <TableCell>{compareA.waitingPeriodMonths > 0 ? `${compareA.waitingPeriodMonths} Months` : 'None'}</TableCell>
              <TableCell>{compareB.waitingPeriodMonths > 0 ? `${compareB.waitingPeriodMonths} Months` : 'None'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Claim Settlement Ratio</TableCell>
              <TableCell sx={{ color: 'success.light', fontWeight: 600 }}>{compareA.claimSettlementRatio}%</TableCell>
              <TableCell sx={{ color: 'success.light', fontWeight: 600 }}>{compareB.claimSettlementRatio}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, verticalAlign: 'top' }}>Benefits</TableCell>
              <TableCell>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {parseList(compareA.benefits).map((b, i) => <li key={i} style={{ marginBottom: 4 }}>{b}</li>)}
                </ul>
              </TableCell>
              <TableCell>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {parseList(compareB.benefits).map((b, i) => <li key={i} style={{ marginBottom: 4 }}>{b}</li>)}
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, verticalAlign: 'top' }}>Exclusions</TableCell>
              <TableCell>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {parseList(compareA.exclusions).map((e, i) => <li key={i} style={{ marginBottom: 4 }}>{e}</li>)}
                </ul>
              </TableCell>
              <TableCell>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {parseList(compareB.exclusions).map((e, i) => <li key={i} style={{ marginBottom: 4 }}>{e}</li>)}
                </ul>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PolicyCompare;
