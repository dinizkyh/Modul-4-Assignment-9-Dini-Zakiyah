import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListSelect from './ListSelect';

const mockLists = [
  { id: 'a', name: 'List A' },
  { id: 'b', name: 'List B' },
  { id: 'c', name: 'List C' },
  { id: 'd', name: 'List D' },
  { id: 'e', name: 'List E' },
  { id: 'f', name: 'List F' },
];

describe('ListSelect', () => {
  it('renders all lists and is scrollable', () => {
    render(<ListSelect lists={mockLists} />);
    mockLists.forEach(list => {
      expect(screen.getByText(list.name)).toBeInTheDocument();
    });
    // Check scrollable by class (assume .scrollable-dropdown)
    expect(screen.getByRole('combobox').className).toMatch(/scrollable-dropdown/);
  });

  it('shows default option', () => {
    render(<ListSelect lists={mockLists} />);
    expect(screen.getByText(/Pilih List/i)).toBeInTheDocument();
  });

  it('handles selection change', () => {
    const mockChange = jest.fn();
    render(<ListSelect lists={mockLists} onChange={mockChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'c' } });
    expect(mockChange).toHaveBeenCalledWith('c');
  });
});
