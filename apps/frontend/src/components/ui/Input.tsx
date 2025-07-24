import React from 'react';
import { colors, radii, fontSizes } from '../../theme/tokens';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>}
    <input
      className={`w-full px-3 py-2 rounded-[${radii.md}] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-[${colors.primary.DEFAULT}] ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-red-600 dark:text-red-400 mt-1 block">{error}</span>}
  </div>
);

export default Input;
