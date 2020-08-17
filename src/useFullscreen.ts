// Origin: https://github.com/streamich/react-use/blob/master/src/useFullscreen.ts
import { RefObject, useEffect, useState } from 'react';
import screenfullMaybe, { Screenfull } from 'screenfull';

function isFullscreenEnabled(screenfull: typeof screenfullMaybe): screenfull is Screenfull {
  return screenfull.isEnabled;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

export interface FullScreenOptions {
  videoRef?: RefObject<
    HTMLVideoElement & { webkitEnterFullscreen?: () => void; webkitExitFullscreen?: () => void }
  >;
  onChange?: (isFullscreen: boolean) => void;
  onError?: (error: Event) => void;
}

export default function useFullscreen(
  ref: RefObject<Element>,
  on: boolean,
  { videoRef, onChange, onError }: FullScreenOptions = {}
): boolean {
  const [isFullscreen, setFullscreen] = useState(on);

  useEffect(() => {
    if (!ref.current) {
      return noop;
    }

    if (isFullscreenEnabled(screenfullMaybe)) {
      const screenfull = screenfullMaybe;

      const changeHandler = (): void => {
        const value = screenfull.isFullscreen;
        setFullscreen(value);
        onChange && onChange(value);
      };

      screenfull.on('change', changeHandler);
      onError && screenfull.on('error', onError);

      return () => {
        screenfull.off('change', changeHandler);
        onError && screenfull.off('error', onError);
        // setFullscreen(false);
        screenfull.exit();
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
          video.webkitExitFullscreen();
        }
      };
    }

    return noop;
  }, [onChange, onError, ref, videoRef]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (isFullscreenEnabled(screenfullMaybe)) {
      const screenfull = screenfullMaybe;

      if (on) {
        screenfull.request(ref.current);
      } else {
        screenfull.exit();
      }

      return;
    }

    const { current: video } = videoRef ?? {};
    if (video?.webkitEnterFullscreen && video.webkitExitFullscreen) {
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
