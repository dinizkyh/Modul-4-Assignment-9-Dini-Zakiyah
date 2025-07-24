import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditTaskPage from './EditTaskPage';

const mockTask = { id: '1', title: 'Edit Me', completed: false, deadline: '2025-07-30', listId: 'a' };
const mockLists = [
  { id: 'a', name: 'List A' },
  { id: 'b', name: 'List B' },
];

describe('EditTaskPage', () => {
  it('renders edit form with initial data', () => {
    render(<EditTaskPage task={mockTask} lists={mockLists} />);
    expect(screen.getByDisplayValue('Edit Me')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-07-30')).toBeInTheDocument();
  });

  it('handles save and cancel', () => {
    const mockSave = jest.fn();
    const mockCancel = jest.fn();
    render(<EditTaskPage task={mockTask} lists={mockLists} onSave={mockSave} onCancel={mockCancel} />);
    fireEvent.change(screen.getByLabelText(/judul tugas/i), { target: { value: 'Edited Task' } });
    fireEvent.click(screen.getByText(/simpan/i));
    expect(mockSave).toHaveBeenCalled();
    fireEvent.click(screen.getByText(/batal/i));
    expect(mockCancel).toHaveBeenCalled();
  });
});
