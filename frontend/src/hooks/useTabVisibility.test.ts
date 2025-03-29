import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';

// Mock React hooks
vi.mock('react', () => {
  const originalModule = vi.importActual('react');
  return {
    ...originalModule,
    useState: vi.fn().mockImplementation((initialValue) => [initialValue, vi.fn()]),
    useEffect: vi.fn().mockImplementation((callback) => callback()),
    useCallback: vi.fn().mockImplementation((callback) => callback),
  };
});

// Mock the document object
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Import the hook after mocking React
import { useTabVisibility } from './useTabVisibility';

describe('useTabVisibility', () => {
  // Store the original document
  const originalDocument = global.document;
  
  beforeEach(() => {
    // Create a mock document
    global.document = {
      hidden: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    } as unknown as Document;
    
    // Clear mocks before each test
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore the original document
    global.document = originalDocument;
  });
  
  it('should add event listener on mount', () => {
    const callback = vi.fn();
    useTabVisibility(callback);
    
    expect(mockAddEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });
  
  it('should remove event listener on unmount', () => {
    const callback = vi.fn();
    
    // Mock useEffect to capture the cleanup function
    const mockUseEffect = vi.fn().mockImplementation((fn) => {
      const cleanup = fn();
      return cleanup;
    });
    
    // Replace useEffect with our mock
    vi.spyOn(React, 'useEffect').mockImplementation(mockUseEffect);
    
    useTabVisibility(callback);
    
    // Get the cleanup function that was returned from useEffect
    const cleanup = mockUseEffect.mock.results[0].value;
    
    // Call the cleanup function
    if (typeof cleanup === 'function') {
      cleanup();
    }
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    
    // Restore the original useEffect
    vi.mocked(React.useEffect).mockRestore();
  });
  
  it('should call callback when tab becomes visible', () => {
    // Capture the visibilitychange handler
    let visibilityHandler: ((event: Event) => void) | null = null;
    mockAddEventListener.mockImplementation((event, handler) => {
      if (event === 'visibilitychange') {
        visibilityHandler = handler as (event: Event) => void;
      }
    });
    
    const callback = vi.fn();
    useTabVisibility(callback);
    
    // Ensure handler was captured
    expect(visibilityHandler).not.toBeNull();
    
    // Set document to not hidden
    Object.defineProperty(document, 'hidden', { value: false });
    
    // Trigger the visibilitychange event
    if (visibilityHandler) {
      // Create a mock event
      const mockEvent = {} as Event;
      (visibilityHandler as (event: Event) => void)(mockEvent);
    }
    
    // Callback should have been called
    expect(callback).toHaveBeenCalledTimes(1);
  });
  
  it('should not call callback when tab remains hidden', () => {
    // Capture the visibilitychange handler
    let visibilityHandler: ((event: Event) => void) | null = null;
    mockAddEventListener.mockImplementation((event, handler) => {
      if (event === 'visibilitychange') {
        visibilityHandler = handler as (event: Event) => void;
      }
    });
    
    const callback = vi.fn();
    useTabVisibility(callback);
    
    // Ensure handler was captured
    expect(visibilityHandler).not.toBeNull();
    
    // Set document to hidden
    Object.defineProperty(document, 'hidden', { value: true });
    
    // Trigger the visibilitychange event
    if (visibilityHandler) {
      // Create a mock event
      const mockEvent = {} as Event;
      (visibilityHandler as (event: Event) => void)(mockEvent);
    }
    
    // Callback should not have been called
    expect(callback).not.toHaveBeenCalled();
  });
  
  it('should add event listener when initialized with a callback', () => {
    const mockCallback = vi.fn();
    useTabVisibility(mockCallback);
    
    expect(mockAddEventListener).toHaveBeenCalled();
  });
});
