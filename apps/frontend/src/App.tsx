import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import TestComponent from './TestComponent';
import { useAuth } from './context/AuthContext';
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';

// Temporary components for initial setup
const Header: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Task Management App
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TestComponent />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Task Management
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Organize your tasks and boost your productivity
        </p>
        {user ? (
          <button onClick={logout} className="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition mb-8">Logout</button>
        ) : (
          <div className="flex justify-center gap-4 mb-8">
            <Link to="/register">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">Register</button>
            </Link>
            <Link to="/login">
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">Login</button>
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mx-auto max-w-2xl">
          <Link to="/lists" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition cursor-pointer block">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create Lists</h3>
            <p className="text-gray-600 dark:text-gray-300">Organize your tasks into different lists for better management</p>
          </Link>
          <Link to="/tasks" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition cursor-pointer block">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Manage Tasks</h3>
            <p className="text-gray-600 dark:text-gray-300">Add, edit, and track your tasks with due dates and completion status</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // ...existing code...
  // Lazy load list and task components
  const List = React.lazy(() => import('./components/lists/List'));
  const TaskList = React.lazy(() => import('./components/tasks/TaskList'));
  const AddTaskPage = React.lazy(() => import('./components/tasks/AddTaskPage'));
  const EditTaskPage = React.lazy(() => import('./components/tasks/EditTaskPage'));
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Header />
          <main>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/lists" element={<List />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/add" element={<AddTaskPage />} />
                <Route path="/tasks/edit/:taskId" element={<EditTaskPage />} />
              </Routes>
            </React.Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
