// Origin: https://github.com/streamich/react-use/blob/master/src/useFullscreen.ts
import { RefObject, useEffect, useRef, useState } from 'react';
import fullscreen from '@vlazh/web-utils/fullscreen';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

export interface WebkitHTMLVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
}

export interface Options extends FullscreenOptions {
  videoRef?: RefObject<WebkitHTMLVideoElement>;
  onChange?: (isFullscreen: boolean) => void;
  onError?: (error: Event) => void;
}

export default function useFullscreen(
  ref: RefObject<Element>,
  on: boolean,
  { videoRef, onChange, onError, ...fullscreenOptions }: Options = {}
): boolean {
  const [isFullscreen, setFullscreen] = useState(!!on);
  const fullscreenOptionsRef = useRef(fullscreenOptions);
  fullscreenOptionsRef.current = fullscreenOptions;

  useEffect(() => {
    if (!ref.current) {
      return noop;
    }

    if (fullscreen.isEnabled) {
      const changeHandler = (): void => {
        const value = fullscreen.isFullscreen;
        // console.log(value, document.fullscreenElement?.scrollHeight);
        // Update state on next tick in order for wait until browser complete dom operations
        setTimeout(() => {
          setFullscreen(value);
          onChange && onChange(value);
        }, 0);
      };

      fullscreen.on('change', changeHandler);
      onError && fullscreen.on('error', onError);

      return () => {
        fullscreen.off('change', changeHandler);
        onError && fullscreen.off('error', onError);
        // setFullscreen(false);
        // void screenfull.exit();
      };
    }

    const { current: video } = videoRef ?? {};
    if (video?.webkitEnterFullscreen) {
      const beginFullscreenHandler = (): void => {
        setFullscreen(true);
        onChange && onChange(true);
      };

      const endFullscreenHandler = (): void => {
        setFullscreen(false);
        onChange && onChange(false);
      };

      video.addEventListener('webkitbeginfullscreen', beginFullscreenHandler);
      video.addEventListener('webkitendfullscreen', endFullscreenHandler);

      return () => {
        if (video.webkitExitFullscreen) {
          video.removeEventListener('webkitbeginfullscreen', beginFullscreenHandler);
          video.removeEventListener('webkitendfullscreen', endFullscreenHandler);
          // setFullscreen(false);
          // video.webkitExitFullscreen();
        }
      };
    }

    return noop;
  }, [onChange, onError, ref, videoRef]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (fullscreen.isEnabled) {
      if (fullscreen.isFullscreen === on) return;
      // console.log('on', on);

      if (on) {
        void fullscreen.request(ref.current, fullscreenOptionsRef.current);
      } else {
        void fullscreen.exit();
      }

      return;
    }

    const { current: video } = videoRef ?? {};
    if (video?.webkitEnterFullscreen && video.webkitExitFullscreen) {
      if (video.webkitDisplayingFullscreen === on) return;

      if (on) {
        video.webkitEnterFullscreen();
      } else {
        video.webkitExitFullscreen();
      }

      return;
    }

    // If 'on' but not worked
    if (on) {
      setFullscreen(false);
      onChange && onChange(false);
    }
  }, [on, onChange, ref, videoRef]);

  return isFullscreen;
}
