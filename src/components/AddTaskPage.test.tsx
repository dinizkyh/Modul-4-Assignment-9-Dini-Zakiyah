import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddTaskPage from './AddTaskPage';

const mockLists = [
  { id: 'a', name: 'List A' },
  { id: 'b', name: 'List B' },
];

describe('AddTaskPage', () => {
  it('renders add task form', () => {
    render(<AddTaskPage lists={mockLists} />);
    expect(screen.getByLabelText(/judul tugas/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles save and back', () => {
    const mockSave = jest.fn();
    const mockBack = jest.fn();
    render(<AddTaskPage lists={mockLists} onSave={mockSave} onBack={mockBack} />);
    fireEvent.change(screen.getByLabelText(/judul tugas/i), { target: { value: 'New Task' } });
    fireEvent.click(screen.getByText(/simpan/i));
    expect(mockSave).toHaveBeenCalled();
    fireEvent.click(screen.getByText(/kembali/i));
    expect(mockBack).toHaveBeenCalled();
  });
});
