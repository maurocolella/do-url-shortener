import { useEffect, useState, useCallback } from 'react';

/**
 * Custom hook to detect when a browser tab becomes visible
 * and trigger a callback function
 * 
 * @param callback Function to call when tab becomes visible
 * @returns Object containing the current visibility state
 */
export const useTabVisibility = (callback: () => void) => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  const handleVisibilityChange = useCallback(() => {
    const visible = !document.hidden;
    setIsVisible(visible);
    
    // If tab becomes visible, trigger the callback
    if (visible) {
      callback();
    }
  }, [callback]);

  useEffect(() => {
    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return { isVisible };
};
