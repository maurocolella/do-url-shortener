import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import useTabVisibility from './useTabVisibility';

describe('useTabVisibility', () => {
  let visibilityChangeCallback: EventListener | null = null;
  
  // Mock document.addEventListener to capture the visibilitychange callback
  const addEventListenerSpy = vi.spyOn(document, 'addEventListener').mockImplementation(
    (event, callback) => {
      if (event === 'visibilitychange') {
        visibilityChangeCallback = callback as EventListener;
      }
    }
  );
  
  // Mock document.removeEventListener
  const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener').mockImplementation(() => {});
  
  // Mock for document.visibilityState
  const originalVisibilityState = Object.getOwnPropertyDescriptor(document, 'visibilityState');
  
  beforeEach(() => {
    vi.clearAllMocks();
    visibilityChangeCallback = null;
    
    // Reset visibilityState mock before each test
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
  });
  
  afterAll(() => {
    // Restore original visibilityState property
    if (originalVisibilityState) {
      Object.defineProperty(document, 'visibilityState', originalVisibilityState);
    }
  });
  
  it('should add event listener on mount', () => {
    renderHook(() => useTabVisibility(() => {}));
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });
  
  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useTabVisibility(() => {}));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });
  
  it('should call callback when tab becomes visible', () => {
    const callback = vi.fn();
    renderHook(() => useTabVisibility(callback));
    
    // Ensure callback was captured
    expect(visibilityChangeCallback).not.toBeNull();
    
    // Mock document becoming visible
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    
    // Trigger the visibilitychange event
    if (visibilityChangeCallback) {
      visibilityChangeCallback(new Event('visibilitychange'));
    }
    
    // Callback should have been called
    expect(callback).toHaveBeenCalledTimes(1);
  });
  
  it('should not call callback when tab remains hidden', () => {
    const callback = vi.fn();
    renderHook(() => useTabVisibility(callback));
    
    // Ensure callback was captured
    expect(visibilityChangeCallback).not.toBeNull();
    
    // Keep document hidden
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    
    // Trigger the visibilitychange event
    if (visibilityChangeCallback) {
      visibilityChangeCallback(new Event('visibilitychange'));
    }
    
    // Callback should not have been called
    expect(callback).not.toHaveBeenCalled();
  });
  
  it('should not add event listener if callback is not provided', () => {
    renderHook(() => useTabVisibility(undefined));
    
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });
});
