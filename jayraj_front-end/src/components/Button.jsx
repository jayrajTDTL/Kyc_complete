import React from 'react';
import '../styles/Button.css';

export const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
