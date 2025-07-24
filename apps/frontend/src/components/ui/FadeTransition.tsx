import React from 'react';

const FadeTransition: React.FC<{ show: boolean; children: React.ReactNode }> = ({ show, children }) => (
  <div
    style={{
      transition: 'opacity 0.3s',
      opacity: show ? 1 : 0,
      pointerEvents: show ? 'auto' : 'none',
    }}
  >
    {children}
  </div>
);

export default FadeTransition;
