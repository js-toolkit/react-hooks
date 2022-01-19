import { RefObject, useEffect, useRef, useState } from 'react';
import noop from '@js-toolkit/utils/noop';
import FullscreenController, {
  FullscreenRequestOptions,
} from '@js-toolkit/web-utils/FullscreenController';
import useUpdatedRef from './useUpdatedRef';

export interface UseFullscreenOptions extends FullscreenRequestOptions {
  videoRef?: RefObject<HTMLVideoElement>;
  /** Update state on next tick in order for wait until browser complete dom operations. */
  async?: boolean | number;
  onChange?: (isFullscreen: boolean, video: boolean) => void;
  onError?: (error: unknown) => void;
}

export default function useFullscreen(
  ref: RefObject<Element>,
  on: boolean,
  { videoRef, async, onChange, onError, ...fullscreenOptions }: UseFullscreenOptions = {}
): boolean {
  const [isFullscreenOn, setFullscreen] = useState(!!on);
  const fullscreenOptionsRef = useUpdatedRef(fullscreenOptions);
  const controllerRef = useRef<FullscreenController>();

  useEffect(() => {
    if (!ref.current) return noop;
    if (!controllerRef.current) {
      controllerRef.current = new FullscreenController(ref.current, videoRef?.current || undefined);
    }
    const { current: controller } = controllerRef;

    const update = (value: boolean, video: boolean): void => {
      setFullscreen(value);
      onChange && onChange(value, video);
    };

    controller.on(controller.Events.Change, ({ isFullscreen, video }) => {
      // console.log(value, document.fullscreenElement?.scrollHeight);
      if (typeof async === 'number' || async === true) {
        // Update state on next tick in order for wait until browser complete dom operations
        setTimeout(() => update(isFullscreen, video), typeof async === 'number' ? async : 0);
      } else {
        update(isFullscreen, video);
      }
    });

    onError && controller.on(controller.Events.Error, ({ error }) => onError(error));

    return () => {
      controller.removeAllListeners();
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
