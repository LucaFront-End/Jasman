import { useRef } from 'react';

// Simplified - no scroll animations for now, just returns a ref
export function useScrollReveal() {
  return useRef(null);
}
