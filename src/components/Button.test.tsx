import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with label and icon', () => {
    render(<Button label="Simpan" icon="save" />);
    expect(screen.getByText(/Simpan/i)).toBeInTheDocument();
    expect(screen.getByTestId('icon-save')).toBeInTheDocument();
  });

  it('handles click event', () => {
    const mockClick = jest.fn();
    render(<Button label="Edit" onClick={mockClick} />);
    fireEvent.click(screen.getByText(/Edit/i));
    expect(mockClick).toHaveBeenCalled();
  });
});
