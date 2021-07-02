import React, { useMemo, useRef } from 'react';

export default function useUpdatedValue<S>(
  value: S | ((prevValue?: S) => S),
  deps: React.DependencyList = []
): S {
  const valueRef = useRef<S>(undefined as unknown as S);

  // Update Ref during render
  useMemo(() => {
    valueRef.current =
      typeof value === 'function' ? (value as (prev?: S) => S)(valueRef.current) : value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return valueRef.current;
}
