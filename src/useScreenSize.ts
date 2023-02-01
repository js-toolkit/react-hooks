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

export function getScreenSize({ respectOrientation = true }: UseScreenSizeProps = {}): ScreenSize {
  const { width, height, orientation } = window.screen;

  if (respectOrientation) {
    const orientationType = orientation
      ? orientation.type
      : angleToOrientationType(window.orientation);
    if (
      (orientationType === 'landscape-primary' || orientationType === 'landscape-secondary') &&
      width < height
    ) {
      return { width: height, height: width };
    }
  }

  return { width, height };
}

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
