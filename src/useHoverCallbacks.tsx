export type UseHoverCallbacksProps<T> = [
  onenter?: React.MouseEventHandler<T>,
  onleave?: React.MouseEventHandler<T>
];

export type UseHoverCallbacksResult<T> = Pick<
  React.HTMLAttributes<T>,
  'onMouseEnter' | 'onMouseLeave'
>;

export default function useHoverCallbacks<T = Element>(
  ...[onEnter, onLeave]: UseHoverCallbacksProps<T>
): UseHoverCallbacksResult<T> {
  return { onMouseEnter: onEnter, onMouseLeave: onLeave };
}
