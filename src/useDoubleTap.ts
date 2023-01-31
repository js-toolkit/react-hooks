import React, { useCallback, useMemo, useRef } from 'react';

type BaseEvent = Pick<React.TouchEvent, 'timeStamp'>;
type BaseHandler<E> = (event: E) => any;

export default function useDoubleTap<
  E extends BaseEvent,
  H extends BaseHandler<E> = BaseHandler<E>
>(
  factory: () => {
    handler: H;
    tapHandler?: (...params: Parameters<H>) => boolean | void;
    /** Default `300` */
    delay?: number;
  },
  deps: React.DependencyList = []
): H {
  const lastTimeRef = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { handler, tapHandler, delay = 300 } = useMemo(factory, deps);

  return useCallback(
    (...params: Parameters<H>) => {
      const event = params[0];
      const currentTime = event.timeStamp;
      const delta = currentTime - lastTimeRef.current;
      const doubleClick = delta > 0 && delta <= delay;

      if (doubleClick) {
        lastTimeRef.current = 0;
        handler(event);
        return;
      }

      const res = tapHandler && tapHandler(...params);
      if (res === false) {
        lastTimeRef.current = 0;
        return;
      }

      lastTimeRef.current = currentTime;
    },
    [delay, handler, tapHandler]
  ) as H;
}
