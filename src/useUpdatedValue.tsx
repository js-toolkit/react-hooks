import React from 'react';
import useUpdatedRefValue from './useUpdatedRefValue';

export default function useUpdatedValue<S>(
  value: S | ((prevValue?: S) => S),
  deps: React.DependencyList = []
): S {
  return useUpdatedRefValue(value, deps).current;
}
