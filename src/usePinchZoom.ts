import { useEffect } from 'react';
import { EventListeners } from '@js-toolkit/web-utils/EventListeners';
import {
  getPinchZoomHandlers,
  type GetPinchZoomHandlersOptions,
} from '@js-toolkit/web-utils/getPinchZoomHandlers';
import useRefCallback from './useRefCallback';

export interface UsePinchZoomProps extends Pick<
  GetPinchZoomHandlersOptions,
  'canStart' | 'onUpdate' | 'onEnd' | 'acceleration'
> {
  readonly boundsRef: React.RefObject<HTMLElement | null>;
  readonly disabled: boolean;
  readonly getTargetBounds: () => DOMRect;
}

export default function usePinchZoom({
  boundsRef,
  disabled,
  acceleration = 1,
  getTargetBounds: getTargetBoundsProp,
  canStart: canStartProp,
  onUpdate: onUpdateProp,
  onEnd: onEndProp,
}: UsePinchZoomProps): void {
  const getTargetBounds = useRefCallback(getTargetBoundsProp);
  const canStart = useRefCallback(canStartProp);
  const onUpdate = useRefCallback(onUpdateProp);
  const onEnd = useRefCallback(onEndProp);

  useEffect(() => {
    if (disabled || !boundsRef.current) return undefined;

    const bounds = boundsRef.current;
    const listeners = new EventListeners();

    const pinchZoom = getPinchZoomHandlers({
      acceleration,
      canStart,
      getBounds: () => [getTargetBounds(), bounds.getBoundingClientRect()],
      onUpdate,
      onEnd: (x, y) => {
        onEnd(x, y);
        if (pinchZoom.getState() === undefined) {
          listeners.scope(document).removeAllListeners();
          listeners.scope(bounds, '@started').removeAllListeners();
        }
      },
    });

    listeners.scope(bounds).on(
      'touchstart',
      (startEvent) => {
        if (pinchZoom.getState() == null) {
          // listeners
          //   .scope(document)
          listeners
            .scope(bounds, '@started')
            .on('touchmove', pinchZoom.onTouchMove, { passive: false })
            .on('touchend', pinchZoom.onTouchEnd, { passive: false })
            .on('touchcancel', pinchZoom.onTouchEnd, { passive: false });
        }
        pinchZoom.onTouchStart(startEvent);
      },
      { passive: false }
    );

    return () => {
      listeners.removeAllListeners();
    };
  }, [acceleration, boundsRef, canStart, disabled, getTargetBounds, onEnd, onUpdate]);
}
