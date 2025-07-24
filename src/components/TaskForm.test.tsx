import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskForm from './TaskForm';

const mockLists = [
  { id: 'a', name: 'List A' },
  { id: 'b', name: 'List B' },
];

describe('TaskForm', () => {
  it('renders form fields and list dropdown', () => {
    render(<TaskForm lists={mockLists} />);
    expect(screen.getByLabelText(/judul tugas/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('validates required fields', () => {
    render(<TaskForm lists={mockLists} />);
    fireEvent.click(screen.getByText(/simpan/i));
    expect(screen.getByText(/judul tugas wajib diisi/i)).toBeInTheDocument();
  });

  it('calls onSubmit with correct data', () => {
    const mockSubmit = jest.fn();
    render(<TaskForm lists={mockLists} onSubmit={mockSubmit} />);
    fireEvent.change(screen.getByLabelText(/judul tugas/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
    fireEvent.click(screen.getByText(/simpan/i));
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Task', listId: 'a' }));
  });

  it('shows error boundary fallback UI', () => {
    // Simulate error boundary by throwing error in child
    const ProblemChild = () => { throw new Error('Test error'); };
    const ErrorBoundary = require('../utils/ErrorBoundary').default;
    render(<ErrorBoundary><ProblemChild /></ErrorBoundary>);
    expect(screen.getByText(/terjadi kesalahan/i)).toBeInTheDocument();
  });
});
