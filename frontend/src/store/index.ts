import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. Auth Slice State
interface AuthState {
  token: string | null;
  email: string | null;
  role: string | null;
  name: string | null;
  userId: number | null;
  isAuthenticated: boolean;
}

const initialAuthState: AuthState = {
  token: localStorage.getItem('growsure_token'),
  email: localStorage.getItem('growsure_email'),
  role: localStorage.getItem('growsure_role'),
  name: localStorage.getItem('growsure_name'),
  userId: localStorage.getItem('growsure_user_id') ? parseInt(localStorage.getItem('growsure_user_id')!) : null,
  isAuthenticated: !!localStorage.getItem('growsure_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; email: string; role: string; name: string; userId: number }>) => {
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

// 2. Policy Slice State
interface PolicyState {
  policiesList: any[];
  purchasedList: any[];
  compareA: any | null;
  compareB: any | null;
}

const initialPolicyState: PolicyState = {
  policiesList: [],
  purchasedList: [],
  compareA: null,
  compareB: null,
};

const policySlice = createSlice({
  name: 'policy',
  initialState: initialPolicyState,
  reducers: {
    setPolicies: (state, action: PayloadAction<any[]>) => {
      state.policiesList = action.payload;
    },
    setPurchasedPolicies: (state, action: PayloadAction<any[]>) => {
      state.purchasedList = action.payload;
    },
    setCompareA: (state, action: PayloadAction<any | null>) => {
      state.compareA = action.payload;
    },
    setCompareB: (state, action: PayloadAction<any | null>) => {
      state.compareB = action.payload;
    }
  }
});

// 3. Fund Slice State
interface FundState {
  fundsList: any[];
  portfolioSummary: any | null;
}

const initialFundState: FundState = {
  fundsList: [],
  portfolioSummary: null,
};

const fundSlice = createSlice({
  name: 'fund',
  initialState: initialFundState,
  reducers: {
    setFunds: (state, action: PayloadAction<any[]>) => {
      state.fundsList = action.payload;
    },
    setPortfolioSummary: (state, action: PayloadAction<any>) => {
      state.portfolioSummary = action.payload;
    }
  }
});

// 4. Claim Slice State
interface ClaimState {
  claimsList: any[];
}

const initialClaimState: ClaimState = {
  claimsList: [],
};

const claimSlice = createSlice({
  name: 'claim',
  initialState: initialClaimState,
  reducers: {
    setClaims: (state, action: PayloadAction<any[]>) => {
      state.claimsList = action.payload;
    }
  }
});

// 5. Backend Switcher & Theme Slice State
interface AppState {
  activeBackend: 'springboot' | 'dotnet';
  themeMode: 'dark' | 'light';
}

const initialAppState: AppState = {
  activeBackend: (localStorage.getItem('growsure_backend') as 'springboot' | 'dotnet') || 'dotnet',
  themeMode: (localStorage.getItem('growsure_theme') as 'dark' | 'light') || 'dark',
};

const appSlice = createSlice({
  name: 'app',
  initialState: initialAppState,
  reducers: {
    toggleBackend: (state, action: PayloadAction<'springboot' | 'dotnet'>) => {
      state.activeBackend = action.payload;
      localStorage.setItem('growsure_backend', action.payload);
    },
    toggleThemeMode: (state) => {
      const nextTheme = state.themeMode === 'dark' ? 'light' : 'dark';
      state.themeMode = nextTheme;
      localStorage.setItem('growsure_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    },
    setThemeMode: (state, action: PayloadAction<'dark' | 'light'>) => {
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
