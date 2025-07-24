import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

describe('Input', () => {
  it('renders with label and value', () => {
    render(<Input label="Judul" value="Test" />);
    expect(screen.getByLabelText(/Judul/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
  });

  it('handles change event', () => {
    const mockChange = jest.fn();
    render(<Input label="Judul" onChange={mockChange} />);
    fireEvent.change(screen.getByLabelText(/Judul/i), { target: { value: 'Baru' } });
    expect(mockChange).toHaveBeenCalled();
  });
});
