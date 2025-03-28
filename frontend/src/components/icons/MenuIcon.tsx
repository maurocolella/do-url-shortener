import React from 'react';
import { IconProps } from './types';

interface MenuIconProps extends IconProps {
  isOpen?: boolean;
}

const MenuIcon: React.FC<MenuIconProps> = ({ className = 'h-5 w-5', style, isOpen = false }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      style={style}
    >
      {isOpen ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
};

export default MenuIcon;
