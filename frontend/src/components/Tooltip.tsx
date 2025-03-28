import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleShow = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  const handleHide = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, delay);
  };

  // Position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-1';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-1';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-1';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-1';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-1';
    }
  };

  // Arrow position
  const getArrowStyles = () => {
    switch (position) {
      case 'top':
        return 'absolute left-1/2 bottom-0 transform translate-y-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-slate-800';
      case 'right':
        return 'absolute right-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-slate-800';
      case 'bottom':
        return 'absolute left-1/2 top-0 transform -translate-y-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-slate-800';
      case 'left':
        return 'absolute left-full top-1/2 transform -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-slate-800';
      default:
        return 'absolute left-1/2 bottom-0 transform translate-y-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-slate-800';
    }
  };

  return (
    <div className="relative inline-block" onMouseEnter={handleShow} onMouseLeave={handleHide}>
      {children}
      {isVisible && (
        <div 
          className={`absolute z-10 bg-slate-800 text-white text-xs rounded py-1 px-2 min-w-max max-w-xs ${getPositionStyles()} ${className}`}
          onMouseEnter={handleShow}
          onMouseLeave={handleHide}
        >
          <div className={getArrowStyles()}></div>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
