import { useEffect, useState } from 'react';

export type ScreenSize = Pick<Screen, 'width' | 'height'>;

export default function useScreenSize(): ScreenSize {
  const [size, setSize] = useState<ScreenSize>({
    width: window.screen.width,
    height: window.screen.height,
  });

  useEffect(() => {
    const changeHandler = (): void => {
      const { width, height } = window.screen;
      setSize({ width, height });
    };

    window.addEventListener('orientationchange', changeHandler);

    return () => {
      window.removeEventListener('orientationchange', changeHandler);
    };
  }, []);

  return size;
}
