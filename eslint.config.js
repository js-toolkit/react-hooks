/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...require('@js-toolkit/configs/eslint/common'),
  ...require('@js-toolkit/configs/eslint/web'),

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
