import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import urlReducer, {
  createUrl,
  fetchUrls,
  fetchUrlById,
  updateUrl,
  deleteUrl,
  fetchStats,
  incrementUrlVisits,
  clearCurrentUrl,
  clearError
} from './urlSlice';

// Mock axios
vi.mock('../../api/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('urlSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        url: urlReducer,
      },
    });
  });

  describe('reducers', () => {
    it('should handle clearCurrentUrl', () => {
      // Setup initial state with a currentUrl
      store.dispatch({
        type: 'url/fetchUrlById/fulfilled',
        payload: { id: '1', slug: 'test', originalUrl: 'https://example.com' },
      });

      // Ensure currentUrl is set
      expect(store.getState().url.currentUrl).not.toBeNull();

      // Dispatch clearCurrentUrl
      store.dispatch(clearCurrentUrl());

      // Check that currentUrl is cleared
      expect(store.getState().url.currentUrl).toBeNull();
    });

    it('should handle clearError', () => {
      // Setup initial state with an error
      store.dispatch({
        type: 'url/createUrl/rejected',
        payload: 'Test error',
      });

      // Ensure error is set
      expect(store.getState().url.error).not.toBeNull();

      // Dispatch clearError
      store.dispatch(clearError());

      // Check that error is cleared
      expect(store.getState().url.error).toBeNull();
    });

    it('should handle incrementUrlVisits', () => {
      // Setup initial state with URLs
      store.dispatch({
        type: 'url/fetchUrls/fulfilled',
        payload: [
          { id: '1', slug: 'test1', visits: 5 },
          { id: '2', slug: 'test2', visits: 10 },
        ],
      });

      // Setup initial state with currentUrl
      store.dispatch({
        type: 'url/fetchUrlById/fulfilled',
        payload: { id: '1', slug: 'test1', visits: 5 },
      });

      // Dispatch incrementUrlVisits
      store.dispatch(incrementUrlVisits('1'));

      // Check that visits are incremented
      const state = store.getState().url;
      const url = state.urls.find(u => u.id === '1');
      expect(url?.visits).toBe(6);
      expect(state.currentUrl?.visits).toBe(6);
    });
  });

  describe('async thunks', () => {
    // These tests would normally use mocked API responses
    // Here we're just testing the reducer behavior with mocked fulfilled/rejected actions

    it('should handle createUrl.fulfilled', () => {
      const mockUrl = { id: '1', slug: 'test', originalUrl: 'https://example.com' };
      
      // Dispatch fulfilled action
      store.dispatch({
        type: 'url/createUrl/fulfilled',
        payload: mockUrl,
      });

      // Check state
      const state = store.getState().url;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.urls).toContainEqual(mockUrl);
    });

    it('should handle createUrl.rejected', () => {
      // Dispatch rejected action
      store.dispatch({
        type: 'url/createUrl/rejected',
        payload: 'Error creating URL',
      });

      // Check state
      const state = store.getState().url;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Error creating URL');
    });

    it('should handle fetchUrls.fulfilled', () => {
      const mockUrls = [
        { id: '1', slug: 'test1', originalUrl: 'https://example1.com' },
        { id: '2', slug: 'test2', originalUrl: 'https://example2.com' },
      ];
      
      // Dispatch fulfilled action
      store.dispatch({
        type: 'url/fetchUrls/fulfilled',
        payload: mockUrls,
      });

      // Check state
      const state = store.getState().url;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.urls).toEqual(mockUrls);
    });

    it('should handle fetchUrlById.fulfilled', () => {
      const mockUrl = { id: '1', slug: 'test', originalUrl: 'https://example.com' };
      
      // Dispatch fulfilled action
      store.dispatch({
        type: 'url/fetchUrlById/fulfilled',
        payload: mockUrl,
      });

      // Check state
      const state = store.getState().url;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.currentUrl).toEqual(mockUrl);
    });

    it('should handle updateUrl.fulfilled', () => {
      // Setup initial state with URLs
      store.dispatch({
        type: 'url/fetchUrls/fulfilled',
        payload: [
          { id: '1', slug: 'test1', originalUrl: 'https://example1.com' },
          { id: '2', slug: 'test2', originalUrl: 'https://example2.com' },
        ],
      });

      const updatedUrl = { id: '1', slug: 'updated', originalUrl: 'https://example1.com' };
      
      // Dispatch fulfilled action
      store.dispatch({
        type: 'url/updateUrl/fulfilled',
        payload: updatedUrl,
      });

      // Check state
      const state = store.getState().url;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.urls.find(u => u.id === '1')?.slug).toBe('updated');
    });

    it('should handle deleteUrl.fulfilled', () => {
      // Setup initial state with URLs
      store.dispatch({
        type: 'url/fetchUrls/fulfilled',
        payload: [
          { id: '1', slug: 'test1', originalUrl: 'https://example1.com' },
          { id: '2', slug: 'test2', originalUrl: 'https://example2.com' },
        ],
      });
      
      // Dispatch fulfilled action
      store.dispatch({
        type: 'url/deleteUrl/fulfilled',
        payload: '1',
      });

      // Check state
      const state = store.getState().url;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.urls.length).toBe(1);
      expect(state.urls[0].id).toBe('2');
    });

    it('should handle fetchStats.fulfilled', () => {
      const mockStats = {
        totalUrls: 10,
        totalVisits: 100,
        topUrls: [
          { id: '1', slug: 'test1', visits: 50 },
          { id: '2', slug: 'test2', visits: 30 },
        ],
      };
      
      // Dispatch fulfilled action
      store.dispatch({
        type: 'url/fetchStats/fulfilled',
        payload: mockStats,
      });

      // Check state
      const state = store.getState().url;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.stats).toEqual(mockStats);
    });
  });
});
