import { useEffect, useMemo } from 'react';

export default function useObjectURL(getObject: () => Blob): string {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const url = useMemo(() => URL.createObjectURL(getObject()), []);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return url;
}
