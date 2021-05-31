import { useRef } from 'react';

export default function useFirstRender(): boolean {
  const isFirstRef = useRef(true);

  if (isFirstRef.current) {
    isFirstRef.current = false;
    return true;
  }

  return isFirstRef.current;
}
