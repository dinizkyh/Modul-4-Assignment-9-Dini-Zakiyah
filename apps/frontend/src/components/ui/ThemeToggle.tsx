import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import Button from './Button';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="secondary" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </Button>
  );
};

export default ThemeToggle;
