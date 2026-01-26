import { useEffect, useState, useCallback, useMemo } from 'react';
import { ViewSize } from '@js-toolkit/web-utils/responsive/ViewSize';
import { MediaQueryListener } from '@js-toolkit/web-utils/responsive/MediaQueryListener';
import {
  MediaQuery,
  type MediaQueryEventHandler,
} from '@js-toolkit/web-utils/responsive/MediaQuery';

export interface UseMediaQueryProps {
  localInstance?: boolean | undefined;
}

export type UseMediaQueryResult = [ViewSize, number];

export function useMediaQuery({ localInstance }: UseMediaQueryProps = {}): UseMediaQueryResult {
  const listener = useMemo(() => {
    if (localInstance) {
      return new MediaQueryListener();
    }
    MediaQuery.init();
    return MediaQuery;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [currentViewSize, setViewSize] = useState(() => listener.currentViewSize);

  const changeHandler = useCallback<MediaQueryEventHandler>(
    ({ matches, viewSize }) => matches && setViewSize(viewSize),
    []
  );

  useEffect(() => {
    listener.addListener(changeHandler);

    return () => {
      listener.removeListener(changeHandler);
    };
  }, [changeHandler, listener]);

  return useMemo(() => [currentViewSize, currentViewSize], [currentViewSize]);
}
