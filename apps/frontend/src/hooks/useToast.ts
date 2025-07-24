import React, { useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<'success' | 'error' | null>(null);

  function showToast(msg: string, t: 'success' | 'error') {
    setMessage(msg);
    setType(t);
    setTimeout(() => setMessage(null), 3000);
  }

  const ToastComponent = message
    ? React.createElement(
        'div',
        {
          className:
            `fixed top-4 right-4 px-4 py-2 rounded shadow text-white ` +
            (type === 'error' ? 'bg-red-600' : 'bg-green-600'),
        },
        message
      )
    : null;

  return { showToast, ToastComponent };
}
