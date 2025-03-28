import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({
    sub: '1',
    email: 'test@example.com',
    exp: Date.now() / 1000 + 3600, // 1 hour in the future
  })),
}));

// Import the module after mocking
import authReducer, {
  setToken,
  logout,
} from './authSlice';
import type { RootState } from '../index';

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('should handle initial state', () => {
    const state = (store.getState() as Pick<RootState, 'auth'>).auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle logout', () => {
    // First set a token
    store.dispatch(setToken('test-token'));
    
    // Then logout
    store.dispatch(logout());
    
    const state = (store.getState() as Pick<RootState, 'auth'>).auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('should handle setToken', () => {
    store.dispatch(setToken('test-token'));
    
    const state = (store.getState() as Pick<RootState, 'auth'>).auth;
    expect(state.token).toBe('test-token');
    expect(state.isAuthenticated).toBe(true);
  });
});
