import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';

import api from '../../services/api';

const InsurerApprovals = () => {
  const [insurers, setInsurers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingInsurers = async () => {
    try {
      const response = await api.get('/api/admin/insurers/pending');
      setInsurers(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingInsurers();
  }, []);

  const handleApproveStatus = async (id, status) => {
    try {
      await api.put(`/api/admin/insurers/${id}/approve?status=${status}`);
      alert(`Insurer status successfully configured: ${status}`);
      fetchPendingInsurers();
    } catch (err) {
      console.error(err);
      alert('Action failed.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Loading pending insurer requests...</Typography>
        <LinearProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit' }}>
        🛡️ Insurance Partner Approvals
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Audit and authorize new corporate partners (Insurers) applying to list policy coverage contracts on the Growsure marketplace.
      </Typography>

      <TableContainer component={Paper} className="glass-card" sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableCell sx={{ fontWeight: 700 }}>Company Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>IRDAI License Number</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Corporate Address</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contact Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {insurers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No pending corporate insurer requests found.
                </TableCell>
              </TableRow>
            ) : (
              insurers.map((ins) => (
                <TableRow key={ins.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{ins.companyName}</TableCell>
                  <TableCell><code>{ins.licenseNumber}</code></TableCell>
                  <TableCell>{ins.address}</TableCell>
                  <TableCell>{ins.user?.email}</TableCell>
                  <TableCell>
                    <Chip label={ins.status} color="warning" size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small" 
                      startIcon={<BlockIcon />}
                      onClick={() => handleApproveStatus(ins.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small" 
                      startIcon={<VerifiedIcon />}
                      onClick={() => handleApproveStatus(ins.id, 'APPROVED')}
                    >
                      Authorize
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InsurerApprovals;
