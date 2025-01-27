import React from 'react';
import useRefCallback from './useRefCallback';

export default function useIsFirstMount(): () => boolean {
  const firstRef = React.useRef(true);
  const countRef = React.useRef(0);

  if (firstRef.current) {
    countRef.current += 1;
    if (countRef.current > 1) {
      firstRef.current = false;
    }
  }

  return useRefCallback(() => firstRef.current);
}
