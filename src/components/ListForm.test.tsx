import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListForm from './ListForm';

describe('ListForm', () => {
  it('renders input field', () => {
    render(<ListForm />);
    expect(screen.getByLabelText(/nama daftar/i)).toBeInTheDocument();
  });

  it('validates required field', () => {
    render(<ListForm />);
    fireEvent.click(screen.getByText(/simpan/i));
    expect(screen.getByText(/nama daftar wajib diisi/i)).toBeInTheDocument();
  });

  it('calls onSubmit with correct data', () => {
    const mockSubmit = jest.fn();
    render(<ListForm onSubmit={mockSubmit} />);
    fireEvent.change(screen.getByLabelText(/nama daftar/i), { target: { value: 'List Baru' } });
    fireEvent.click(screen.getByText(/simpan/i));
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'List Baru' }));
  });
});
