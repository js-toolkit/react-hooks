/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  ...require('@js-toolkit/configs/eslint/react'),

  {
    rules: {
      'react-hooks/exhaustive-deps': [
        'error',
        {
          additionalHooks:
            '(useAsync|useDoubleClick|useDoubleTap|useHideableState|useMemoDestructor|useObjectURL|useRafCallback|useUpdatedRefState|useUpdatedRefValue|useUpdatedState|useUpdatedValue|useUpdateEffect)',
        },
      ],
    },
  },
];
