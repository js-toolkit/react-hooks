import { useLayoutEffect, useRef } from 'react';
import useUpdatedRefState from './useUpdatedRefState';

type SlideDirection = 'left' | 'right';

export interface UseSlideAnimationDirectionProps<S> {
  readonly nextLevel?: number;
  readonly nextState: S;
}

export interface UseSlideAnimationDirectionResult<S> {
  readonly slideDirection: SlideDirection;
  readonly currentLevel: number;
  readonly currentState: S;
}

export default function useSlideAnimationDirection<S>(
  { nextLevel = 0, nextState }: UseSlideAnimationDirectionProps<S>,
  deps: React.DependencyList = []
): UseSlideAnimationDirectionResult<S> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [getState, setState] = useUpdatedRefState(() => nextState, deps);

  const currentState = getState();

  const lastLevelRef = useRef(nextLevel);

  const propsStateUpdated = currentState === nextState;

  const slideDirection: SlideDirection =
    // Pre update (for exit animation)
    (!propsStateUpdated && (lastLevelRef.current < nextLevel ? 'right' : 'left')) ||
    // On update (for enter animation)
    (lastLevelRef.current < nextLevel ? 'left' : 'right');

  if (propsStateUpdated) {
    lastLevelRef.current = nextLevel;
  }

  useLayoutEffect(() => {
    setState(nextState);
  }, [nextState, setState]);

  return {
    slideDirection,
    currentLevel: lastLevelRef.current,
    currentState,
  };
}
