import { type RefObject, useEffect, useRef, useState } from 'react';
import { noop } from '@js-toolkit/utils/noop';
import { FullscreenController } from '@js-toolkit/web-utils/FullscreenController';
import useUpdatedRef from './useUpdatedRef';

export interface UseFullscreenOptions extends FullscreenController.RequestOptions {
  videoRef?: RefObject<HTMLVideoElement>;
  /** Update state on next tick in order for wait until browser complete dom operations. */
  async?: boolean | number;
  onChange?: (isFullscreen: boolean, video: boolean) => void;
  onError?: (error: unknown) => void;
}

export default function useFullscreen(
  refOrController: RefObject<Element> | FullscreenController,
  on: boolean,
  { videoRef, async, onChange, onError, ...fullscreenOptions }: UseFullscreenOptions = {}
): boolean {
  const [isFullscreenOn, setFullscreen] = useState(!!on);
  const fullscreenOptionsRef = useUpdatedRef(fullscreenOptions);

  const ref = 'current' in refOrController ? refOrController : undefined;
  const controllerRef = useRef<FullscreenController | undefined>(
    'current' in refOrController ? undefined : refOrController
  );

  useEffect(() => {
    if (!ref && !controllerRef.current) return noop;
    if (!controllerRef.current) {
      if (!ref?.current) return noop;
      controllerRef.current = new FullscreenController(ref.current, {
        fallback: videoRef?.current || undefined,
      });
    }
    const { current: controller } = controllerRef;

    const update = (value: boolean, video: boolean): void => {
      setFullscreen(value);
      onChange && onChange(value, video);
    };

    const changeHandler: FullscreenController.EventHandler<FullscreenController.Events.Change> = ({
      fullscreen,
      type,
    }) => {
      // console.log(value, document.fullscreenElement?.scrollHeight);
      if (typeof async === 'number' || async === true) {
        // Update state on next tick in order for wait until browser complete dom operations
        setTimeout(
          () => update(fullscreen, type === 'video'),
          typeof async === 'number' ? async : 0
        );
      } else {
        update(fullscreen, type === 'video');
      }
    };

    const errorHandler: FullscreenController.EventHandler<FullscreenController.Events.Error> = ({
      error,
    }) => {
      onError && onError(error);
    };

    controller.on(controller.Events.Change, changeHandler);
    onError && controller.on(controller.Events.Error, errorHandler);

    return () => {
      controller.off(controller.Events.Change, changeHandler);
      controller.off(controller.Events.Error, errorHandler);
      if (!ref) {
        void controller.destroy();
      }
    };
  }, [async, onChange, onError, ref, videoRef]);

  useEffect(() => {
    const { current: controller } = controllerRef;
    if (!controller) return;

    if (on) {
      void controller.request(fullscreenOptionsRef.current).catch(() => {
        setFullscreen(false);
        onChange && onChange(false, false);
      });
    } else {
      void controller.exit();
    }
  }, [fullscreenOptionsRef, on, onChange]);

  return isFullscreenOn;
}
