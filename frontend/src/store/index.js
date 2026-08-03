import { configureStore, createSlice } from '@reduxjs/toolkit';

// 1. Auth Slice
const initialAuthState = {
  token: localStorage.getItem('growsure_token'),
  email: localStorage.getItem('growsure_email'),
  role: localStorage.getItem('growsure_role'),
  name: localStorage.getItem('growsure_name'),
  userId: localStorage.getItem('growsure_user_id') ? parseInt(localStorage.getItem('growsure_user_id')) : null,
  isAuthenticated: !!localStorage.getItem('growsure_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.name = action.payload.name;
      state.userId = action.payload.userId;
      state.isAuthenticated = true;
      
      localStorage.setItem('growsure_token', action.payload.token);
      localStorage.setItem('growsure_email', action.payload.email);
      localStorage.setItem('growsure_role', action.payload.role);
      localStorage.setItem('growsure_name', action.payload.name);
      localStorage.setItem('growsure_user_id', action.payload.userId.toString());
    },
    logout: (state) => {
      state.token = null;
      state.email = null;
      state.role = null;
      state.name = null;
      state.userId = null;
      state.isAuthenticated = false;

      localStorage.removeItem('growsure_token');
      localStorage.removeItem('growsure_email');
      localStorage.removeItem('growsure_role');
      localStorage.removeItem('growsure_name');
      localStorage.removeItem('growsure_user_id');
    }
  }
});

// 2. Policy Slice
const initialPolicyState = {
  policiesList: [],
  purchasedList: [],
  compareA: null,
  compareB: null,
};

const policySlice = createSlice({
  name: 'policy',
  initialState: initialPolicyState,
  reducers: {
    setPolicies: (state, action) => {
      state.policiesList = action.payload;
    },
    setPurchasedPolicies: (state, action) => {
      state.purchasedList = action.payload;
    },
    setCompareA: (state, action) => {
      state.compareA = action.payload;
    },
    setCompareB: (state, action) => {
      state.compareB = action.payload;
    }
  }
});

// 3. Fund Slice
const initialFundState = {
  fundsList: [],
  portfolioSummary: null,
};

const fundSlice = createSlice({
  name: 'fund',
  initialState: initialFundState,
  reducers: {
    setFunds: (state, action) => {
      state.fundsList = action.payload;
    },
    setPortfolioSummary: (state, action) => {
      state.portfolioSummary = action.payload;
    }
  }
});

// 4. Claim Slice
const initialClaimState = {
  claimsList: [],
};

const claimSlice = createSlice({
  name: 'claim',
  initialState: initialClaimState,
  reducers: {
    setClaims: (state, action) => {
      state.claimsList = action.payload;
    }
  }
});

// 5. Backend Switcher & Theme Slice
const initialAppState = {
  activeBackend: localStorage.getItem('growsure_backend') || 'dotnet',
  themeMode: localStorage.getItem('growsure_theme') || 'dark',
};

const appSlice = createSlice({
  name: 'app',
  initialState: initialAppState,
  reducers: {
    toggleBackend: (state, action) => {
      state.activeBackend = action.payload;
      localStorage.setItem('growsure_backend', action.payload);
    },
    toggleThemeMode: (state) => {
      const nextTheme = state.themeMode === 'dark' ? 'light' : 'dark';
      state.themeMode = nextTheme;
      localStorage.setItem('growsure_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    },
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
      localStorage.setItem('growsure_theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    }
  }
});

export const { loginSuccess, logout } = authSlice.actions;
export const { setPolicies, setPurchasedPolicies, setCompareA, setCompareB } = policySlice.actions;
export const { setFunds, setPortfolioSummary } = fundSlice.actions;
export const { setClaims } = claimSlice.actions;
export const { toggleBackend, toggleThemeMode, setThemeMode } = appSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    policy: policySlice.reducer,
    fund: fundSlice.reducer,
    claim: claimSlice.reducer,
    app: appSlice.reducer,
  }
});
