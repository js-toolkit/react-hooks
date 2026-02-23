# @js-toolkit/react-hooks

[![npm package](https://img.shields.io/npm/v/@js-toolkit/react-hooks.svg?style=flat-square)](https://www.npmjs.org/package/@js-toolkit/react-hooks)
[![license](https://img.shields.io/npm/l/@js-toolkit/react-hooks.svg?style=flat-square)](https://www.npmjs.org/package/@js-toolkit/react-hooks)

Collection of reusable React hooks for state management, gestures, animation, responsive design, and common UI patterns.

## Install

```bash
yarn add @js-toolkit/react-hooks
# or
npm install @js-toolkit/react-hooks
```

## Import

```typescript
import { useToggle } from '@js-toolkit/react-hooks/useToggle';
import { useDebounceCallback } from '@js-toolkit/react-hooks/useDebounceCallback';
```

## Hooks

### State

| Hook | Description |
|------|-------------|
| `useToggle` | Boolean toggle state |
| `useRefState` | State stored in ref (no re-render) with getter/setter |
| `useExtendedState` | State with additional methods |
| `useInputState` | State for controlled inputs |
| `useIncrementalState` | Counter state |
| `useHideableState` | State with show/hide/disable |
| `useUpdateState` | State with update handler for events |
| `useUpdatedState` | State that syncs with deps |
| `useRafState` | State updates via requestAnimationFrame |
| `useQueue` | Queue data structure hook |

### Lifecycle

| Hook | Description |
|------|-------------|
| `useFirstMount` | Returns true on first mount |
| `useIsFirstMount` | Function returning mount status |
| `useIsMounted` | Function returning current mount status |
| `useUpdateEffect` | `useEffect` that skips first mount |
| `useAsyncEffect` | Async effect on next tick |
| `useMemoDestructor` | Memoized value with cleanup |

### Callbacks and Refs

| Hook | Description |
|------|-------------|
| `useRefCallback` | Stable callback reference |
| `useDebounceCallback` | Debounced callback |
| `useThrottleCallback` | Throttled callback |
| `useUpdatedRef` | Ref that updates every render |
| `useRefs` | Combine multiple refs |
| `useChainRefCallback` | Chain multiple callbacks |
| `useRafCallback` | RAF-wrapped callback |
| `useUpdate` | Force re-render |

### Gestures

| Hook | Description |
|------|-------------|
| `useLongPress` | Long press detection |
| `useDoubleClick` | Double click detection |
| `useDoubleTap` | Double tap detection |
| `usePinchZoom` | Pinch zoom gesture |
| `useHoverCallbacks` | Hover with touch device prevention |

### UI and Layout

| Hook | Description |
|------|-------------|
| `useFullscreen` | Fullscreen API management |
| `useScreenSize` | Track screen size changes |
| `useMediaQuery` | Media query hook for responsive breakpoints |
| `useLockBodyScroll` | Lock body scroll |
| `useObjectURL` | Create and manage object URLs |

### Animation

| Hook | Description |
|------|-------------|
| `useAutoToggle` | Auto-toggle with debounced deactivation |
| `useToggleDebounce` | Toggle with debounced off |
| `useSlideAnimationDirection` | Slide animation direction |
| `useMenuSlideAnimation` | Menu slide transitions |

### Async

| Hook | Description |
|------|-------------|
| `useAsync` | Manage async operations (pending/error/value) |
| `usePendingTasks` | Track pending tasks by key |

## Usage Examples

### useToggle

```typescript
import { useToggle } from '@js-toolkit/react-hooks/useToggle';

function Dialog(): React.JSX.Element {
  const [isOpen, toggle] = useToggle(false);

  return (
    <>
      <button type="button" onClick={() => toggle()}>Toggle</button>
      {isOpen && <div>Dialog content</div>}
    </>
  );
}
```

### useDebounceCallback

```typescript
import { useDebounceCallback } from '@js-toolkit/react-hooks/useDebounceCallback';

function Search(): React.JSX.Element {
  const handleSearch = useDebounceCallback((query: string) => {
    void fetch(`/api/search?q=${encodeURIComponent(query)}`);
  }, 300);

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

### useMediaQuery

```typescript
import { useMediaQuery } from '@js-toolkit/react-hooks/useMediaQuery';

function Layout(): React.JSX.Element {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>;
}
```

### useAsync

```typescript
import { useAsync } from '@js-toolkit/react-hooks/useAsync';

interface User {
  id: string;
  name: string;
}

function Profile({ userId }: { userId: string }): React.JSX.Element {
  const { value, error, pending } = useAsync(
    async () => {
      const res = await fetch(`/api/users/${userId}`);
      return (await res.json()) as User;
    },
    [userId]
  );

  if (pending) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  return <div>{value?.name}</div>;
}
```

## Repository

[https://github.com/js-toolkit/react-hooks](https://github.com/js-toolkit/react-hooks)
