import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders app title', () => {
    render(<Header />);
    expect(screen.getByText(/Task Management/i)).toBeInTheDocument();
  });

  it('toggles dark mode', () => {
    render(<Header />);
    const toggleBtn = screen.getByRole('button', { name: /dark mode/i });
    fireEvent.click(toggleBtn);
    expect(document.body.className).toMatch(/dark/);
  });
});
