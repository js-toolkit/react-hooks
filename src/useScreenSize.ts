import { useEffect } from 'react';
import { rafCallback } from '@js-toolkit/web-utils/rafCallback';
import {
  getScreenSize,
  type GetScreenSizeProps,
  type ScreenSize,
} from '@js-toolkit/web-utils/getScreenSize';
import useRefState from './useRefState';

export type { ScreenSize };

export type UseScreenSizeProps = GetScreenSizeProps;

export default function useScreenSize({
  respectOrientation = true,
}: UseScreenSizeProps = {}): ScreenSize {
  const [getSize, setSize] = useRefState<ScreenSize>(getScreenSize);

  useEffect(() => {
    const changeHandler = rafCallback(() => {
      const nextSize = getScreenSize({ respectOrientation });
      const prevSize = getSize();
      if (prevSize.width !== nextSize.width || prevSize.height !== nextSize.height) {
        setSize(nextSize);
      }
    });

    if (window.screen.orientation) {
      window.screen.orientation.addEventListener('change', changeHandler);
    } else {
      window.addEventListener('orientationchange', changeHandler);
    }

    return () => {
      changeHandler.cancel();
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', changeHandler);
      } else {
        window.removeEventListener('orientationchange', changeHandler);
      }
    };
  }, [getSize, respectOrientation, setSize]);

  return getSize();
}
