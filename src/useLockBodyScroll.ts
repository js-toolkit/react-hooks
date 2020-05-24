// https://usehooks.com/useLockBodyScroll/
import { useLayoutEffect } from 'react';

export interface UseLockBodyScrollProps {
  enabled?: boolean;
}

export default function useLockBodyScroll({ enabled = true }: UseLockBodyScrollProps = {}): void {
  useLayoutEffect(() => {
    let originalStyle: string;
    if (enabled) {
      // Get original body overflow
      originalStyle = window.getComputedStyle(document.body).overflow;
      // Prevent scrolling on mount
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (enabled) {
        // Re-enable scrolling when component unmounts
        document.body.style.overflow = originalStyle;
      }
    };
  }, [enabled]);
}
