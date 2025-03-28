import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import urlReducer, {
  setSelectedUrl,
  resetUrlState,
} from './urlSlice';
import { IUrl } from '../../types/url.types';
import type { RootState } from '../index';

describe('urlSlice', () => {
  it('should handle initial state', () => {
    const store = configureStore({
      reducer: {
        url: urlReducer,
      },
    });
    
    const state = (store.getState() as Pick<RootState, 'url'>).url;
    expect(state.urls).toEqual([]);
    expect(state.selectedUrl).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
  
  it('should handle setSelectedUrl', () => {
    const store = configureStore({
      reducer: {
        url: urlReducer,
      },
    });
    
    const url: IUrl = {
      id: '1',
      shortUrl: 'https://short.url/abc123',
      originalUrl: 'https://example.com',
      slug: 'abc123',
      visits: 0,
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    store.dispatch(setSelectedUrl(url));
    const state = (store.getState() as Pick<RootState, 'url'>).url;
    expect(state.selectedUrl).toEqual(url);
  });
  
  it('should handle resetUrlState', () => {
    const store = configureStore({
      reducer: {
        url: urlReducer,
      },
    });
    
    const url: IUrl = {
      id: '1',
      shortUrl: 'https://short.url/abc123',
      originalUrl: 'https://example.com',
      slug: 'abc123',
      visits: 0,
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    store.dispatch(setSelectedUrl(url));
    const stateAfterSet = (store.getState() as Pick<RootState, 'url'>).url;
    expect(stateAfterSet.selectedUrl).toEqual(url);
    
    // Then reset
    store.dispatch(resetUrlState());
    const stateAfterReset = (store.getState() as Pick<RootState, 'url'>).url;
    expect(stateAfterReset.urls).toEqual([]);
    expect(stateAfterReset.selectedUrl).toBeNull();
    expect(stateAfterReset.loading).toBe(false);
    expect(stateAfterReset.error).toBeNull();
  });
});
