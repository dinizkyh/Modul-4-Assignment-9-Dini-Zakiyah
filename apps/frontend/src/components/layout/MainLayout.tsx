import React from 'react';
import ThemeToggle from '../ui/ThemeToggle';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <header className="flex justify-between items-center px-4 py-3 shadow-sm bg-white dark:bg-gray-800">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Task Management App</h1>
      <ThemeToggle />
    </header>
    <main className="max-w-4xl mx-auto p-4 w-full">{children}</main>
  </div>
);

export default MainLayout;
