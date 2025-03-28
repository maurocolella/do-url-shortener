import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  register,
  fetchCurrentUser,
  logout,
  setToken
} from './authSlice';
import { jwtDecode } from 'jwt-decode';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

// Mock axios
vi.mock('../../api/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.resetAllMocks();
    localStorageMock.clear();
    
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe('reducers', () => {
    it('should handle logout', () => {
      // Setup initial state with authenticated user
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: '1', email: 'test@example.com', provider: 'local' },
          accessToken: 'test-token',
        },
      });

      // Ensure user is authenticated
      expect(store.getState().auth.isAuthenticated).toBe(true);
      expect(store.getState().auth.user).not.toBeNull();
      expect(store.getState().auth.token).not.toBeNull();

      // Dispatch logout
      store.dispatch(logout());

      // Check that user is logged out
      expect(store.getState().auth.isAuthenticated).toBe(false);
      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().auth.token).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    it('should handle setToken', () => {
      // Mock jwtDecode to return valid token data
      (jwtDecode as any).mockReturnValue({
        sub: '1',
        email: 'test@example.com',
        exp: Date.now() / 1000 + 3600, // 1 hour in the future
      });

      // Dispatch setToken
      store.dispatch(setToken('test-token'));

      // Check that token is set and user is authenticated
      expect(store.getState().auth.token).toBe('test-token');
      expect(store.getState().auth.isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
    });
  });

  describe('async thunks', () => {
    it('should handle login.fulfilled', () => {
      const mockResponse = {
        user: { id: '1', email: 'test@example.com', provider: 'local' },
        accessToken: 'test-token',
      };
      
      // Dispatch fulfilled action
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: mockResponse,
      });

      // Check state
      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toEqual(mockResponse.user);
      expect(state.token).toBe(mockResponse.accessToken);
      expect(state.isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockResponse.accessToken);
    });

    it('should handle login.rejected', () => {
      // Dispatch rejected action
      store.dispatch({
        type: 'auth/login/rejected',
        payload: 'Invalid credentials',
      });

      // Check state
      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle register.fulfilled', () => {
      const mockResponse = {
        user: { id: '1', email: 'test@example.com', provider: 'local' },
        accessToken: 'test-token',
      };
      
      // Dispatch fulfilled action
      store.dispatch({
        type: 'auth/register/fulfilled',
        payload: mockResponse,
      });

      // Check state
      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toEqual(mockResponse.user);
      expect(state.token).toBe(mockResponse.accessToken);
      expect(state.isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockResponse.accessToken);
    });

    it('should handle fetchCurrentUser.fulfilled', () => {
      const mockUser = { id: '1', email: 'test@example.com', provider: 'local' };
      
      // Dispatch fulfilled action
      store.dispatch({
        type: 'auth/fetchCurrentUser/fulfilled',
        payload: mockUser,
      });

      // Check state
      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle fetchCurrentUser.rejected', () => {
      // Setup initial state with token
      store.dispatch(setToken('test-token'));
      
      // Dispatch rejected action
      store.dispatch({
        type: 'auth/fetchCurrentUser/rejected',
        payload: 'User not found',
      });

      // Check state
      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('User not found');
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });
});
