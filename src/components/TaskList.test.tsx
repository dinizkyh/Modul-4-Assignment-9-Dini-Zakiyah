import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from './TaskList';

const mockTasks = [
  { id: '1', title: 'Task 1', completed: false, deadline: '2025-07-30', listId: 'a' },
  { id: '2', title: 'Task 2', completed: true, deadline: '2025-07-31', listId: 'a' },
];
const mockLists = [
  { id: 'a', name: 'List A' },
  { id: 'b', name: 'List B' },
];

describe('TaskList', () => {
  it('renders tasks and lists correctly', () => {
    render(<TaskList tasks={mockTasks} lists={mockLists} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('List A')).toBeInTheDocument();
  });

  it('handles list selection', () => {
    render(<TaskList tasks={mockTasks} lists={mockLists} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } });
    expect(screen.getByText('List B')).toBeInTheDocument();
  });

  it('handles edit button click', () => {
    const mockEdit = jest.fn();
    render(<TaskList tasks={mockTasks} lists={mockLists} onEdit={mockEdit} />);
    fireEvent.click(screen.getAllByText('Edit')[0]);
    expect(mockEdit).toHaveBeenCalled();
  });

  it('shows empty state when no tasks', () => {
    render(<TaskList tasks={[]} lists={mockLists} />);
    expect(screen.getByText(/belum memiliki daftar tugas/i)).toBeInTheDocument();
  });
});
