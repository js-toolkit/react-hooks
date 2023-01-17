import { useEffect } from 'react';
import { rafCallback } from '@jstoolkit/web-utils/rafCallback';
import useRefState from './useRefState';

export type ScreenSize = Pick<Screen, 'width' | 'height'>;

export interface UseScreenSizeProps {
  readonly respectOrientation?: boolean;
}

function angleToOrientationType(angle: number): OrientationType | undefined {
  if (angle === 0) return 'portrait-primary';
  if (angle === 180) return 'portrait-secondary';
  if (angle === 90) return 'landscape-primary';
  if (angle === -90) return 'landscape-secondary';
  return undefined;
}

export default function useScreenSize({
  respectOrientation = true,
}: UseScreenSizeProps = {}): ScreenSize {
  const [getSize, setSize] = useRefState<ScreenSize>(() => ({
    width: window.screen.width,
    height: window.screen.height,
  }));

  useEffect(() => {
    const updateSize = (width: number, height: number): void => {
      const prevSize = getSize();
      if (prevSize.width === width && prevSize.height === height) return;
      setSize({ width, height });
    };

    const changeHandler = rafCallback(() => {
      const { width, height, orientation } = window.screen;

      if (!respectOrientation) {
        updateSize(width, height);
        return;
      }

      const orientationType = orientation
        ? orientation.type
        : angleToOrientationType(window.orientation);
      if (
        (orientationType === 'landscape-primary' || orientationType === 'landscape-secondary') &&
        width < height
      ) {
        updateSize(height, width);
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
