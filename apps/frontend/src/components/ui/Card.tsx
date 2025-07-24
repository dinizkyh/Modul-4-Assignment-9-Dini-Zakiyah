import React from 'react';
import { colors, radii } from '../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div
    className={`bg-white dark:bg-[${colors.background.cardDark}] rounded-[${radii.lg}] shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
  >
    {children}
  </div>
);

export default Card;
