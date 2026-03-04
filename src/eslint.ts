/* eslint-disable import-x/no-import-module-exports */
import type { Linter } from 'eslint';

const config: Linter.Config[] = [
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

export default config;

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}
