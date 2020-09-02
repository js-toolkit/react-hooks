// Origin: https://github.com/streamich/react-use/blob/master/src/useFullscreen.ts
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import fullscreen from '@vlazh/web-utils/fullscreen';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

export interface WebkitHTMLVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
  // webkitSupportsFullscreen?: boolean;
}

export interface Options extends FullscreenOptions {
  videoRef?: RefObject<WebkitHTMLVideoElement>;
  toggleNativeVideoSubtitles?: boolean;
  onChange?: (isFullscreen: boolean, video: boolean) => void;
  onError?: (error: Event) => void;
}

function toggleNativeSubtitles(enabled: boolean, textTracks: TextTrackList): void {
  console.log('toggleNativeSubtitles');
  for (let i = 0; i < textTracks.length; i += 1) {
    const track = textTracks[i];
    console.log(track.label, track.mode);
    if (enabled && track.mode === 'hidden') {
      track.mode = 'showing';
    } else if (!enabled && track.mode === 'showing') {
      track.mode = 'hidden';
    }
  }
  console.log('toggleNativeSubtitles end');
}

export default function useFullscreen(
  ref: RefObject<Element>,
  on: boolean,
  { videoRef, toggleNativeVideoSubtitles, onChange, onError, ...fullscreenOptions }: Options = {}
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
          onChange && onChange(value, false);
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
        onChange && onChange(true, true);
      };

      const endFullscreenHandler = (): void => {
        setFullscreen(false);
        onChange && onChange(false, true);
      };

      video.addEventListener('webkitbeginfullscreen', beginFullscreenHandler);
      video.addEventListener('webkitendfullscreen', endFullscreenHandler);

      return () => {
        video.removeEventListener('webkitbeginfullscreen', beginFullscreenHandler);
        video.removeEventListener('webkitendfullscreen', endFullscreenHandler);
        // setFullscreen(false);
        // video.webkitExitFullscreen();
      };
    }

    return noop;
  }, [onChange, onError, ref, videoRef]);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    if (fullscreen.isEnabled) {
      if (fullscreen.isFullscreen === on) return;

      if (on) {
        void fullscreen.request(ref.current, fullscreenOptionsRef.current);
      } else {
        void fullscreen.exit();
      }

      return;
    }

    const { current: video } = videoRef ?? {};
    if (video?.webkitEnterFullscreen && video.webkitExitFullscreen) {
      if (toggleNativeVideoSubtitles && video.textTracks.length > 0) {
        toggleNativeSubtitles(on, video.textTracks);
      }

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
      onChange && onChange(false, false);
    }
  }, [on, onChange, ref, toggleNativeVideoSubtitles, videoRef]);

  return isFullscreen;
}
