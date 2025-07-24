import React from 'react';
import { colors, radii } from '../../theme/tokens';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
}

const typeStyles = {
  success: `bg-[${colors.success.DEFAULT}] text-white`,
  error: `bg-[${colors.error.DEFAULT}] text-white`,
  info: `bg-[${colors.info.DEFAULT}] text-white`,
  warning: `bg-[${colors.warning.DEFAULT}] text-white`,
};

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-[${radii.md}] shadow-lg ${typeStyles[type]}`}>
    <span>{message}</span>
    {onClose && (
      <button
        onClick={onClose}
        className="ml-4 text-white font-bold"
        aria-label="Close"
      >
        ×
      </button>
    )}
  </div>
);

export default Toast;
