import React, { useEffect, useMemo } from 'react';

export default function useObjectURL(
  getObject: () => Blob,
  deps: React.DependencyList = []
): string {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const url = useMemo(() => URL.createObjectURL(getObject()), deps);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return url;
}
