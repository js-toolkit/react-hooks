import React, { useEffect, useMemo } from 'react';

export default function useMemoCleaner<T>(
  factory: () => [value: T, cleaner: (value: T) => void],
  deps: React.DependencyList | undefined
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [value, cleaner] = useMemo(factory, deps);

  useEffect(() => () => cleaner(value), [cleaner, value]);

  return value;
}
