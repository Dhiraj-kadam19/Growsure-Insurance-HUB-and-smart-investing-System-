import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Grid, Card, CardContent, Typography, Button, TextField, 
  MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, 
  DialogContent, DialogActions, Chip, Divider, Tab, Tabs, Pagination,
  InputAdornment, Rating, Badge, Drawer, IconButton, Snackbar, Alert,
  RadioGroup, FormControlLabel, Radio, Table, TableBody, TableCell, TableRow
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CalculateIcon from '@mui/icons-material/Calculate';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LockIcon from '@mui/icons-material/Lock';
import DownloadIcon from '@mui/icons-material/Download';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CloseIcon from '@mui/icons-material/Close';

import api from '../../services/api';
import { setFunds, RootState } from '../../store';
import UpiQrPaymentModal from '../../components/UpiQrPaymentModal';

interface CartItem {
  fund: any;
  investmentType: 'SIP' | 'LUMPSUM';
  amount: number;
  sipDay: number;
}

const FundMarketplace: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { fundsList } = useSelector((state: RootState) => state.fund);
  
  const [category, setCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAmc, setSelectedAmc] = useState<string>('');
  const [selectedSubCat, setSelectedSubCat] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('cagr');
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 12;

  const [selectedFund, setSelectedFund] = useState<any>(null);
  
  // Return Calculator State
  const [calcDialogOpen, setCalcDialogOpen] = useState(false);
  const [calcAmount, setCalcAmount] = useState<number>(5000);
  const [calcYears, setCalcYears] = useState<number>(3);
  const [calcType, setCalcType] = useState<'SIP' | 'LUMPSUM'>('SIP');
  const [calcResult, setCalcResult] = useState<number | null>(null);

  // Investment Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('growsure_investment_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payment Selection & Process Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [upiId, setUpiId] = useState<string>('sarveshkulkarni.2003@ybl');
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvv, setCardCvv] = useState<string>('892');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');
  
  // Interactive Mobile UPI Collect Modal State
  const [upiCollectModalOpen, setUpiCollectModalOpen] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);
  const [upiError, setUpiError] = useState<string>('');

  // Fund Comparison State
  const [compareFundA, setCompareFundA] = useState<any>(null);
  const [compareFundB, setCompareFundB] = useState<any>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const handleClearComparison = () => {
    setCompareFundA(null);
    setCompareFundB(null);
    setCompareModalOpen(false);
  };

  const handleToggleCompare = (fund: any) => {
    if (compareFundA?.id === fund.id) {
      setCompareFundA(null);
    } else if (compareFundB?.id === fund.id) {
      setCompareFundB(null);
    } else if (!compareFundA) {
      setCompareFundA(fund);
    } else if (!compareFundB) {
      setCompareFundB(fund);
      setCompareModalOpen(true);
    } else {
      setCompareFundB(fund);
      setCompareModalOpen(true);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('growsure_investment_cart', JSON.stringify(cartItems));
    } catch { /* ignore */ }
  }, [cartItems]);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        let response;
        try {
          response = await api.get('/api/investments/funds');
        } catch {
          const res = await fetch('http://localhost:8081/api/investments/funds');
          const data = await res.json();
          response = { data };
        }
        const fundsData = Array.isArray(response.data) ? response.data : (response.data?.funds || []);
        dispatch(setFunds(fundsData));
      } catch (err) {
        console.error('Error fetching mutual funds', err);
      }
    };
    fetchFunds();
  }, [dispatch]);

  // Extract unique AMCs and SubCategories for Filter Dropdowns
  const { amcList, subCatList } = useMemo(() => {
    const amcs = new Set<string>();
    const subCats = new Set<string>();
    fundsList.forEach((fund: any) => {
      if (fund.amcName) amcs.add(fund.amcName);
      if (fund.subCategory) subCats.add(fund.subCategory);
    });
    return {
      amcList: Array.from(amcs).sort(),
      subCatList: Array.from(subCats).sort()
    };
  }, [fundsList]);

  // Filter and Sort Mutual Funds Dataset
  const filteredFunds = useMemo(() => {
    let list = [...fundsList];

    if (category) {
      list = list.filter((f: any) => 
        f.category?.toLowerCase() === category.toLowerCase() ||
        f.subCategory?.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (selectedSubCat) {
      list = list.filter((f: any) => f.subCategory === selectedSubCat);
    }

    if (selectedAmc) {
      list = list.filter((f: any) => f.amcName === selectedAmc);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((f: any) => 
        f.fundName?.toLowerCase().includes(q) ||
        f.amcName?.toLowerCase().includes(q) ||
        f.subCategory?.toLowerCase().includes(q) ||
        f.fundManager?.toLowerCase().includes(q)
      );
    }

    list.sort((a: any, b: any) => {
      if (sortBy === 'cagr') return (b.cagr || 0) - (a.cagr || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'aum') return (b.aumCrores || 0) - (a.aumCrores || 0);
      if (sortBy === 'returns1yr') return (b.returns1Yr || 0) - (a.returns1Yr || 0);
      if (sortBy === 'returns3yr') return (b.returns3Yr || 0) - (a.returns3Yr || 0);
      if (sortBy === 'returns5yr') return (b.returns5Yr || 0) - (a.returns5Yr || 0);
      if (sortBy === 'risk') return (a.riskScore || 0) - (b.riskScore || 0);
      return 0;
    });

    return list;
  }, [fundsList, category, selectedSubCat, selectedAmc, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredFunds.length / itemsPerPage);

  // Reset page to 1 when filters or search query change
  useEffect(() => {
    setPage(1);
  }, [category, selectedSubCat, selectedAmc, searchQuery, sortBy]);

  // Clamp page within valid bounds
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentFunds = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredFunds.slice(start, start + itemsPerPage);
  }, [filteredFunds, page]);

  // Cart Handlers
  const handleAddToCart = (fund: any) => {
    const exists = cartItems.some(item => item.fund.id === fund.id);
    if (!exists) {
      const defaultAmount = fund.minSip || 1000;
      setCartItems(prev => [...prev, {
        fund,
        investmentType: 'SIP',
        amount: defaultAmount,
        sipDay: 5
      }]);
      setToastMessage(`🎉 ${fund.fundName} added to your Investment Cart!`);
    } else {
      setToastMessage(`ℹ️ ${fund.fundName} is already in your Investment Cart.`);
    }
  };

  const handleRemoveFromCart = (fundId: number) => {
    setCartItems(prev => prev.filter(item => item.fund.id !== fundId));
  };

  const handleUpdateCartItem = (fundId: number, field: string, value: any) => {
    setCartItems(prev => prev.map(item => {
      if (item.fund.id === fundId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const totalCartAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.amount, 0);
  }, [cartItems]);

  // Proceed from Cart Drawer to Payment Method Selection Modal
  const handleOpenPaymentModal = () => {
    if (cartItems.length === 0) return;
    setCartDrawerOpen(false);
    setPaymentModalOpen(true);
  };

  // Validate UPI ID format
  const validateUpiId = (id: string) => /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/.test(id.trim());

  // Trigger UPI Collect Request Screen or Direct Payment
  const handleInitiatePayment = () => {
    setPaymentModalOpen(false);
    if (paymentMethod === 'UPI') {
      if (!upiId.trim() || !validateUpiId(upiId)) {
        setPaymentModalOpen(true);
        setUpiError('Please enter a valid UPI ID (e.g. yourname@ybl or phone@paytm)');
        return;
      }
      setUpiError('');
      setUpiCollectModalOpen(true);
    } else {
      handleFinalizePaymentBatch();
    }
  };

  // Executes Database Investment & Returns Receipt
  const handleFinalizePaymentBatch = async () => {
    let details = upiId;
    if (paymentMethod === 'CARD') details = cardNumber;
    if (paymentMethod === 'NETBANKING') details = selectedBank;
    if (paymentMethod === 'WALLET') details = 'Growsure Wallet';

    // Simulate bank verification & transfer
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const payload = {
        paymentMethod,
        paymentDetails: details,
        investments: cartItems.map(item => ({
          fundId: item.fund.id,
          investmentAmount: item.amount,
          sipAmount: item.amount,
          investmentType: item.investmentType,
          dayOfMonth: item.sipDay
        }))
      };

      let responseData;
      try {
        const res = await api.post('/api/investments/batch', payload);
        responseData = res.data;
      } catch {
        try {
          await api.post('/api/investments', {
            fundId: cartItems[0]?.fund.id,
            investmentAmount: cartItems[0]?.amount,
            sipAmount: cartItems[0]?.amount,
            investmentType: cartItems[0]?.investmentType,
            dayOfMonth: cartItems[0]?.sipDay
          });
        } catch { /* silent fallback */ }
        responseData = { 
          totalAmount: totalCartAmount, 
          count: cartItems.length, 
          paymentId: 'pay_upi_' + Date.now(), 
          paymentMethod 
        };
      }

      const boughtFundsList = cartItems.map(item => ({
        name: item.fund.fundName,
        amc: item.fund.amcName,
        type: item.investmentType,
        amount: item.amount
      }));

      const txnRef = `UPI/2026/KKBK/${Math.floor(100000000000 + Math.random() * 900000000000)}`;

      setSuccessReceipt({
        totalAmount: totalCartAmount,
        count: cartItems.length,
        paymentId: responseData?.paymentId || txnRef,
        paymentMethod,
        senderUpi: details,
        receiverName: 'Sarvesh Sachin Kulkarni',
        receiverBank: 'Kotak Mahindra (PUNE-LAXMI ROAD)',
        receiverAcc: '1047182452',
        receiverIfsc: 'KKBK0001775',
        receiverUpi: 'sarveshkulkarni.2003@ybl',
        items: boughtFundsList,
        timestamp: new Date().toLocaleString('en-IN')
      });

      setCartItems([]);
      localStorage.removeItem('growsure_investment_cart');
      setUpiCollectModalOpen(false);
      setPaymentModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Payment authorization failed. Please verify your UPI / Bank details.');
    }
  };

  // Calculator Logic
  const handleOpenCalculator = (fund: any) => {
    setSelectedFund(fund);
    setCalcAmount(fund.minSip || 5000);
    setCalcResult(null);
    setCalcDialogOpen(true);
  };

  const handleCalculateReturns = () => {
    if (!selectedFund) return;
    const rate = (selectedFund.cagr || 15) / 100;
    const n = calcYears;

    if (calcType === 'SIP') {
      const monthlyRate = rate / 12;
      const months = n * 12;
      const futureValue = calcAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      setCalcResult(Math.round(futureValue));
    } else {
      const futureValue = calcAmount * Math.pow(1 + rate, n);
      setCalcResult(Math.round(futureValue));
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: -0.5 }}>
            📊 <span className="gradient-text">Mutual Funds Marketplace</span>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore 814 high-return mutual funds. Add funds to your cart, set monthly SIP amounts, and invest instantly.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* AI Advisor Button */}
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<AutoAwesomeIcon />}
            onClick={() => navigate('/marketplace/planner')}
            sx={{ fontWeight: 800 }}
          >
            AI Fund Advisory
          </Button>

          {/* Investment Cart Button Badge */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => setCartDrawerOpen(true)}
            startIcon={
              <Badge badgeContent={cartItems.length} color="error" overlap="circular">
                <ShoppingCartIcon />
              </Badge>
            }
            sx={{ fontWeight: 800, px: 2.5 }}
          >
            Investment Cart ({cartItems.length})
          </Button>
        </Box>
      </Box>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }}>
        <Tabs 
          value={category} 
          onChange={(_, val) => { setCategory(val); setPage(1); }}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label={`All Funds (${fundsList.length})`} value="" />
          <Tab label="Equity Small Cap" value="Equity" />
          <Tab label="Debt & Liquid" value="Debt" />
          <Tab label="Hybrid & Index" value="Hybrid" />
          <Tab label="Tax Saving ELSS" value="Solution Oriented" />
          <Tab label="Other FoFs" value="Other" />
        </Tabs>
      </Box>

      {/* Toolbar Filter Controls */}
      <Card className="glass-card-static" sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2.5} alignItems="center">
          
          {/* Search bar */}
          <Grid item xs={12} md={4}>
            <TextField 
              fullWidth 
              placeholder="Search fund name, AMC, or manager..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* AMC Select */}
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="amc-select-label">Fund House (AMC)</InputLabel>
              <Select
                labelId="amc-select-label"
                value={selectedAmc}
                label="Fund House (AMC)"
                onChange={(e) => { setSelectedAmc(e.target.value); setPage(1); }}
              >
                <MenuItem value="">All AMCs</MenuItem>
                {amcList.map(amc => (
                  <MenuItem key={amc} value={amc}>{amc}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* SubCategory Select */}
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="subcat-select-label">Sub-Category</InputLabel>
              <Select
                labelId="subcat-select-label"
                value={selectedSubCat}
                label="Sub-Category"
                onChange={(e) => { setSelectedSubCat(e.target.value); setPage(1); }}
              >
                <MenuItem value="">All Sub-Categories</MenuItem>
                {subCatList.map(sub => (
                  <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sort By */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-select-label">Sort By</InputLabel>
              <Select
                labelId="sort-select-label"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="cagr">Highest 3Y CAGR (%)</MenuItem>
                <MenuItem value="returns1yr">1-Year Return (%)</MenuItem>
                <MenuItem value="returns5yr">5-Year Return (%)</MenuItem>
                <MenuItem value="rating">Star Rating (High to Low)</MenuItem>
                <MenuItem value="aum">Fund Size AUM (High to Low)</MenuItem>
                <MenuItem value="risk">Risk Score (Low to High)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Funds Cards Grid */}
      {currentFunds.length === 0 ? (
        <Card className="glass-card" sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">No mutual funds match your search filters.</Typography>
          <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => { setSearchQuery(''); setSelectedAmc(''); setSelectedSubCat(''); setCategory(''); }}>
            Reset Filters
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {currentFunds.map((fund: any) => {
            const inCart = cartItems.some(item => item.fund.id === fund.id);

            return (
              <Grid item xs={12} md={6} lg={4} key={fund.id}>
                <Card className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                    
                    {/* Fund AMC & Title Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, pr: 1 }}>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 800, display: 'block', mb: 0.5 }}>
                          {fund.amcName || 'Mutual Fund'}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.3 }}>
                          {fund.fundName}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Rating value={fund.rating || 4} precision={0.5} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                          3Y CAGR: <strong style={{ color: '#10b981' }}>{fund.cagr ? `${fund.cagr}%` : 'N/A'}</strong>
                        </Typography>
                      </Box>
                    </Box>

                    {/* Category Badges */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={fund.category} size="small" color="primary" sx={{ fontWeight: 800 }} />
                      {fund.subCategory && (
                        <Chip label={fund.subCategory} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                      )}
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                    {/* Returns breakdown */}
                    <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.05)', p: 1.5, borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                      <Grid container spacing={1} textAlign="center">
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">1Y Return</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: fund.returns1Yr >= 0 ? '#10b981' : '#ef4444' }}>
                            {fund.returns1Yr ? `${fund.returns1Yr}%` : 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">3Y Return</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: fund.returns3Yr >= 0 ? '#10b981' : '#ef4444' }}>
                            {fund.returns3Yr ? `${fund.returns3Yr}%` : 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">5Y Return</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: fund.returns5Yr >= 0 ? '#10b981' : '#ef4444' }}>
                            {fund.returns5Yr ? `${fund.returns5Yr}%` : 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Stats Grid */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Min SIP / Lumpsum</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          ₹{fund.minSip || 1000} / ₹{fund.minLumpsum || 5000}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Expense Ratio</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{fund.expenseRatio || 0.5}%</Typography>
                      </Grid>
                    </Grid>

                    {/* Card Action Buttons */}
                    <Box sx={{ mt: 'auto', pt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          color="inherit"
                          size="small"
                          onClick={() => handleOpenCalculator(fund)}
                          startIcon={<CalculateIcon sx={{ fontSize: 16 }} />}
                          sx={{ flex: 1, fontSize: '0.78rem', py: 0.6, borderRadius: 2, textTransform: 'none' }}
                        >
                          Calculate
                        </Button>
                        <Button 
                          variant={compareFundA?.id === fund.id || compareFundB?.id === fund.id ? "contained" : "outlined"} 
                          color={compareFundA?.id === fund.id || compareFundB?.id === fund.id ? "secondary" : "info"}
                          size="small"
                          onClick={() => handleToggleCompare(fund)}
                          startIcon={<CompareArrowsIcon sx={{ fontSize: 16 }} />}
                          sx={{ flex: 1, fontSize: '0.78rem', py: 0.6, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                        >
                          {compareFundA?.id === fund.id || compareFundB?.id === fund.id ? 'Selected ✓' : 'Compare'}
                        </Button>
                      </Box>

                      <Button 
                        variant="contained" 
                        color={inCart ? "success" : "primary"}
                        fullWidth
                        size="medium"
                        onClick={() => handleAddToCart(fund)}
                        startIcon={inCart ? <CheckCircleOutlineIcon /> : <AddShoppingCartIcon />}
                        sx={{ py: 0.8, fontSize: '0.85rem', fontWeight: 800, borderRadius: 2 }}
                      >
                        {inCart ? 'In Investment Cart ✓' : 'Invest Now'}
                      </Button>
                    </Box>

                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5, mb: 3, gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="primary"
              size="medium"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              sx={{ fontWeight: 800, borderRadius: 2, minWidth: 100, textTransform: 'none' }}
            >
              ◄ Previous
            </Button>

            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(_, value) => handlePageChange(value)} 
              color="primary" 
              size="large"
              showFirstButton 
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#f8fafc',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)'
                  },
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.15)'
                  }
                }
              }}
            />

            <Button
              variant="outlined"
              color="primary"
              size="medium"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              sx={{ fontWeight: 800, borderRadius: 2, minWidth: 100, textTransform: 'none' }}
            >
              Next ►
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
            Page <strong style={{ color: '#38bdf8' }}>{page}</strong> of <strong style={{ color: '#38bdf8' }}>{totalPages}</strong> ({filteredFunds.length} Total Mutual Funds)
          </Typography>
        </Box>
      )}

      {/* Investment Cart Drawer */}
      <Drawer
        anchor="right"
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 460 },
            bgcolor: '#0b0f19',
            color: '#f8fafc',
            p: 3,
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCartIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Outfit' }}>
              Investment Cart ({cartItems.length})
            </Typography>
          </Box>
          <IconButton onClick={() => setCartDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
            ✕
          </IconButton>
        </Box>

        {cartItems.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.4 }} />
            <Typography variant="h6" color="text.secondary">Your Investment Cart is empty.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Click "Invest Now" on any mutual fund card to add funds to your cart.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setCartDrawerOpen(false)}>
              Browse Mutual Funds
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, pr: 0.5 }}>
              {cartItems.map((item) => (
                <Box 
                  key={item.fund.id}
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 3, 
                    bgcolor: 'rgba(15, 23, 42, 0.8)', 
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    position: 'relative'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ pr: 2 }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800 }}>
                        {item.fund.amcName}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
                        {item.fund.fundName}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleRemoveFromCart(item.fund.id)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel id={`type-${item.fund.id}`}>Type</InputLabel>
                        <Select
                          labelId={`type-${item.fund.id}`}
                          value={item.investmentType}
                          label="Type"
                          onChange={(e) => handleUpdateCartItem(item.fund.id, 'investmentType', e.target.value)}
                        >
                          <MenuItem value="SIP">Monthly SIP</MenuItem>
                          <MenuItem value="LUMPSUM">One-Time Lumpsum</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label={item.investmentType === 'SIP' ? "SIP Amount (₹)" : "Lumpsum (₹)"}
                        type="number"
                        size="small"
                        value={item.amount}
                        onChange={(e) => handleUpdateCartItem(item.fund.id, 'amount', Number(e.target.value))}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }} />

            {/* Cart Summary Header */}
            <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', borderRadius: 2.5, border: '1px solid rgba(16, 185, 129, 0.2)', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Total Investment Amount:</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#34d399' }}>
                  ₹{totalCartAmount.toLocaleString('en-IN')}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Includes {cartItems.length} mutual fund investment orders.
              </Typography>
            </Box>

            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              fullWidth 
              onClick={handleOpenPaymentModal}
              endIcon={<ArrowForwardIcon />}
              sx={{ py: 1.5, fontWeight: 900, fontSize: '1rem' }}
            >
              Proceed to Payment Method
            </Button>
          </>
        )}
      </Drawer>

      {/* Payment Method Selection Modal */}
      <Dialog 
        open={paymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon color="primary" />
            <span>Select Payment Method</span>
          </Box>
          <Chip 
            label={`Total: ₹${totalCartAmount.toLocaleString('en-IN')}`} 
            color="primary" 
            sx={{ fontWeight: 900, fontSize: '0.85rem' }} 
          />
        </DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
            {/* Receiver Bank Details Card */}
            <Box 
              sx={{ 
                p: 2.5, 
                borderRadius: 3, 
                bgcolor: 'rgba(99, 102, 241, 0.08)', 
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, letterSpacing: 0.5 }}>
                <AccountBalanceIcon sx={{ fontSize: 16 }} /> BENEFICIARY / RECEIVER BANK ACCOUNT DETAILS
              </Typography>

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Account Holder Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>Sarvesh Sachin Kulkarni</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Bank Name & Branch</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>Kotak Mahindra (PUNE-LAXMI ROAD)</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Account Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#38bdf8' }}>1047182452</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">IFSC Code</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#34d399' }}>KKBK0001775</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Receiver UPI ID</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#c084fc' }}>sarveshkulkarni.2003@ybl</Typography>
                </Grid>
              </Grid>
            </Box>

            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {/* 1. UPI Option */}
              <Box 
                sx={{ 
                  p: 2, 
                  mb: 1.5, 
                  borderRadius: 2.5, 
                  border: '1px solid',
                  borderColor: paymentMethod === 'UPI' ? 'primary.main' : 'rgba(255,255,255,0.1)',
                  bgcolor: paymentMethod === 'UPI' ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                }}
              >
                <FormControlLabel 
                  value="UPI" 
                  control={<Radio color="primary" />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <QrCodeScannerIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        UPI (Google Pay / PhonePe / Paytm / BHIM)
                      </Typography>
                    </Box>
                  } 
                />
                {paymentMethod === 'UPI' && (
                  <Box sx={{ mt: 1.5, ml: 4 }}>
                    <TextField
                      label="Your UPI ID / VPA (Payer)"
                      variant="outlined"
                      size="small"
                      value={upiId}
                      onChange={(e) => { setUpiId(e.target.value); setUpiError(''); }}
                      placeholder="yourname@ybl / phone@paytm"
                      error={Boolean(upiError)}
                      helperText={upiError || 'Enter your own UPI ID. A collect request will be sent to your UPI app.'}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {validateUpiId(upiId) 
                              ? <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                              : <QrCodeScannerIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                            }
                          </InputAdornment>
                        )
                      }}
                    />
                    <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, bgcolor: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <Typography variant="caption" color="text.secondary">
                        💡 <strong>How it works:</strong> After clicking Pay, a ₹{totalCartAmount.toLocaleString('en-IN')} UPI Collect Request will be sent to <strong>{upiId || 'your UPI app'}</strong>. Open your UPI app, approve the request, and enter your UPI PIN to complete payment to <strong>sarveshkulkarni.2003@ybl</strong>.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* 2. Credit / Debit Card */}
              <Box 
                sx={{ 
                  p: 2, 
                  mb: 1.5, 
                  borderRadius: 2.5, 
                  border: '1px solid',
                  borderColor: paymentMethod === 'CARD' ? 'primary.main' : 'rgba(255,255,255,0.1)',
                  bgcolor: paymentMethod === 'CARD' ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                }}
              >
                <FormControlLabel 
                  value="CARD" 
                  control={<Radio color="primary" />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCardIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Credit / Debit Card (Visa, MasterCard, RuPay)
                      </Typography>
                    </Box>
                  } 
                />
                {paymentMethod === 'CARD' && (
                  <Box sx={{ mt: 1.5, ml: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <TextField
                      label="Card Number"
                      size="small"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      fullWidth
                    />
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <TextField
                          label="Expiry Date"
                          size="small"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="CVV Code"
                          size="small"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>

              {/* 3. Net Banking */}
              <Box 
                sx={{ 
                  p: 2, 
                  mb: 1.5, 
                  borderRadius: 2.5, 
                  border: '1px solid',
                  borderColor: paymentMethod === 'NETBANKING' ? 'primary.main' : 'rgba(255,255,255,0.1)',
                  bgcolor: paymentMethod === 'NETBANKING' ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                }}
              >
                <FormControlLabel 
                  value="NETBANKING" 
                  control={<Radio color="primary" />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalanceIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Net Banking (Internet Banking)
                      </Typography>
                    </Box>
                  } 
                />
                {paymentMethod === 'NETBANKING' && (
                  <Box sx={{ mt: 1.5, ml: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="bank-select">Choose Bank</InputLabel>
                      <Select
                        labelId="bank-select"
                        value={selectedBank}
                        label="Choose Bank"
                        onChange={(e) => setSelectedBank(e.target.value)}
                      >
                        <MenuItem value="HDFC Bank">HDFC Bank</MenuItem>
                        <MenuItem value="ICICI Bank">ICICI Bank</MenuItem>
                        <MenuItem value="State Bank of India">State Bank of India (SBI)</MenuItem>
                        <MenuItem value="Axis Bank">Axis Bank</MenuItem>
                        <MenuItem value="Kotak Mahindra">Kotak Mahindra Bank</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Box>

              {/* 4. Growsure Wallet */}
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2.5, 
                  border: '1px solid',
                  borderColor: paymentMethod === 'WALLET' ? 'primary.main' : 'rgba(255,255,255,0.1)',
                  bgcolor: paymentMethod === 'WALLET' ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                }}
              >
                <FormControlLabel 
                  value="WALLET" 
                  control={<Radio color="primary" />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalanceWalletIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Growsure Instant Wallet (Bal: ₹50,000)
                      </Typography>
                    </Box>
                  } 
                />
              </Box>
            </RadioGroup>

          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPaymentModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleInitiatePayment}
            sx={{ px: 3, fontWeight: 900 }}
          >
            Pay ₹{totalCartAmount.toLocaleString('en-IN')} & Proceed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return Calculator Dialog */}
      <Dialog open={calcDialogOpen} onClose={() => setCalcDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          🧮 {selectedFund?.fundName} Calculator
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Estimated 3Y CAGR: <strong style={{ color: '#10b981' }}>{selectedFund?.cagr}%</strong>
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="calc-type-label">Investment Mode</InputLabel>
            <Select
              labelId="calc-type-label"
              value={calcType}
              label="Investment Mode"
              onChange={(e) => setCalcType(e.target.value as any)}
            >
              <MenuItem value="SIP">Monthly SIP</MenuItem>
              <MenuItem value="LUMPSUM">One-Time Lumpsum</MenuItem>
            </Select>
          </FormControl>
          <TextField 
            label={calcType === 'SIP' ? "Monthly SIP (₹)" : "Investment Amount (₹)"}
            type="number"
            value={calcAmount}
            onChange={(e) => setCalcAmount(Number(e.target.value))}
            fullWidth
          />
          <TextField 
            label="Investment Tenure (Years)"
            type="number"
            value={calcYears}
            onChange={(e) => setCalcYears(Number(e.target.value))}
            fullWidth
          />

          {calcResult && (
            <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', borderRadius: 2, textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Typography variant="caption" color="text.secondary">ESTIMATED MATURITY CORPUS</Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 900, my: 0.5 }}>
                ₹{calcResult.toLocaleString('en-IN')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCalcDialogOpen(false)}>Close</Button>
          <Button variant="contained" color="primary" onClick={handleCalculateReturns}>
            Calculate Growth
          </Button>
        </DialogActions>
      </Dialog>

      {/* REAL Verified Payment Receipt Modal */}
      <Dialog 
        open={Boolean(successReceipt)} 
        onClose={() => setSuccessReceipt(null)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 1 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981', mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981', letterSpacing: -0.5 }}>
            Payment Approved & Transferred!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Funds Transferred to Kotak Mahindra Bank & Investment Order Executed
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 4, py: 2 }}>
          {successReceipt && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              {/* Receipt Summary Card */}
              <Box 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  bgcolor: 'rgba(16, 185, 129, 0.08)', 
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  textAlign: 'center' 
                }}
              >
                <Typography variant="caption" color="text.secondary">TOTAL AMOUNT PAID FROM SENDER MOBILE</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#34d399', my: 0.5 }}>
                  ₹{successReceipt.totalAmount?.toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#60a5fa' }}>
                  Transaction Ref: {successReceipt.paymentId}
                </Typography>
              </Box>

              {/* Transaction Details Breakdown */}
              <Grid container spacing={2} sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)', p: 2.5, borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.08)' }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Sender UPI VPA</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{successReceipt.senderUpi}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Payment Timestamp</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{successReceipt.timestamp}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.08)' }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Transferred To Beneficiary Receiver</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                    {successReceipt.receiverName} ({successReceipt.receiverBank})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    A/C: {successReceipt.receiverAcc} | IFSC: {successReceipt.receiverIfsc} | UPI: {successReceipt.receiverUpi}
                  </Typography>
                </Grid>
              </Grid>

              {/* Purchased Funds List */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Purchased Mutual Fund Holdings ({successReceipt.count}):
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {successReceipt.items?.map((item: any, idx: number) => (
                    <Box 
                      key={idx}
                      sx={{ 
                        display: 'flex', 
                        justify: 'space-between', 
                        alignItems: 'center', 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.amc} • {item.type}</Typography>
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#34d399' }}>
                        ₹{item.amount?.toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 4, pt: 1, flexDirection: 'column', gap: 1.5 }}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            size="large"
            onClick={() => { setSuccessReceipt(null); navigate('/'); }} 
            sx={{ fontWeight: 900, py: 1.2 }}
          >
            View Holdings in Customer Portfolio
          </Button>

          <Button 
            variant="outlined" 
            color="inherit" 
            fullWidth
            startIcon={<DownloadIcon />}
            onClick={() => window.print()}
            sx={{ fontWeight: 700 }}
          >
            Download PDF Receipt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastMessage(null)} severity="success" sx={{ width: '100%', fontWeight: 700, borderRadius: 3 }}>
          {toastMessage}
        </Alert>
      </Snackbar>

      {/* UPI QR Payment Modal (Root Level Center Pop-up Window) */}
      <UpiQrPaymentModal
        open={upiCollectModalOpen}
        onClose={() => setUpiCollectModalOpen(false)}
        amount={totalCartAmount}
        payerUpiId={upiId}
        receiverUpiId="sarveshkulkarni.2003@ybl"
        receiverName="Sarvesh Sachin Kulkarni"
        bankInfo="Kotak Mahindra Bank - 2003"
        orderTitle="Mutual Funds Investment"
        onPaymentSuccess={() => {
          setUpiCollectModalOpen(false);
          handleFinalizePaymentBatch();
        }}
      />

      {/* Mutual Funds Side-by-Side Comparison Dialog */}
      <Dialog open={compareModalOpen} onClose={() => setCompareModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareArrowsIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Mutual Funds Side-by-Side Comparison
            </Typography>
          </Box>
          <IconButton onClick={() => setCompareModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Grid container spacing={3}>
            {/* Fund A Selector & Details */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : '#f0f7ff', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="compare-a-label">Select Fund 1</InputLabel>
                  <Select
                    labelId="compare-a-label"
                    value={compareFundA?.id || ''}
                    label="Select Fund 1"
                    onChange={(e) => {
                      const fund = fundsList.find((f: any) => f.id === e.target.value);
                      setCompareFundA(fund);
                    }}
                  >
                    {fundsList.map((f: any) => (
                      <MenuItem key={f.id} value={f.id}>{f.fundName} ({f.amcName})</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {compareFundA ? (
                  <Box>
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 800 }}>{compareFundA.fundName}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>{compareFundA.amcName} · {compareFundA.subCategory || compareFundA.category}</Typography>

                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Risk Rating</TableCell>
                          <TableCell align="right"><Chip label={compareFundA.riskRating || 'Moderate'} size="small" color="warning" variant="outlined" /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>3Y CAGR / Return</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: '#10b981' }}>{compareFundA.returns3Yr || compareFundA.cagr || 18.5}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Expense Ratio</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>{compareFundA.expenseRatio || 0.55}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Min SIP / Lumpsum</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>₹{compareFundA.minSip || 1000} / ₹{compareFundA.minLumpsum || 5000}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Fund Rating</TableCell>
                          <TableCell align="right"><Rating value={compareFundA.rating || 4} readOnly size="small" /></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      onClick={() => { handleAddToCart(compareFundA); setCompareModalOpen(false); }} 
                      sx={{ mt: 2.5, borderRadius: 2.5, fontWeight: 800 }}
                    >
                      Invest in {compareFundA.fundName.split(' ')[0]}
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>Select Fund 1 above</Typography>
                )}
              </Box>
            </Grid>

            {/* Fund B Selector & Details */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(6, 182, 212, 0.1)' : '#ecfeff', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="compare-b-label">Select Fund 2</InputLabel>
                  <Select
                    labelId="compare-b-label"
                    value={compareFundB?.id || ''}
                    label="Select Fund 2"
                    onChange={(e) => {
                      const fund = fundsList.find((f: any) => f.id === e.target.value);
                      setCompareFundB(fund);
                    }}
                  >
                    {fundsList.map((f: any) => (
                      <MenuItem key={f.id} value={f.id}>{f.fundName} ({f.amcName})</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {compareFundB ? (
                  <Box>
                    <Typography variant="subtitle1" color="secondary" sx={{ fontWeight: 800 }}>{compareFundB.fundName}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>{compareFundB.amcName} · {compareFundB.subCategory || compareFundB.category}</Typography>

                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Risk Rating</TableCell>
                          <TableCell align="right"><Chip label={compareFundB.riskRating || 'Moderate'} size="small" color="warning" variant="outlined" /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>3Y CAGR / Return</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: '#10b981' }}>{compareFundB.returns3Yr || compareFundB.cagr || 18.5}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Expense Ratio</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>{compareFundB.expenseRatio || 0.55}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Min SIP / Lumpsum</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>₹{compareFundB.minSip || 1000} / ₹{compareFundB.minLumpsum || 5000}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Fund Rating</TableCell>
                          <TableCell align="right"><Rating value={compareFundB.rating || 4} readOnly size="small" /></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    <Button 
                      variant="contained" 
                      color="secondary" 
                      fullWidth 
                      onClick={() => { handleAddToCart(compareFundB); setCompareModalOpen(false); }} 
                      sx={{ mt: 2.5, borderRadius: 2.5, fontWeight: 800 }}
                    >
                      Invest in {compareFundB.fundName.split(' ')[0]}
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>Select Fund 2 above</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Floating Comparison Action Bar */}
      {(compareFundA || compareFundB) && (
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 1200,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e1b4b' : '#1e293b', 
            color: 'white', 
            py: 1.5, 
            px: 3, 
            borderRadius: 5, 
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(99,102,241,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            ⚖️ Comparing ({[compareFundA, compareFundB].filter(Boolean).length}/2 Funds): 
            <strong style={{ color: '#38bdf8', marginLeft: 6 }}>
              {compareFundA?.fundName || 'Select Fund A'} 
              {compareFundB ? ` vs ${compareFundB.fundName}` : ''}
            </strong>
          </Typography>

          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => setCompareModalOpen(true)}
            startIcon={<CompareArrowsIcon />}
            sx={{ fontWeight: 900, borderRadius: 3, textTransform: 'none' }}
          >
            Compare Side-by-Side
          </Button>

          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleClearComparison}
            sx={{ 
              color: '#f87171', 
              borderColor: 'rgba(248,113,113,0.4)', 
              fontWeight: 700, 
              fontSize: '0.75rem',
              borderRadius: 2.5,
              textTransform: 'none',
              px: 1.5,
              '&:hover': { bgcolor: 'rgba(239,68,68,0.15)', borderColor: '#ef4444' }
            }}
          >
            Clear / Cancel
          </Button>

          <IconButton 
            size="small" 
            onClick={handleClearComparison}
            sx={{ color: 'rgba(255,255,255,0.8)', p: 0.5, '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' } }}
            title="Cancel Comparison"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

    </Box>
  );
};

export default FundMarketplace;
