import React, { useCallback, useLayoutEffect, useRef } from 'react';
import getInnerYDimensions from '@jstoolkit/web-utils/getInnerYDimensions';
import useUpdatedRefState from './useUpdatedRefState';

type SlideDirection = 'left' | 'right';

export interface UseMenuSlideAnimationProps<S> {
  readonly rootRef: React.RefObject<HTMLElement>;
  readonly contentRef: React.RefObject<HTMLElement>;
  readonly nextLevel?: number;
  readonly nextState: S;
  readonly transitionDuration?: number;
  readonly transitionEasing?: string;
}

export interface UseMenuSlideAnimationResult<S>
  extends Required<Pick<UseMenuSlideAnimationProps<S>, 'transitionDuration' | 'transitionEasing'>> {
  readonly onRootEntered: (node: HTMLElement) => void;
  readonly onContentEnter: (node: HTMLElement) => void;
  readonly onContentEntered: (node: HTMLElement) => void;
  readonly onContentExit: (node: HTMLElement) => void;
  readonly slideDirection: SlideDirection;
  readonly currentLevel: number;
  readonly currentState: S;
}

export default function useMenuSlideAnimation<S>(
  {
    rootRef,
    contentRef,
    nextLevel = 0,
    nextState,
    transitionDuration = 200,
    transitionEasing = 'ease',
  }: UseMenuSlideAnimationProps<S>,
  deps: React.DependencyList = []
): UseMenuSlideAnimationResult<S> {
  const [getState, setState] = useUpdatedRefState(() => nextState, deps); // eslint-disable-line react-hooks/exhaustive-deps

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

  const onContentEnter = useCallback(
    (node0: HTMLElement) => {
      const { current: root } = rootRef;
      if (!root) return;

      const node = node0;
      const { top, bottom } = getInnerYDimensions(root);

      root.style.height = `${node.offsetHeight + top + bottom}px`;

      node.style.position = 'absolute';
      node.style.width = '100%';
      node.style.height = `${node.offsetHeight}px`;
    },
    [rootRef]
  );

  const onContentEntered = useCallback((node0: HTMLElement) => {
    const node = node0;
    node.style.height = '100%';
  }, []);

  const onContentExit = useCallback(
    (node0: HTMLElement) => {
      const node = node0;
      const transition = `opacity ${transitionDuration / 2}ms ${transitionEasing}`;
      if (node.style.transition.indexOf(transition) < 0) {
        node.style.transition += (node.style.transition ? ', ' : '') + transition;
      }
      node.style.opacity = '0';
    },
    [transitionDuration, transitionEasing]
  );

  const onRootEntered = useCallback(
    (node: HTMLElement) => {
      const root = node;
      // const { current: root } = rootRef;
      // if (!root) return;
      const { current: content } = contentRef;
      if (!content) return;
      const transition = `width ${transitionDuration}ms ${transitionEasing}, height ${transitionDuration}ms ${transitionEasing}`;
      if (root.style.transition.indexOf(transition) < 0) {
        root.style.transition += (root.style.transition ? ', ' : '') + transition;
      }
      window.requestAnimationFrame(() => {
        onContentEnter(content);
        window.requestAnimationFrame(() => {
          onContentEntered(content);
        });
      });
    },
    [contentRef, onContentEnter, onContentEntered, transitionDuration, transitionEasing]
  );

  return {
    onRootEntered,
    onContentEnter,
    onContentEntered,
    onContentExit,
    slideDirection,
    currentLevel: lastLevelRef.current,
    currentState,
    transitionDuration,
    transitionEasing,
  };
}
