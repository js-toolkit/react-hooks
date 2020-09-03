const config: import('eslint').Linter.Config = {
  rules: {
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks:
          '(useAutoToggle|useDoubleClick|useDoubleTap|useFullscreen|useLockBodyScroll|usePendingTasks|useSetRefs|useStateChange|useStateInputChange|useToggleDebounce)',
      },
    ],
  },
};

module.exports = config;
