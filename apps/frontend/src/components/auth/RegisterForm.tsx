import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';

const RegisterForm: React.FC = () => {
  const { register, loading, error } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(name, email, password);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Registrasi berhasil! Silakan login.', 'success');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1200);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="max-w-sm w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow relative">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="absolute left-4 top-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">Register</h2>
        <Input label="Name" value={name} onChange={e => setName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Button type="submit" disabled={loading} className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-700">
          {loading ? 'Loading...' : 'Register'}
        </Button>
        {ToastComponent}
      </form>
    </div>
  );
};

export default RegisterForm;
