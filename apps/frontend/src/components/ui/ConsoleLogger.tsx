import React from 'react';

export function logErrorToConsole(error: any, context?: string) {
  // Logging error for debugging AI
  console.error(`[Error${context ? `: ${context}` : ''}]`, error);
}
