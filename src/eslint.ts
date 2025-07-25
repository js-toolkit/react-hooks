const config: import('eslint').Linter.Config[] = [
  {
    rules: {
      'react-hooks/exhaustive-deps': [
        'error',
        {
          additionalHooks:
            '(useAsync|useDoubleClick|useDoubleTap|useHideableState|useMemoDestructor|useObjectURL|useRafCallback|useUpdatedRefState|useUpdatedRefValue|useUpdatedState|useUpdatedValue|useUpdateEffect|useAsyncEffect|useQueue)',
        },
      ],
    },
  },
];

module.exports = config;
export default config;
