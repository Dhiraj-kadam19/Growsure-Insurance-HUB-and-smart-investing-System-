import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Box, AppBar, Toolbar, Typography, Button, Container, 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Avatar, Chip 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShieldIcon from '@mui/icons-material/Shield';
import PaidIcon from '@mui/icons-material/Paid';
import HistoryIcon from '@mui/icons-material/History';
import GavelIcon from '@mui/icons-material/Gavel';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import MenuIcon from '@mui/icons-material/Menu';

import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import { store, logout, toggleThemeMode } from './store';
import Logo from './components/Logo';

// Pages imports
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import PolicyMarketplace from './pages/marketplace/PolicyMarketplace';
import PolicyCompare from './pages/marketplace/PolicyCompare';
import FundMarketplace from './pages/marketplace/FundMarketplace';
import FinancialPlanner from './pages/marketplace/FinancialPlanner';
import ClaimManagement from './pages/marketplace/ClaimManagement';

import InsurerDashboard from './pages/dashboards/InsurerDashboard';
import PolicyEditor from './pages/dashboards/PolicyEditor';
import ClaimVerification from './pages/dashboards/ClaimVerification';

import AdminDashboard from './pages/dashboards/AdminDashboard';
import InsurerApprovals from './pages/dashboards/InsurerApprovals';

import ChatbotWindow from './pages/ChatbotWindow';

// Premium Dark Theme Setup with Neon Accents
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Electric Violet Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#06b6d4', // Vibrant Cyan Accent
      light: '#67e8f9',
      dark: '#0891b2',
    },
    background: {
      default: '#0b0f19',
      paper: '#111827',
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Outfit', sans-serif",
    h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 800 },
    h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    button: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Vibrant Crisp Light Theme Setup
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5',
      light: '#6366f1',
      dark: '#3730a3',
    },
    secondary: {
      main: '#0284c7',
      light: '#38bdf8',
      dark: '#0369a1',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Outfit', sans-serif",
    h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 800 },
    h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    button: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, name } = useSelector((state) => state.auth);
  const { themeMode } = useSelector((state) => state.app);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getNavLinks = () => {
    if (role === 'POLICY_HOLDER') {
      return [
        { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
        { text: 'Browse Policies', path: '/marketplace/policies', icon: <ShieldIcon /> },
        { text: 'Mutual Funds', path: '/marketplace/funds', icon: <PaidIcon /> },
        { text: 'AI Financial Planner', path: '/marketplace/planner', icon: <SettingsSuggestIcon /> },
        { text: 'Claims Tracker', path: '/marketplace/claims', icon: <HistoryIcon /> },
      ];
    } else if (role === 'INSURER') {
      return [
        { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
        { text: 'Manage Catalog', path: '/insurer/policies', icon: <ShieldIcon /> },
        { text: 'Verify Claims', path: '/insurer/claims', icon: <GavelIcon /> },
      ];
    } else if (role === 'ADMIN') {
      return [
        { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
        { text: 'Approve Partners', path: '/admin/approvals', icon: <SupervisedUserCircleIcon /> },
      ];
    }
    return [];
  };

  const drawerWidth = 260;

  const drawerContent = (
    <Box sx={{ height: '100%', bgcolor: 'background.paper', color: 'text.primary', display: 'flex', flexDirection: 'column' }}>
      {/* Offset below fixed header bar */}
      <Box sx={{ pt: '76px', px: 2, pb: 2 }}>
        <Box 
          sx={{ 
            p: 1.8, 
            borderRadius: 3, 
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', 
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5 
          }}
        >
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36, 
              bgcolor: 'primary.main', 
              fontSize: '0.95rem', 
              fontWeight: 700,
              boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)' 
            }}
          >
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ overflow: 'hidden', flex: 1 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2 }}>
              {name}
            </Typography>
            <Chip 
              label={role?.replace('_', ' ')} 
              size="small" 
              color="primary" 
              variant="outlined" 
              sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, mt: 0.5 }} 
            />
          </Box>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'divider' }} />

      {/* Menu Links List */}
      <List sx={{ flex: 1, px: 1.5, py: 1.5 }}>
        {getNavLinks().map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <ListItem key={link.text} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton 
                component={Link} 
                to={link.path}
                onClick={() => setMobileOpen(false)}
                selected={isActive}
                sx={{
                  borderRadius: 2.5,
                  py: 1.1,
                  px: 1.8,
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.1)',
                    color: 'primary.main',
                    fontWeight: 700,
                    boxShadow: 'inset 4px 0 0 0 #6366f1',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(79, 70, 229, 0.15)',
                    }
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateX(3px)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary', minWidth: 36 }}>
                  {link.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={link.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 700 : 500, 
                    fontSize: '0.9rem' 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'divider' }} />
      <Box sx={{ p: 2 }}>
        <Button 
          variant="outlined" 
          color="error" 
          fullWidth 
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ 
            py: 1, 
            borderRadius: 2.5,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.88rem'
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Top Navbar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: themeMode === 'dark' ? 'rgba(11, 15, 25, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          boxShadow: 'none'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Logo size="medium" />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Single Sleek Theme Toggle Button */}
            <IconButton
              onClick={() => dispatch(toggleThemeMode())}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 0.8,
                color: themeMode === 'dark' ? '#f59e0b' : '#6366f1',
                bgcolor: themeMode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                '&:hover': {
                  bgcolor: themeMode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                }
              }}
              title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Content wrapper */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          position: 'relative'
        }}
      >
        {/* Glowing background circles */}
        <div className="bg-glow-blue" style={{ top: '10%', right: '5%' }}></div>
        <div className="bg-glow-green" style={{ bottom: '15%', left: '10%' }}></div>

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Routes>
            {role === 'POLICY_HOLDER' && (
              <>
                <Route path="/" element={<CustomerDashboard />} />
                <Route path="/marketplace/policies" element={<PolicyMarketplace />} />
                <Route path="/marketplace/compare" element={<PolicyCompare />} />
                <Route path="/marketplace/funds" element={<FundMarketplace />} />
                <Route path="/marketplace/planner" element={<FinancialPlanner />} />
                <Route path="/marketplace/claims" element={<ClaimManagement />} />
              </>
            )}
            {role === 'INSURER' && (
              <>
                <Route path="/" element={<InsurerDashboard />} />
                <Route path="/insurer/policies" element={<PolicyEditor />} />
                <Route path="/insurer/claims" element={<ClaimVerification />} />
              </>
            )}
            {role === 'ADMIN' && (
              <>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/admin/approvals" element={<InsurerApprovals />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>

        {/* Floating AI chatbot visible on all pages */}
        <ChatbotWindow />
      </Box>
    </Box>
  );
};

const MainThemeWrapper = () => {
  const { themeMode } = useSelector((state) => state.app);
  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<Layout />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

const RootApp = () => {
  return (
    <Provider store={store}>
      <MainThemeWrapper />
    </Provider>
  );
};

export default RootApp;
