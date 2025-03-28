import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';
import { IAxiosErrorResponse } from '../../types/error.types';

// Types
export interface IUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface IAuthResponse {
  user: IUser;
  accessToken: string;
}

interface IJwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

// Check if token exists in localStorage and is valid
const getInitialState = (): IAuthState => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode<IJwtPayload>(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp && decoded.exp < currentTime) {
        localStorage.removeItem('token');
        return {
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        };
      }
      
      return {
        user: null, 
        token,
        isAuthenticated: true,
        loading: true,
        error: null,
      };
    } catch {
      localStorage.removeItem('token');
      // Silently handle token decode errors
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    }
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: ILoginPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post<IAuthResponse>('/auth/login', credentials);
      localStorage.setItem('token', response.data.accessToken);
      return response.data;
    } catch (error) {
      const axiosError = error as IAxiosErrorResponse;
      return rejectWithValue(axiosError.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: IRegisterPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post<IAuthResponse>('/auth/register', userData);
      localStorage.setItem('token', response.data.accessToken);
      return response.data;
    } catch (error) {
      const axiosError = error as IAxiosErrorResponse;
      return rejectWithValue(axiosError.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: IAuthState };
      if (!state.auth.token) {
        return rejectWithValue('No token available');
      }
      
      const response = await axios.get<IUser>('/users/me');
      return response.data;
    } catch (error) {
      const axiosError = error as IAxiosErrorResponse;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch user');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch current user
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      // If fetching user fails, clear auth state
      if (action.payload === 'Unauthorized') {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      }
    });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
