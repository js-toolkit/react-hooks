/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: require.resolve('@js-toolkit/configs/eslint/react'),
  ignorePatterns: ['/dist', '.eslintrc.js'],
  rules: {
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks:
          '(useAsync|useDoubleClick|useDoubleTap|useHideableState|useMemoDestructor|useObjectURL|useRafCallback|useUpdatedRefState|useUpdatedRefValue|useUpdatedState|useUpdatedValue|useUpdateEffect)',
      },
    ],
  },
};
