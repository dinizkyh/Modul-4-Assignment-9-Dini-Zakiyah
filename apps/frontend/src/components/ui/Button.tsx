import React from 'react';
import { colors, radii, fontSizes, fontWeights, spacing } from '../../theme/tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: `px-3 py-1 text-sm`,
  md: `px-4 py-2 text-base`,
  lg: `px-6 py-3 text-lg`,
};

const variantStyles = {
  primary: `bg-[${colors.primary.DEFAULT}] text-white hover:bg-[${colors.primary.dark}]`,
  secondary: `bg-[${colors.secondary.DEFAULT}] text-white hover:bg-[${colors.secondary.dark}]`,
  success: `bg-[${colors.success.DEFAULT}] text-white hover:bg-[${colors.success.dark}]`,
  error: `bg-[${colors.error.DEFAULT}] text-white hover:bg-[${colors.error.dark}]`,
  warning: `bg-[${colors.warning.DEFAULT}] text-white hover:bg-[${colors.warning.dark}]`,
  info: `bg-[${colors.info.DEFAULT}] text-white hover:bg-[${colors.info.dark}]`,
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => (
  <button
    className={`rounded-[${radii.md}] font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${colors.primary.DEFAULT}] ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
