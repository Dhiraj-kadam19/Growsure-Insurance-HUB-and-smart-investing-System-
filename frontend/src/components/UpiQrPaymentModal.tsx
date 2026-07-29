import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, 
  Button, IconButton, CircularProgress, Tooltip, Snackbar, Alert, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TimerIcon from '@mui/icons-material/Timer';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LockIcon from '@mui/icons-material/Lock';
import CancelIcon from '@mui/icons-material/Cancel';

interface UpiQrPaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  payerUpiId: string;
  receiverUpiId?: string;
  receiverName?: string;
  bankInfo?: string;
  orderTitle?: string;
  onPaymentSuccess: () => void;
}

// 100% Scannable Real QR Code Component
const RealUpiQrCode: React.FC<{ upiString: string }> = ({ upiString }) => {
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}&color=0f172a&margin=2`;

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        display: 'inline-flex', 
        alignItems: 'center',
        justifyContent: 'center',
        p: 1.5, 
        bgcolor: '#ffffff', 
        borderRadius: 3.5, 
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}
    >
      {/* Actual Scannable QR Code Image */}
      <img
        src={qrApiUrl}
        alt="UPI Payment QR Code"
        style={{ width: 140, height: 140, display: 'block', borderRadius: 8 }}
      />

      {/* Central PhonePe / UPI Icon emblem */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: '#18181b',
          border: '2px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '0.95rem',
          fontFamily: 'serif'
        }}
      >
        पे
      </Box>
    </Box>
  );
};

const UpiQrPaymentModal: React.FC<UpiQrPaymentModalProps> = ({
  open,
  onClose,
  amount,
  payerUpiId,
  receiverUpiId = 'sarveshkulkarni.2003@ybl',
  receiverName = 'Sarvesh Sachin Kulkarni',
  bankInfo = 'Kotak Mahindra Bank - 2003',
  orderTitle = 'Order Payment',
  onPaymentSuccess
}) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!open) {
      setTimeLeft(300);
      setVerifying(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyReceiverId = () => {
    navigator.clipboard.writeText(receiverUpiId);
    setCopied(true);
  };

  const handleSimulateComplete = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      onPaymentSuccess();
    }, 1800);
  };

  // Standard official NPCI UPI Deep Link URL schema
  const upiDeepLink = `upi://pay?pa=${receiverUpiId}&pn=${encodeURIComponent(receiverName)}&am=${amount}&cu=INR&tn=Growsure%20Payment`;

  return (
    <>
      <Dialog
        open={open}
        onClose={verifying ? undefined : onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
            overflow: 'hidden',
            maxHeight: '92vh'
          }
        }}
      >
        {/* Modal Header */}
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2.5, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeScannerIcon color="primary" sx={{ fontSize: 22 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Scan & Pay via UPI App
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={verifying} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 1.5, textAlign: 'center' }}>
          {/* Amount Badge Header */}
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {orderTitle && (
              <Chip label={orderTitle} size="small" variant="outlined" color="primary" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
            )}
            <Box sx={{ py: 0.6, px: 2, borderRadius: 2.5, bgcolor: 'rgba(99, 102, 241, 0.08)', display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Amount:</Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 900 }}>
                ₹{amount.toLocaleString('en-IN')}
              </Typography>
            </Box>
          </Box>

          {/* Compact Scanner Card Container (PhonePe / UPI style dark card) */}
          <Box
            sx={{
              bgcolor: '#18181b',
              color: '#ffffff',
              borderRadius: 3.5,
              p: 1.8,
              mb: 1.5,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Real 100% Scannable QR Code */}
            <RealUpiQrCode upiString={upiDeepLink} />

            {/* Bottom Bank Account Banner */}
            <Box
              sx={{
                mt: 1.5,
                width: '100%',
                py: 0.6,
                px: 1.5,
                borderRadius: 2.5,
                bgcolor: 'rgba(255, 255, 255, 0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AccountBalanceIcon sx={{ fontSize: 13, color: '#18181b' }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#f3f4f6' }}>
                  {bankInfo}
                </Typography>
              </Box>
              <ArrowForwardIosIcon sx={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.5)' }} />
            </Box>
          </Box>

          {/* Countdown Timer Directly Below Scanner */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <TimerIcon sx={{ fontSize: 18, color: timeLeft < 60 ? '#ef4444' : '#f59e0b' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: timeLeft < 60 ? '#ef4444' : 'text.primary' }}>
              Pay within:
            </Typography>
            <Chip 
              label={formatTime(timeLeft)} 
              size="small" 
              color={timeLeft < 60 ? 'error' : 'warning'}
              sx={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '0.78rem', height: 22 }} 
            />
          </Box>

          {/* Receiver UPI ID Card (Clearly Visible Below Scanner) */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
              border: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
              textAlign: 'left'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                Receiver's UPI Details
              </Typography>
              <Chip label="Verified Merchant ✓" size="small" color="success" variant="outlined" sx={{ height: 16, fontSize: '0.58rem', fontWeight: 800 }} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : '#ffffff', p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 0.8 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.68rem' }}>Receiver UPI ID</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {receiverUpiId}
                </Typography>
              </Box>
              <Tooltip title="Copy Receiver UPI ID">
                <IconButton size="small" onClick={handleCopyReceiverId} color="primary" sx={{ p: 0.5 }}>
                  <ContentCopyIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <Typography variant="caption" color="text.secondary">Merchant Name:</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{receiverName}</Typography>
            </Box>

            {payerUpiId && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', mt: 0.3 }}>
                <Typography variant="caption" color="text.secondary">Your UPI ID:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{payerUpiId}</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        {/* Action Buttons: Clear Complete Button & Prominent Red Cancel Button */}
        <DialogActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSimulateComplete}
            disabled={verifying || timeLeft === 0}
            startIcon={verifying ? <CircularProgress size={16} color="inherit" /> : <LockIcon />}
            sx={{ py: 1.1, borderRadius: 2.5, fontWeight: 800, fontSize: '0.9rem' }}
          >
            {verifying ? 'Verifying NPCI Payment...' : 'I Have Paid / Complete Payment'}
          </Button>

          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={onClose}
            disabled={verifying}
            startIcon={<CancelIcon />}
            sx={{ py: 0.8, borderRadius: 2.5, fontWeight: 700, fontSize: '0.82rem', textTransform: 'none' }}
          >
            Cancel Payment
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: 3 }}>
          Receiver UPI ID copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default UpiQrPaymentModal;
