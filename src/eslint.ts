const config: import('eslint').Linter.Config = {
  rules: {
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks:
          '(useAsync|useDoubleClick|useDoubleTap|useHideableState|useMemoDestructor|useMenuSlideAnimation|useObjectURL|useRafCallback|useUpdatedRefState|useUpdatedRefValue|useUpdatedState|useUpdatedValue|useUpdateEffect)',
      },
    ],
  },
};

module.exports = config;
