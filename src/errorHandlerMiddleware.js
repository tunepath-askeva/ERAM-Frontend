// errorHandlerMiddleware.js
import { isRejectedWithValue } from '@reduxjs/toolkit';

export const rtkQueryErrorHandler = (api) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const { status } = action.payload || {};
    
    if (status === 401) {
      // Dispatch a custom event that ErrorBoundary can listen to
      window.dispatchEvent(new CustomEvent('unauthorized', { 
        detail: { status: 401 } 
      }));
    }
  }

  return next(action);
};